
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    console.log('--- Profiles Table ---');
    const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
    if (pError) console.error('Profiles error:', pError);
    else {
        console.log('Profiles columns:', profiles.length > 0 ? Object.keys(profiles[0]) : 'No data');
        console.log('Profiles data:', JSON.stringify(profiles, null, 2));
    }

    console.log('\n--- Join Requests Table ---');
    const { data: requests, error: rError } = await supabase.from('join_requests').select('*');
    if (rError) console.error('Join Requests error:', rError);
    else {
        console.log('Join Requests data:', JSON.stringify(requests, null, 2));
    }
}

debug();
