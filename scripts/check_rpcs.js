
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRPCs() {
    // This is hard to do via the client without knowing names, 
    // but we can try some common ones or check if we can query the rpc info.
    // Usually we can't.
    console.log('Checking for common RPCs...');
    const commonRPCs = ['exec_sql', 'run_sql', 'get_columns'];
    for (const rpc of commonRPCs) {
        const { error } = await supabase.rpc(rpc, { some_param: 'test' });
        console.log(`RPC ${rpc}: ${error ? error.code : 'exists?'}`);
    }
}

checkRPCs();
