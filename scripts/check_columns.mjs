
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const tables = ['tasks', 'goals', 'profiles', 'activity_log'];
    for (const table of tables) {
        try {
            const { data, error } = await supabase.from(table).select('*').limit(1);
            if (error) {
                console.log(`${table}: Error - ${error.message}`);
            } else if (data && data.length > 0) {
                console.log(`${table}: ${Object.keys(data[0]).join(', ')}`);
            } else {
                console.log(`${table}: Empty`);
            }
        } catch (e) {
            console.log(`${table}: Exception - ${e.message}`);
        }
    }
}

check();
