
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testGoal() {
    console.log('--- Attempting Goal Insert ---');
    const goal = {
        title: 'Diagnostic Goal',
        description: 'Testing RLS',
        progress: 0,
        color: 'bg-blue-500',
        user_id: '131ece4c-d310-4eaa-ab3a-a04b632222ad'
    };
    
    const { data, error } = await supabase
        .from('goals')
        .insert(goal)
        .select();

    if (error) {
        console.error('Goal Error:', error);
    } else {
        console.log('Goal Success:', data);
    }
}

testGoal();
