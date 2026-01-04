import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { AppState, DayOfWeek, Goal, Task, Priority, TaskStatus, AIChatMessage } from "../types";

/**
 * Create a Gemini AI client instance
 * Uses VITE_GEMINI_API_KEY from environment variables
 */
const createClient = (): GoogleGenAI | null => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
        console.warn("[GeminiService] API Key is missing. AI features will be disabled.");
        console.warn("[GeminiService] Add VITE_GEMINI_API_KEY to your .env file.");
        return null;
    }

    try {
        return new GoogleGenAI({ apiKey });
    } catch (error) {
        console.error("[GeminiService] Failed to initialize client:", error);
        return null;
    }
};

// AI Model configuration
const AI_MODELS = {
    flash: "gemini-2.0-flash",  // Fast model for quick responses
    pro: "gemini-1.5-pro"       // Pro model for complex reasoning
} as const;

// Define tools for command-level state mutation
const TOOL_DEFINITIONS: FunctionDeclaration[] = [
    {
        name: "create_directive",
        description: "Issues a new tactical directive to the team.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "The title of the directive" },
                description: { type: Type.STRING, description: "Instructional parameters and technical specs" },
                priority: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
                day: { type: Type.STRING, enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Backlog"] },
                assigneeId: { type: Type.STRING, description: "ID of the node (user) to execute the directive" },
                goalId: { type: Type.STRING, description: "Strategic objective ID for alignment" },
                estimateHours: { type: Type.NUMBER, description: "Projected time for execution" }
            },
            required: ["title", "priority", "day", "assigneeId"]
        }
    },
    {
        name: "update_directive",
        description: "Modifies an existing directive. Can shift timelines, change status, or edit parameters.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                taskId: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                priority: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
                status: { type: Type.STRING, enum: ["Not Started", "Working on it", "Done", "Stuck"] },
                day: { type: Type.STRING, enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Backlog"] },
                assigneeId: { type: Type.STRING },
                isBlocked: { type: Type.BOOLEAN },
                blockerMessage: { type: Type.STRING },
                estimateHours: { type: Type.NUMBER }
            },
            required: ["taskId"]
        }
    },
    {
        name: "delete_directive",
        description: "Rescinds an existing directive.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "The name of the directive to delete" },
                taskId: { type: Type.STRING, description: "The ID of the directive to abort" }
            },
            required: ["taskId"]
        }
    },
    {
        name: "create_strategic_objective",
        description: "Defines a new high-level strategic mission objective.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                milestones: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING }
                        }
                    }
                }
            },
            required: ["title", "description"]
        }
    }
];

/**
 * Helper to handle rate limits with retries and model fallbacks
 */
const generateContentWithRetry = async (
    client: GoogleGenAI, 
    params: any, 
    retries = 3, 
    useFallback = true
): Promise<any> => {
    try {
        return await client.models.generateContent(params);
    } catch (error: any) {
        const isRateLimit = 
            error?.status === 'RESOURCE_EXHAUSTED' || 
            error?.code === 429 || 
            (error?.message && (
                error.message.includes('429') || 
                error.message.includes('Quota exceeded') ||
                error.message.includes('RESOURCE_EXHAUSTED')
            ));

        if (isRateLimit) {
            let delay = 5000; // Default 5s
            
            // Try to extract specific delay from error message or details
            try {
                // Attempt to parse JSON if message is "ApiError: {...}"
                const rawMessage = error.message || "";
                const jsonMatch = rawMessage.match(/\{.*\}/);
                if (jsonMatch) {
                    const errorData = JSON.parse(jsonMatch[0]);
                    
                    // Look for RetryInfo in details
                    const retryInfo = errorData?.error?.details?.find(
                        (d: any) => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
                    );
                    
                    if (retryInfo?.retryDelay) {
                        // retryDelay is often a string like "14s"
                        const seconds = parseInt(retryInfo.retryDelay);
                        if (!isNaN(seconds)) {
                            delay = (seconds * 1000) + 1500; // Add buffer
                        }
                    }
                }
            } catch (e) {
                // If JSON parsing fails, try regex
                const match = error?.message?.match(/retry in ([\d\.]+)s/);
                if (match && match[1]) {
                    delay = Math.ceil(parseFloat(match[1]) * 1000) + 2000;
                }
            }
            
            // If we have retries left, wait and try again
            if (retries > 0) {
                console.warn(`[GeminiService] Rate limit hit for ${params.model}. Retrying in ${delay}ms... (${retries} retries left)`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return generateContentWithRetry(client, params, retries - 1, useFallback);
            } 
            
            // If Flash model is exhausted, try falling back to Pro model
            if (useFallback && params.model === AI_MODELS.flash) {
                console.warn(`[GeminiService] ${AI_MODELS.flash} quota potentially exhausted. Falling back to ${AI_MODELS.pro}...`);
                return generateContentWithRetry(client, { ...params, model: AI_MODELS.pro }, 1, false);
            }
        }
        
        // If not a rate limit or all retries/fallbacks failed, throw
        throw error;
    }
};

/**
 * Detects scheduling conflicts and dependency issues in tasks
 */
export const detectTacticalFriction = (tasks: Task[]): { type: 'friction', message: string, taskIds: string[] }[] => {
    const frictions: { type: 'friction', message: string, taskIds: string[] }[] = [];
    const dayOrder = {
        [DayOfWeek.Mon]: 0,
        [DayOfWeek.Tue]: 1,
        [DayOfWeek.Wed]: 2,
        [DayOfWeek.Thu]: 3,
        [DayOfWeek.Fri]: 4,
        [DayOfWeek.Sat]: 5,
        [DayOfWeek.Sun]: 6,
        [DayOfWeek.Backlog]: 99
    };

    tasks.forEach(task => {
        if (task.dependencyId) {
            const dependency = tasks.find(t => t.id === task.dependencyId);
            if (dependency) {
                const taskDayIdx = dayOrder[task.day];
                const depDayIdx = dayOrder[dependency.day];

                if (depDayIdx > taskDayIdx) {
                    frictions.push({
                        type: 'friction',
                        message: `Chain Conflict: Task "${task.title}" is scheduled before its dependency "${dependency.title}".`,
                        taskIds: [task.id, dependency.id]
                    });
                }
            }
        }
    });

    return frictions;
};

/**
 * Analyzes a task and provides step-by-step breakdown with suggestions
 */
export const unblockTaskAssistant = async (task: Task): Promise<{ steps: string[], suggestions: string[] }> => {
    const client = createClient();

    if (!client) {
        return {
            steps: ["AI service is currently unavailable.", "Please check your API key configuration."],
            suggestions: ["Configure VITE_GEMINI_API_KEY in your .env file"]
        };
    }

    const systemPrompt = `You are a Task Optimization Assistant.
    Analyze the task: "${task.title}"
    Description: ${task.description || "No description provided."}
    
    Your goals:
    1. Break down this task into 3-5 clear, actionable execution steps.
    2. Provide 2-3 practical suggestions for the person working on this task.
    
    Be concise and practical. Focus on actionable advice. 
    
    OUTPUT FORMAT: Return a JSON object with keys "steps" (array of strings) and "suggestions" (array of strings).`;

    try {
        const response = await generateContentWithRetry(client, {
            model: AI_MODELS.flash,
            contents: "Analyze this task for optimal execution.",
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        steps: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        suggestions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["steps", "suggestions"]
                }
            }
        });

        const text = response.text || "{}";
        try {
            return JSON.parse(text);
        } catch {
            console.error("[GeminiService] Failed to parse response:", text);
            return {
                steps: ["Unable to parse AI response."],
                suggestions: ["Please try again."]
            };
        }
    } catch (error) {
        console.error("[GeminiService] Task analysis error:", error);
        return {
            steps: ["AI analysis temporarily unavailable."],
            suggestions: ["Please try again later."]
        };
    }
};

/**
 * Generates an executive summary for weekly reports
 */
export const generateReportSummary = async (state: AppState): Promise<string> => {
    const client = createClient();

    if (!client) {
        return "Summary unavailable. AI service is not configured.";
    }

    const completedTasks = state.tasks
        .filter(t => t.status === TaskStatus.Done)
        .map(t => t.title)
        .join(", ");

    const activeGoals = state.goals
        .map(g => `${g.title} (${g.progress}% complete)`) 
        .join("; ");

    const blockers = state.tasks
        .filter(t => t.isBlocked)
        .map(t => `${t.title}: ${t.blockerMessage || 'No details'}`)
        .join("; ");

    const systemPrompt = `You are a professional Project Manager.
    Write a concise executive summary for a weekly report.
    
    DATA:
    - Completed Tasks: ${completedTasks || "None this week."}
    - Strategic Goals Progress: ${activeGoals || "No active goals."}
    - Current Blockers: ${blockers || "No blockers."}

    REQUIREMENTS:
    - Professional and value-focused tone
    - One concise paragraph (3-5 sentences)
    - Highlight achievements and next steps
    - Start directly with the summary
    `;

    try {
        const response = await generateContentWithRetry(client, {
            model: AI_MODELS.flash,
            contents: "Generate the executive summary.",
            config: { systemInstruction: systemPrompt }
        });
        return response.text || "Weekly progress summary generated successfully.";
    } catch (error) {
        console.error("[GeminiService] Report generation error:", error);
        return "Summary generation failed. Please review tasks manually.";
    }
};

/**
 * Interactive AI copilot for strategic assistance
 */
export const strategyCopilotResponse = async (
    state: AppState,
    history: { role: 'user' | 'model', text: string }[],
    userInput?: string
): Promise<{
    text: string,
    suggestion?: Goal,
    taskSuggestion?: Task,
    toolCalls?: any[],
    frictionAlerts?: any[]
}> => {
    const client = createClient();

    if (!client) {
        return {
            text: "AI Assistant is not available. Please configure VITE_GEMINI_API_KEY in your environment."
        };
    }

    const frictions = detectTacticalFriction(state.tasks);
    const frictionContext = frictions.length > 0
        ? `CURRENT ISSUES: ${frictions.map(f => f.message).join("; ")}`
        : "No scheduling conflicts detected.";

    const currentGoals = state.goals
        .map(g => `- ${g.title} (ID: ${g.id}, Progress: ${g.progress}%)`)
        .join("\n");

    const currentTeam = state.users
        .map(u => `- ${u.name} (ID: ${u.id}, Role: ${u.role || 'Team Member'})`)
        .join("\n");

    const currentTasks = state.tasks
        .slice(0, 20) // Limit to prevent token overflow
        .map(t => `- ${t.title} (ID: ${t.id}, Status: ${t.status}, Day: ${t.day})`)
        .join("\n");

    const systemPrompt = `
    You are an AI Assistant for team management and task coordination.
    
    ${frictionContext}

    TEAM MEMBERS:
    ${currentTeam || "No team members yet."}
    
    STRATEGIC GOALS:
    ${currentGoals || "No goals defined yet."}

    CURRENT TASKS (Recent 20):
    ${currentTasks || "No tasks yet."}
    
    GUIDELINES:
    1. Be helpful, concise, and action-oriented
    2. Use @mentions for team members and tasks when referencing them
    3. You can use tools to create, update, or delete tasks and goals
    4. Provide practical advice for project management
    5. Alert about scheduling conflicts when relevant
    `;

    try {
        const response = await generateContentWithRetry(client, {
            model: AI_MODELS.flash,
            contents: [
                ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
                ...(userInput ? [{ role: 'user' as const, parts: [{ text: userInput }] }] : [])
            ],
            config: {
                systemInstruction: systemPrompt,
                tools: [{ functionDeclarations: TOOL_DEFINITIONS }]
            }
        });

        const text = response.text || "I'm ready to help. What would you like assistance with?";
        const toolCalls = response.functionCalls;

        return {
            text,
            toolCalls,
            frictionAlerts: frictions
        };
    } catch (error: any) {
        console.error("[GeminiService] Copilot error:", error);
        
        const isRateLimit = 
            error?.status === 'RESOURCE_EXHAUSTED' || 
            error?.code === 429 || 
            (error?.message && (
                error.message.includes('429') || 
                error.message.includes('Quota exceeded') ||
                error.message.includes('RESOURCE_EXHAUSTED')
            ));

        if (isRateLimit) {
            return {
                text: "The AI service is currently at capacity or quota has been exceeded. I've tried to retry and fallback to other models, but the limit persists. Please try again in a few minutes."
            };
        }

        return {
            text: `I encountered an issue processing your request. Error: ${error?.message || "Unknown error"}. Please try again.`
        };
    }
};

/**
 * Simple chat completion for general AI queries
 */
export const simpleChat = async (prompt: string, systemInstruction?: string): Promise<string> => {
    const client = createClient();

    if (!client) {
        return "AI service is not available.";
    }

    try {
        const response = await generateContentWithRetry(client, {
            model: AI_MODELS.flash,
            contents: prompt,
            config: systemInstruction ? { systemInstruction } : undefined
        });
        return response.text || "No response generated.";
    } catch (error) {
        console.error("[GeminiService] Chat error:", error);
        return "Failed to generate response.";
    }
};

/**
 * Check if AI service is available
 */
export const isAIAvailable = (): boolean => {
    return !!import.meta.env.VITE_GEMINI_API_KEY;
};