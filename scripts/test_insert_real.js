
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    console.log('--- Attempting Task Insert with assignee_id ---');
    const task = {
        title: 'Diagnostic Task 5',
        status: 'Not Started',
        priority: 'Low',
        day: 'Mon',
        estimate_hours: 1,
        tags: ['debug'],
        user_id: '131ece4c-d310-4eaa-ab3a-a04b632222ad',
        assignee_id: '131ece4c-d310-4eaa-ab3a-a04b632222ad'
    };
    
    const { data, error } = await supabase
        .from('tasks')
        .insert(task)
        .select();

    if (error) {
        console.error('Insert Error:', error);
    } else {
        console.log('Insert Success:', data);
    }
}

testInsert();
