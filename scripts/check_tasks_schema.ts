
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTasksSchema() {
    console.log('--- Checking Tasks Table ---');
    const { data: tasks, error: tError } = await supabase.from('tasks').select('*').limit(1);
    if (tError) {
        console.error('Tasks error:', tError);
    } else {
        console.log('Tasks sample found:', tasks.length > 0);
        if (tasks.length > 0) {
            console.log('Tasks columns:', Object.keys(tasks[0]));
            console.log('Tasks sample:', JSON.stringify(tasks[0], null, 2));
        } else {
            // Try to get columns even if no rows
            const { data: cols, error: cError } = await supabase.rpc('get_column_names', { table_name: 'tasks' });
            if (cError) {
                console.log('Could not get columns via RPC, table might be empty and no RPC available.');
            } else {
                console.log('Columns via RPC:', cols);
            }
        }
    }
}

checkTasksSchema();
