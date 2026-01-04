
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
    console.log('--- Tasks Columns ---');
    const { data: tasksData, error: tasksError } = await supabase.from('tasks').select('*').limit(1);
    if (tasksError) console.error('Tasks Error:', tasksError);
    else if (tasksData && tasksData.length > 0) console.log(Object.keys(tasksData[0]));
    else console.log('Tasks table is empty or inaccessible');

    console.log('\n--- Goals Columns ---');
    const { data: goalsData, error: goalsError } = await supabase.from('goals').select('*').limit(1);
    if (goalsError) console.error('Goals Error:', goalsError);
    else if (goalsData && goalsData.length > 0) console.log(Object.keys(goalsData[0]));
    else console.log('Goals table is empty or inaccessible');
}

checkColumns();
