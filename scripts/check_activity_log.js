
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkActivityLog() {
    console.log('--- Checking Activity Log Table ---');
    const { data, error } = await supabase.from('activity_log').select('*').limit(1);
    if (error) {
        console.error('Activity Log error:', error);
    } else {
        if (data.length > 0) {
            console.log('Activity Log columns:', Object.keys(data[0]));
        } else {
            console.log('Activity Log table is empty.');
        }
    }
}

checkActivityLog();
