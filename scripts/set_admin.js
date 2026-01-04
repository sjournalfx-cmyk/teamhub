
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function makeAdmin() {
    const email = 'tester101@gmail.com'; // From list_profiles
    console.log(`Setting role to admin for ${email}...`);
    const { data, error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('email', email)
        .select();
    
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Success:', data);
    }
}

makeAdmin();
