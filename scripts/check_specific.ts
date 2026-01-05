
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('--- Checking for phemelop25@gmail.com in join_requests ---');
    const { data, error } = await supabase
        .from('join_requests')
        .select('*')
        .eq('email', 'phemelop25@gmail.com');

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Found:', JSON.stringify(data, null, 2));
    }

    console.log('\n--- Checking current profiles ---');
    const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('*');

    if (pError) {
        console.error('Profiles Error:', pError);
    } else {
        profiles.forEach(p => {
            console.log(`ID: ${p.id}, Name: ${p.name}, Email: ${p.email}, Role: ${p.role}`);
        });
    }
}

check();
