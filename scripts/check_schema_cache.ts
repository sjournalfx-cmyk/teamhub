
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('Testing if API accepts "custom_id" column...');
    
    // Random ID to avoid conflicts
    const randomId = crypto.randomUUID();
    
    // Attempt to insert a row with custom_id
    const { error } = await supabase
        .from('profiles')
        .insert({
            id: randomId,
            email: 'cache_test@example.com',
            custom_id: 'CACHE-TEST',
            role: 'performer' 
        });

    if (error) {
        if (error.message.includes("Could not find the 'custom_id' column")) {
            console.log('❌ FAIL: The API still cannot see the "custom_id" column.');
            console.log('   The Database Schema Cache needs to be reloaded.');
        } else {
            console.log('⚠️  Other Error:', error.message);
            // If it's a foreign key violation (auth.users), it actually means the column check PASSED!
            // Because PostgREST checks columns *before* constraints.
            if (error.code === '23503') { // foreign_key_violation
                 console.log('✅ PASS: API found the column (failed on User ID constraint, which is expected and good).');
            }
        }
    } else {
        console.log('✅ PASS: Insert successful. The API sees the column.');
        // Cleanup
        await supabase.from('profiles').delete().eq('id', randomId);
    }
}

checkSchema();
