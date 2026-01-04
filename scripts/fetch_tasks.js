
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTasks() {
    console.log('--- Fetching all tasks ---');
    const { data, error } = await supabase.from('tasks').select('*');
    if (error) {
        console.error('Error:', error.message, error.code);
    } else {
        console.log('Total tasks:', data.length);
        if (data.length > 0) {
            console.log('Sample task keys:', Object.keys(data[0]));
            console.log('Sample task data:', JSON.stringify(data[0], null, 2));
        }
    }
}

checkTasks();
