
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function setup() {
    console.log('Checking tasks table columns...');
    const { data: taskData, error: taskError } = await supabase.from('tasks').select('*').limit(1);
    if (taskError) console.error('Tasks error:', taskError);
    else if (taskData && taskData.length > 0) console.log('Tasks columns:', Object.keys(taskData[0]));

    console.log('Checking goals table columns...');
    const { data: goalData, error: goalError } = await supabase.from('goals').select('*').limit(1);
    if (goalError) console.error('Goals error:', goalError);
    else if (goalData && goalData.length > 0) console.log('Goals columns:', Object.keys(goalData[0]));

    console.log('Creating join_requests table...');
    // Note: We can't easily create tables via the JS client unless we use RPC or have a specific setup.
    // But we can try to insert a dummy record to see if it exists, or just assume we need to tell the user to create it.
    // Actually, I'll try to use the SQL API if available, but usually it's not.
    // I'll just check if it exists.
    const { error: jrError } = await supabase.from('join_requests').select('*').limit(1);
    if (jrError && jrError.code === '42P01') {
        console.log('join_requests table does not exist. Please create it in Supabase SQL Editor:');
        console.log(`
CREATE TABLE join_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'performer',
    status TEXT NOT NULL DEFAULT 'pending',
    invited_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
        `);
    } else {
        console.log('join_requests table exists or another error occurred:', jrError?.message);
    }
}

setup();
