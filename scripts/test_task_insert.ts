
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testTaskInsert() {
    console.log('Attempting to insert task with fake assignee_id...');
    
    // First get a valid user to be the creator (optional, or just omit user_id)
    
    const { data, error } = await supabase
        .from('tasks')
        .insert({
            title: 'Test Task Shadow',
            status: 'Not Started',
            priority: 'Low',
            day: 'Mon',
            assignee_id: '00000000-0000-0000-0000-000000000000', // Fake UUID
            estimate_hours: 1,
            tags: []
        })
        .select();

    if (error) {
        console.error('Insert failed:', error);
    } else {
        console.log('Insert successful:', data);
        // Clean up
        await supabase.from('tasks').delete().eq('id', data[0].id);
    }
}

testTaskInsert();
