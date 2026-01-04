import { createClient } from '@supabase/supabase-js';
import { DatabaseError } from './errors';
import { retry } from './utils';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// Type Conversion Utilities
// ============================================

/**
 * Convert camelCase to snake_case for database operations
 */
const camelToSnake = (obj: any): any => {
    if (Array.isArray(obj)) {
        if (obj.length > 0 && typeof obj[0] === 'object' && obj[0] !== null) {
            return obj.map(camelToSnake);
        }
        return obj;
    }
    if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
        const newObj: any = {};
        for (const key in obj) {
            const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            newObj[snakeKey] = camelToSnake(obj[key]);
        }
        return newObj;
    }
    return obj;
};

/**
 * Convert snake_case to camelCase for frontend use
 */
const snakeToCamel = (obj: any): any => {
    if (Array.isArray(obj)) {
        if (obj.length > 0 && typeof obj[0] === 'object' && obj[0] !== null) {
            return obj.map(snakeToCamel);
        }
        return obj;
    }
    if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
        const newObj: any = {};
        for (const key in obj) {
            const camelKey = key.replace(/(_\w)/g, k => k[1].toUpperCase());
            newObj[camelKey] = snakeToCamel(obj[key]);
        }
        return newObj;
    }
    return obj;
};

// ============================================
// Database Column Definitions
// ============================================

const TASK_COLUMNS = [
    'id', 'title', 'description', 'priority', 'status', 'day', 'estimate_hours',
    'assignee_id', 'goal_id', 'user_id', 'tags', 'is_blocked',
    'blocker_message', 'blocker_suggestion', 'is_draft', 'is_accepted',
    'scheduled_at', 'breakdown', 'completed_steps', 'ai_suggestions',
    'milestone_id', 'video_url', 'dependency_id', 'is_scheduled',
    'resources', 'deliverables', 'completion_comment', 'review_comment', 'created_at'
] as const;

const PROFILE_COLUMNS = [
    'id', 'email', 'name', 'role', 'custom_id', 'avatar', 'bio', 'timezone',
    'status_emoji', 'status_text', 'created_at', 'custom_statuses'
] as const;

const GOAL_COLUMNS = [
    'id', 'title', 'description', 'progress', 'color', 'user_id', 'milestones', 'created_at'
] as const;

const JOIN_REQUEST_COLUMNS = [
    'id', 'email', 'role', 'status', 'invited_by', 'access_code', 'created_at'
] as const;

const ACTIVITY_LOG_COLUMNS = [
    'id', 'user_id', 'user_name', 'action', 'target_name', 'target_id', 'timestamp', 'created_at'
] as const;

/**
 * Filter object to only include known database columns
 */
function filterToKnownColumns<T extends readonly string[]>(
    data: Record<string, any>,
    knownColumns: T
): Record<string, any> {
    const filtered: Record<string, any> = {};
    knownColumns.forEach(col => {
        if (data[col] !== undefined) {
            filtered[col] = data[col];
        }
    });
    return filtered;
}

// ============================================
// Database Helper Functions
// ============================================

export const db = {
    profiles: {
        async get(id: string) {
            return retry(async () => {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) {
                    console.error('[db.profiles.get] Error:', error);
                    throw new DatabaseError(`Failed to get profile: ${error.message}`, error);
                }
                return snakeToCamel(data);
            }, { maxAttempts: 3, delayMs: 1000 });
        },

        async getAll() {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('name');

            if (error) {
                console.error('[db.profiles.getAll] Error:', error);
                throw new DatabaseError(`Failed to get profiles: ${error.message}`, error);
            }
            return (data || []).map(snakeToCamel);
        },

        async getByCustomId(customId: string) {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('custom_id', customId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null; // Not found
                console.warn('[db.profiles.getByCustomId] Error:', error);
                return null;
            }
            return snakeToCamel(data);
        },

        async getByEmail(email: string) {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('email', email)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null; // Not found
                console.warn('[db.profiles.getByEmail] Error:', error);
                return null;
            }
            return snakeToCamel(data);
        },

        async update(id: string, updates: any) {
            const snakeUpdates = camelToSnake(updates);
            const filteredUpdates = filterToKnownColumns(snakeUpdates, PROFILE_COLUMNS);

            const { error } = await supabase
                .from('profiles')
                .update(filteredUpdates)
                .eq('id', id);

            if (error) {
                console.error('[db.profiles.update] Error:', error);
                throw new DatabaseError(`Failed to update profile: ${error.message}`, error);
            }
        },

        async delete(id: string) {
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('[db.profiles.delete] Error:', error);
                throw new DatabaseError(`Failed to delete profile: ${error.message}`, error);
            }
        }
    },

    tasks: {
        async getAll() {
            return retry(async () => {
                const { data, error } = await supabase
                    .from('tasks')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('[db.tasks.getAll] Error:', error);
                    throw new DatabaseError(`Failed to get tasks: ${error.message}`, error);
                }
                return (data || []).map(snakeToCamel);
            }, { maxAttempts: 2, delayMs: 500 });
        },

        async create(task: any) {
            const snakeTask = camelToSnake(task);
            const filteredTask = filterToKnownColumns(snakeTask, TASK_COLUMNS);

            console.log('[db.tasks.create] Creating task:', filteredTask);

            const { data, error } = await supabase
                .from('tasks')
                .insert(filteredTask)
                .select()
                .single();

            if (error) {
                console.error('[db.tasks.create] Error:', error);
                throw new DatabaseError(`Failed to create task: ${error.message}`, error);
            }

            console.log('[db.tasks.create] Task created successfully:', data);
            return snakeToCamel(data);
        },

        async update(id: string, updates: any) {
            const snakeUpdates = camelToSnake(updates);
            const filteredUpdates = filterToKnownColumns(snakeUpdates, TASK_COLUMNS);

            const { error } = await supabase
                .from('tasks')
                .update(filteredUpdates)
                .eq('id', id);

            if (error) {
                console.error('[db.tasks.update] Error:', error);
                throw new DatabaseError(`Failed to update task: ${error.message}`, error);
            }
        },

        async delete(id: string) {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('[db.tasks.delete] Error:', error);
                throw new DatabaseError(`Failed to delete task: ${error.message}`, error);
            }
        },

        async getById(id: string) {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null;
                console.error('[db.tasks.getById] Error:', error);
                throw new DatabaseError(`Failed to get task: ${error.message}`, error);
            }
            return snakeToCamel(data);
        }
    },

    goals: {
        async getAll() {
            return retry(async () => {
                const { data, error } = await supabase
                    .from('goals')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('[db.goals.getAll] Error:', error);
                    throw new DatabaseError(`Failed to get goals: ${error.message}`, error);
                }
                return (data || []).map(snakeToCamel);
            }, { maxAttempts: 2, delayMs: 500 });
        },

        async create(goal: any) {
            console.log('[db.goals.create] Incoming goal:', goal);

            const snakeGoal = camelToSnake(goal);
            const filteredGoal = filterToKnownColumns(snakeGoal, GOAL_COLUMNS);

            console.log('[db.goals.create] Filtered goal to DB:', filteredGoal);

            const { data, error } = await supabase
                .from('goals')
                .insert(filteredGoal)
                .select()
                .single();

            if (error) {
                console.error('[db.goals.create] Error:', error);
                throw new DatabaseError(`Failed to create goal: ${error.message}`, error);
            }

            console.log('[db.goals.create] Goal created successfully:', data);
            return snakeToCamel(data);
        },

        async update(id: string, updates: any) {
            const snakeUpdates = camelToSnake(updates);
            const filteredUpdates = filterToKnownColumns(snakeUpdates, GOAL_COLUMNS);

            const { error } = await supabase
                .from('goals')
                .update(filteredUpdates)
                .eq('id', id);

            if (error) {
                console.error('[db.goals.update] Error:', error);
                throw new DatabaseError(`Failed to update goal: ${error.message}`, error);
            }
        },

        async delete(id: string) {
            const { error } = await supabase
                .from('goals')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('[db.goals.delete] Error:', error);
                throw new DatabaseError(`Failed to delete goal: ${error.message}`, error);
            }
        },

        async getById(id: string) {
            const { data, error } = await supabase
                .from('goals')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null;
                console.error('[db.goals.getById] Error:', error);
                throw new DatabaseError(`Failed to get goal: ${error.message}`, error);
            }
            return snakeToCamel(data);
        }
    },

    joinRequests: {
        async getAll() {
            const { data, error } = await supabase
                .from('join_requests')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('[db.joinRequests.getAll] Error:', error);
                // Return empty array instead of throwing for non-critical table
                return [];
            }
            return (data || []).map(snakeToCamel);
        },

        async create(request: any) {
            const snakeRequest = camelToSnake(request);
            const filteredRequest = filterToKnownColumns(snakeRequest, JOIN_REQUEST_COLUMNS);

            const { data, error } = await supabase
                .from('join_requests')
                .insert(filteredRequest)
                .select()
                .single();

            if (error) {
                console.error('[db.joinRequests.create] Error:', error);
                throw new DatabaseError(`Failed to create join request: ${error.message}`, error);
            }
            return snakeToCamel(data);
        },

        async upsert(request: any) {
            const snakeRequest = camelToSnake(request);
            const filteredRequest = filterToKnownColumns(snakeRequest, JOIN_REQUEST_COLUMNS);

            const { data, error } = await supabase
                .from('join_requests')
                .upsert(filteredRequest, { onConflict: 'email' })
                .select()
                .single();

            if (error) {
                console.error('[db.joinRequests.upsert] Error:', error);
                throw new DatabaseError(`Failed to upsert join request: ${error.message}`, error);
            }
            return snakeToCamel(data);
        },

        async update(id: string, updates: any) {
            const snakeUpdates = camelToSnake(updates);

            const { error } = await supabase
                .from('join_requests')
                .update(snakeUpdates)
                .eq('id', id);

            if (error) {
                console.error('[db.joinRequests.update] Error:', error);
                throw new DatabaseError(`Failed to update join request: ${error.message}`, error);
            }
        },

        async delete(id: string) {
            const { error } = await supabase
                .from('join_requests')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('[db.joinRequests.delete] Error:', error);
                throw new DatabaseError(`Failed to delete join request: ${error.message}`, error);
            }
        },

        async getByEmail(email: string) {
            const { data, error } = await supabase
                .from('join_requests')
                .select('*')
                .eq('email', email)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null;
                console.warn('[db.joinRequests.getByEmail] Error:', error);
                return null;
            }
            return snakeToCamel(data);
        },

        async getByAccessCode(accessCode: string) {
            const { data, error } = await supabase
                .from('join_requests')
                .select('*')
                .eq('access_code', accessCode)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null;
                console.warn('[db.joinRequests.getByAccessCode] Error:', error);
                return null;
            }
            return snakeToCamel(data);
        }
    },

    activityLog: {
        async getAll(limit: number = 50) {
            return retry(async () => {
                const { data, error } = await supabase
                    .from('activity_log')
                    .select('*')
                    .order('timestamp', { ascending: false })
                    .limit(limit);

                if (error) {
                    console.error('[db.activityLog.getAll] Error:', error);
                    // Return empty array for non-critical data
                    return [];
                }
                return (data || []).map(snakeToCamel);
            }, { maxAttempts: 2, delayMs: 500 });
        },

        async create(event: any) {
            const snakeEvent = camelToSnake(event);
            const filteredEvent = filterToKnownColumns(snakeEvent, ACTIVITY_LOG_COLUMNS);

            const { error } = await supabase
                .from('activity_log')
                .insert(filteredEvent);

            if (error) {
                // Don't throw for activity log - it's non-critical
                console.error('[db.activityLog.create] Error (non-critical):', error);
            }
        }
    },

    storage: {
        async uploadFile(bucket: string, path: string, file: File) {
            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(path, file, {
                    upsert: true,
                    cacheControl: '3600'
                });

            if (error) {
                console.error('[db.storage.uploadFile] Error:', error);
                let message = error.message;
                if (message.includes('bucket not found') || message.includes('Bucket not found')) {
                    message = `Storage bucket "${bucket}" not found. Please ensure it is created in the Supabase dashboard and set to public.`;
                }
                throw new DatabaseError(message, error);
            }

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(data.path);

            return publicUrl;
        },

        async deleteFile(bucket: string, path: string) {
            const { error } = await supabase.storage
                .from(bucket)
                .remove([path]);

            if (error) {
                console.error('[db.storage.deleteFile] Error:', error);
                throw new DatabaseError(`Failed to delete file: ${error.message}`, error);
            }
        },

        getPublicUrl(bucket: string, path: string): string {
            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(path);
            return publicUrl;
        }
    },

    // ============================================
    // Team-scoped data fetching
    // ============================================

    /**
     * Get tasks created by or assigned to a specific user/team
     */
    async getTasksByUser(userId: string) {
        return retry(async () => {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .or(`user_id.eq.${userId},assignee_id.eq.${userId}`)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('[db.getTasksByUser] Error:', error);
                throw new DatabaseError(`Failed to get user tasks: ${error.message}`, error);
            }
            return (data || []).map(snakeToCamel);
        }, { maxAttempts: 2, delayMs: 500 });
    },

    /**
     * Get goals created by a specific user
     */
    async getGoalsByUser(userId: string) {
        return retry(async () => {
            const { data, error } = await supabase
                .from('goals')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('[db.getGoalsByUser] Error:', error);
                throw new DatabaseError(`Failed to get user goals: ${error.message}`, error);
            }
            return (data || []).map(snakeToCamel);
        }, { maxAttempts: 2, delayMs: 500 });
    },

    /**
     * Get team members (profiles) that were invited by a specific manager
     * or the manager themselves
     */
    async getTeamMembers(managerId: string) {
        return retry(async () => {
            // For admins, we want to show all performers in the system plus the admin themselves.
            // This ensures no one is "lost" if join requests aren't perfectly synced.
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .or(`id.eq.${managerId},role.eq.performer`)
                .order('name');

            if (error) {
                console.error('[db.getTeamMembers] Error:', error);
                // Fallback: at least return the manager themselves
                const { data: managerData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', managerId)
                    .single();
                return managerData ? [snakeToCamel(managerData)] : [];
            }

            return (data || []).map(snakeToCamel);
        }, { maxAttempts: 2, delayMs: 500 });
    },

    /**
     * Get pending join requests created by a specific manager
     */
    async getPendingRequestsByManager(managerId: string) {
        return retry(async () => {
            const { data, error } = await supabase
                .from('join_requests')
                .select('*')
                .eq('invited_by', managerId)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('[db.getPendingRequestsByManager] Error:', error);
                return [];
            }
            return (data || []).map(snakeToCamel);
        }, { maxAttempts: 2, delayMs: 500 });
    },

    /**
     * Get join requests where the user is the invitee (for team members to see their requests)
     */
    async getJoinRequestsByEmail(email: string) {
        return retry(async () => {
            const { data, error } = await supabase
                .from('join_requests')
                .select('*')
                .eq('email', email)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('[db.getJoinRequestsByEmail] Error:', error);
                return [];
            }
            return (data || []).map(snakeToCamel);
        }, { maxAttempts: 2, delayMs: 500 });
    }
};

// Export types for external use
export type Database = typeof db;

