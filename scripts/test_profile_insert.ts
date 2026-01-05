
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    const randomId = crypto.randomUUID();
    console.log('Attempting to insert shadow profile with ID:', randomId);
    
    const { data, error } = await supabase
        .from('profiles')
        .insert({
            id: randomId,
            name: 'Shadow Tester',
            email: 'shadow@test.com',
            role: 'performer'
        })
        .select();

    if (error) {
        console.error('Insert failed:', error);
    } else {
        console.log('Insert successful:', data);
        // Clean up
        await supabase.from('profiles').delete().eq('id', randomId);
    }
}

testInsert();
