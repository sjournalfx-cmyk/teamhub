import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database helper functions
const camelToSnake = (obj: any) => {
    if (!obj) return obj;
    const newObj: any = {};
    for (const key in obj) {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        newObj[snakeKey] = obj[key];
    }
    return newObj;
};

const snakeToCamel = (obj: any) => {
    if (!obj) return obj;
    const newObj: any = {};
    for (const key in obj) {
        const camelKey = key.replace(/(_\w)/g, k => k[1].toUpperCase());
        newObj[camelKey] = obj[key];
    }
    return newObj;
};

export const db = {
    profiles: {
        async get(id: string) {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', id)
                .single();
            if (error) throw error;
            return snakeToCamel(data);
        },
        async getAll() {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('name');
            if (error) throw error;
            return data.map(snakeToCamel);
        },
        async getByCustomId(customId: string) {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('custom_id', customId)
                .single();
            if (error) return null;
            return snakeToCamel(data);
        },
        async getByEmail(email: string) {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('email', email)
                .single();
            if (error) return null;
            return snakeToCamel(data);
        },
        async update(id: string, updates: any) {
            const snakeUpdates = camelToSnake(updates);
            const { error } = await supabase
                .from('profiles')
                .update(snakeUpdates)
                .eq('id', id);
            if (error) throw error;
        },
        async delete(id: string) {
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', id);
            if (error) throw error;
        }
    },
    tasks: {
        async getAll() {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data.map(snakeToCamel);
        },
        async create(task: any) {
            const snakeTask = camelToSnake(task);
            // Remove id if it's a temporary one starting with 't'
            if (snakeTask.id && String(snakeTask.id).startsWith('t')) {
                delete snakeTask.id;
            }
            const { data, error } = await supabase
                .from('tasks')
                .insert(snakeTask)
                .select()
                .single();
            if (error) throw error;
            return snakeToCamel(data);
        },
        async update(id: string, updates: any) {
            const snakeUpdates = camelToSnake(updates);
            const { error } = await supabase
                .from('tasks')
                .update(snakeUpdates)
                .eq('id', id);
            if (error) throw error;
        },
        async delete(id: string) {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', id);
            if (error) throw error;
        }
    },
    goals: {
        async getAll() {
            const { data, error } = await supabase
                .from('goals')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data.map(snakeToCamel);
        },
        async create(goal: any) {
            const snakeGoal = camelToSnake(goal);
            if (snakeGoal.id && String(snakeGoal.id).startsWith('g')) {
                delete snakeGoal.id;
            }
            const { data, error } = await supabase
                .from('goals')
                .insert(snakeGoal)
                .select()
                .single();
            if (error) throw error;
            return snakeToCamel(data);
        },
        async update(id: string, updates: any) {
            const snakeUpdates = camelToSnake(updates);
            const { error } = await supabase
                .from('goals')
                .update(snakeUpdates)
                .eq('id', id);
            if (error) throw error;
        },
        async delete(id: string) {
            const { error } = await supabase
                .from('goals')
                .delete()
                .eq('id', id);
            if (error) throw error;
        }
    },
    joinRequests: {
        async getAll() {
            const { data, error } = await supabase
                .from('join_requests')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data.map(snakeToCamel);
        },
        async create(request: any) {
            const snakeRequest = camelToSnake(request);
            const { data, error } = await supabase
                .from('join_requests')
                .insert(snakeRequest)
                .select()
                .single();
            if (error) throw error;
            return snakeToCamel(data);
        },
        async update(id: string, updates: any) {
            const snakeUpdates = camelToSnake(updates);
            const { error } = await supabase
                .from('join_requests')
                .update(snakeUpdates)
                .eq('id', id);
            if (error) throw error;
        },
        async delete(id: string) {
            const { error } = await supabase
                .from('join_requests')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
        async getByEmail(email: string) {
            const { data, error } = await supabase
                .from('join_requests')
                .select('*')
                .eq('email', email)
                .single();
            if (error) return null;
            return snakeToCamel(data);
        }
    },
    activityLog: {
        async getAll() {
            const { data, error } = await supabase
                .from('activity_log')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(50);
            if (error) throw error;
            return data.map(snakeToCamel);
        },
        async create(event: any) {
            const snakeEvent = camelToSnake(event);
            const { error } = await supabase
                .from('activity_log')
                .insert(snakeEvent);
            if (error) throw error;
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
            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(data.path);

            return publicUrl;
        },
        async deleteFile(bucket: string, path: string) {
            const { error } = await supabase.storage
                .from(bucket)
                .remove([path]);
            if (error) throw error;
        }
    }
};
