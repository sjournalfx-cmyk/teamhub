
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testVerbose() {
    try {
        console.log('--- Verbose Goal Test ---');
        // 1. Check if we can select from goals (even if empty)
        const { data: selectData, error: selectError } = await supabase.from('goals').select('*');
        if (selectError) console.error('Select Error:', selectError);
        else console.log('Select successful, count:', selectData.length);

        // 2. Try to insert a goal without user_id first (to bypass FK issues if any)
        const testGoal = {
            title: 'Test Goal Verbose ' + Date.now(),
            description: 'Testing',
            milestones: [{ id: 'm1', title: 'M1', isCompleted: false }]
        };
        console.log('Attempting insert:', testGoal);
        const { data: insertData, error: insertError } = await supabase
            .from('goals')
            .insert(testGoal)
            .select();
        
        if (insertError) {
            console.error('Insert Error:', insertError);
            if (insertError.code === '42501') {
                console.log('RLS Error: Are you sure goals table has an anon policy or are you using an auth session?');
            }
        } else {
            console.log('Insert Success:', insertData);
        }
    } catch (e) {
        console.error('Unexpected exception:', e);
    }
}

testVerbose();
