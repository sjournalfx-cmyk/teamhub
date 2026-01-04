
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkGoalsSchema() {
    console.log('--- Checking Goals Table ---');
    const { data: goals, error: gError } = await supabase.from('goals').select('*').limit(1);
    if (gError) {
        console.error('Goals error:', gError);
    } else {
        if (goals.length > 0) {
            console.log('Goals columns:', Object.keys(goals[0]));
        } else {
            console.log('Goals table is empty.');
        }
    }
}

checkGoalsSchema();
