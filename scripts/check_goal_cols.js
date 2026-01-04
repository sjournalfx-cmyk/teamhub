
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkColumns() {
    try {
        console.log('--- Checking Columns via Select ---');
        // Try to select just one column at a time to see which ones fail
        const columns = ['id', 'title', 'description', 'progress', 'color', 'user_id', 'milestones', 'created_at'];
        for (const col of columns) {
            const { error } = await supabase.from('goals').select(col).limit(0);
            if (error) {
                console.log(`Column "${col}" check: FAILED`, error.message);
            } else {
                console.log(`Column "${col}" check: PASSED`);
            }
        }
    } catch (e) {
        console.error('Unexpected exception:', e);
    }
}

checkColumns();
