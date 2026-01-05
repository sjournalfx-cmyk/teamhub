
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
    const tables = ['profiles', 'tasks', 'goals', 'join_requests', 'activity_log'];
    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            console.error(`Error checking ${table}:`, error.message);
        } else if (data && data.length > 0) {
            console.log(`Columns in ${table} table:`, Object.keys(data[0]));
        } else {
            // If table is empty, try to get columns another way
            console.log(`${table} table is empty.`);
        }
    }
}

checkColumns();
