
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    console.log('--- Checking Profiles Table ---');
    const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
    if (pError) {
        console.error('Profiles error:', pError);
    } else {
        console.log('Profiles count:', profiles.length);
        if (profiles.length > 0) {
            console.log('Profiles columns:', Object.keys(profiles[0]));
            console.log('Profiles sample:', JSON.stringify(profiles[0], null, 2));
        }
    }

    console.log('\n--- Checking Join Requests Table ---');
    const { data: requests, error: rError } = await supabase.from('join_requests').select('*');
    if (rError) {
        console.error('Join Requests error:', rError);
    } else {
        console.log('Join Requests count:', requests.length);
        console.log('Join Requests data:', JSON.stringify(requests, null, 2));
    }
}

debug();
