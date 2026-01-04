
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
    const { error } = await supabase.from('tasks').select('is_scheduled').limit(1);
    if (error) {
        console.log('is_scheduled check error:', error.message);
    } else {
        console.log('Success: "is_scheduled" column exists.');
    }
}
test();
