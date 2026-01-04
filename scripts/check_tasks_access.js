
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTasks() {
    const { data, error } = await supabase.from('tasks').select('*');
    if (error) {
        console.error('Error fetching tasks:', error);
    } else {
        console.log('Tasks in DB:', data.length);
    }
}

checkTasks();
