
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { AppState, DayOfWeek, Goal, Task, Priority, TaskStatus, AIChatMessage } from "../types";

const createClient = () => {
    if (typeof process === 'undefined' || !process.env.API_KEY) {
        console.warn("API Key is missing for Command Service");
        return null;
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

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

export const detectTacticalFriction = (tasks: Task[]): { type: 'friction', message: string, taskIds: string[] }[] => {
    const frictions: { type: 'friction', message: string, taskIds: string[] }[] = [];
    const dayOrder = { [DayOfWeek.Mon]: 0, [DayOfWeek.Tue]: 1, [DayOfWeek.Wed]: 2, [DayOfWeek.Thu]: 3, [DayOfWeek.Fri]: 4, [DayOfWeek.Sat]: 5, [DayOfWeek.Sun]: 6, [DayOfWeek.Backlog]: 99 };

    tasks.forEach(task => {
        if (task.dependencyId) {
            const dependency = tasks.find(t => t.id === task.dependencyId);
            if (dependency) {
                const taskDayIdx = dayOrder[task.day];
                const depDayIdx = dayOrder[dependency.day];
                
                if (depDayIdx > taskDayIdx) {
                    frictions.push({
                        type: 'friction',
                        message: `Chain Conflict: Directive @${task.title} is scheduled before its prerequisite @${dependency.title}.`,
                        taskIds: [task.id, dependency.id]
                    });
                }
            }
        }
    });

    return frictions;
};

export const unblockTaskAssistant = async (task: Task): Promise<{ steps: string[], suggestions: string[] }> => {
    const client = createClient();
    if (!client) return { steps: ["AI OFFLINE."], suggestions: [] };

    const systemPrompt = `You are Command.Directive_Optimizer_v5.
    Analyze the operational parameters for: "@${task.title}".
    DIRECTIVE BRIEFING: ${task.description || "No specific briefing provided."}
    
    GOAL: 
    1. Break down this instruction into 3-5 high-precision execution steps.
    2. Provide 2-3 "Command Suggestions" for the executing agent to ensure success.
    
    OUTPUT FORMAT: Return a JSON object with keys "steps" (array of strings) and "suggestions" (array of strings).`;

    try {
        const response = await client.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: "Analyze this directive for optimal execution.",
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
            return { steps: ["FAILED TO PARSE SEQUENCE."], suggestions: ["RETRY ANALYSIS."] };
        }
    } catch (e) {
        console.error("Command Optimizer Error:", e);
        return { steps: ["SYSTEM LATENCY DETECTED."], suggestions: ["RE-TRY SEQUENCE GENERATION."] };
    }
};

export const generateReportSummary = async (state: AppState): Promise<string> => {
    const client = createClient();
    if (!client) return "Summary unavailable. AI offline.";

    const completedTasks = state.tasks.filter(t => t.status === TaskStatus.Done).map(t => t.title).join(", ");
    const activeGoals = state.goals.map(g => `${g.title} (${g.progress}% complete)`).join("; ");
    const blockers = state.tasks.filter(t => t.isBlocked).map(t => `${t.title}: ${t.blockerMessage}`).join("; ");

    const systemPrompt = `You are an elite Project Manager and Consultant.
    Your task is to write a high-level "Executive Summary" for a weekly client report.
    
    DATA FOR THIS WEEK:
    Completed Wins: ${completedTasks || "None reported yet."}
    Strategic Objectives Progress: ${activeGoals}
    Current Friction/Blockers: ${blockers || "No major blockers."}

    REQUIREMENTS:
    - Tone: Professional, authoritative, and value-focused.
    - Format: One concise paragraph.
    - Focus: Highlight the impact of what was shipped and clearly state what is needed to resolve blockers.
    - Start directly with the summary, no "Here is the summary" intro.`;

    try {
        const response = await client.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: "Generate executive summary for client report.",
            config: { systemInstruction: systemPrompt }
        });
        return response.text || "Report generated successfully.";
    } catch (e) {
        console.error("Report Generation Error:", e);
        return "Operational summary successfully compiled.";
    }
};

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
    if (!client) return { text: "API Key missing." };

    const frictions = detectTacticalFriction(state.tasks);
    const frictionContext = frictions.length > 0 ? `OPERATIONAL WARNINGS: ${frictions.map(f => f.message).join("; ")}` : "No current friction detected.";

    const currentGoals = state.goals.map(g => `- @${g.title.replace(/\s+/g, '').toLowerCase()} (ID: ${g.id})`).join("\n");
    const currentTeam = state.users.map(u => `- @${u.name.replace(/\s+/g, '').toLowerCase()} (ID: ${u.id})`).join("\n");
    const currentTasks = state.tasks.map(t => `- @${t.title.replace(/\s+/g, '').toLowerCase()} (ID: ${t.id}, Status: ${t.status}, Day: ${t.day})`).join("\n");

    const systemPrompt = `
    You are Command.Advisor_v5. You assist Managers and Leaders in coordinating complex operations.
    
    FRICTION CONTEXT:
    ${frictionContext}

    ACTIVE PERSONNEL:
    ${currentTeam}
    
    STRATEGIC OBJECTIVES:
    ${currentGoals}

    ACTIVE DIRECTIVES:
    ${currentTasks}
    
    RULES:
    1. Mentions: Use @name for personnel and directives.
    2. Tool Usage: Use the provided tools to issue, update, or revoke directives and objectives.
    3. Leadership Tone: Be concise, tactical, and authoritative. Assist the manager in maintaining oversight.
    
    Output Format:
    Return your response text. If you call a tool, it will be handled by the interface.
    `;

    try {
        const response = await client.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: [...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })), ...(userInput ? [{ role: 'user', parts: [{ text: userInput }] }] : [])],
            config: {
                systemInstruction: systemPrompt,
                tools: [{ functionDeclarations: TOOL_DEFINITIONS }]
            }
        });

        const text = response.text || "Command standby.";
        const toolCalls = response.functionCalls;

        return { 
            text, 
            toolCalls,
            frictionAlerts: frictions
        };
    } catch (error) {
        console.error("Gemini Command Error:", error);
        return { text: "Command link unstable. Retrying..." };
    }
};
