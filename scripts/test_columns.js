
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    const userId = '131ece4c-d310-4eaa-ab3a-a04b632222ad'; // Valid user ID from list_profiles.js

    console.log('--- Test 1: Minimal Task (known columns) ---');
    const minimalTask = {
        title: 'Minimal Task',
        user_id: userId,
        priority: 'Medium',
        status: 'Not Started',
        day: 'Mon'
    };
    const { data: data1, error: error1 } = await supabase.from('tasks').insert(minimalTask).select();
    if (error1) console.error('Test 1 Error:', error1.message, error1.code);
    else console.log('Test 1 Success:', data1[0].id);

    console.log('\n--- Test 2: Task with "resources" column ---');
    const taskWithResources = {
        title: 'Task with Resources',
        user_id: userId,
        resources: []
    };
    const { data: data2, error: error2 } = await supabase.from('tasks').insert(taskWithResources).select();
    if (error2) console.error('Test 2 Error:', error2.message, error2.code);
    else console.log('Test 2 Success:', data2[0].id);
}

testInsert();
