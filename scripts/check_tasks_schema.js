
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTasksSchema() {
    console.log('--- Checking Tasks Table ---');
    try {
        const { data: tasks, error: tError } = await supabase.from('tasks').select('*').limit(1);
        if (tError) {
            console.error('Tasks error:', tError);
        } else {
            console.log('Tasks sample found:', tasks.length > 0);
            if (tasks.length > 0) {
                console.log('Tasks columns:', Object.keys(tasks[0]));
                console.log('Tasks sample:', JSON.stringify(tasks[0], null, 2));
            } else {
                console.log('Tasks table is empty.');
            }
        }
    } catch (err) {
        console.error('Execution error:', err);
    }
}

checkTasksSchema();
