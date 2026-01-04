
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
// If I have a service role key, I can bypass RLS for testing
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCreateGoal() {
    try {
        const testGoal = {
            title: 'Test Goal ' + Date.now(),
            description: 'Testing goal creation',
        };
        console.log('Attempting to create goal:', testGoal);
        const { data, error } = await supabase
            .from('goals')
            .insert(testGoal)
            .select();
        
        if (error) {
            console.error('Failed to create goal:', error);
        } else {
            console.log('Successfully created goal:', data);
        }
    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

testCreateGoal();
