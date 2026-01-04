
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCreateGoal() {
    try {
        const testGoal = {
            title: 'Test Goal ' + Date.now(),
            description: 'Testing goal creation',
            progress: 0,
            color: 'bg-indigo-100 text-indigo-800',
            milestones: []
        };
        console.log('Attempting to create goal:', testGoal);
        const { data, error } = await supabase
            .from('goals')
            .insert(testGoal)
            .select()
            .single();
        
        if (error) throw error;
        console.log('Successfully created goal:', data);
    } catch (error) {
        console.error('Failed to create goal:', error);
    }
}

testCreateGoal();
