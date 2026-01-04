
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const DUMMY_EMAILS = [
    'sarah@example.com',
    'mike@example.com',
    'elena@example.com',
    'chen@example.com',
    'ross@example.com'
];

async function cleanup() {
    console.log('Starting cleanup of dummy data...');

    // 1. Delete from tasks where assignee is dummy or creator is dummy (hard to know creator without IDs)
    // We'll just focus on profiles and join_requests first as that's what shows in the team list.

    for (const email of DUMMY_EMAILS) {
        console.log(`Cleaning up ${email}...`);
        
        // Find profile
        const { data: profile } = await supabase.from('profiles').select('id').eq('email', email).single();
        
        if (profile) {
            console.log(`Found profile for ${email} with ID ${profile.id}. Clearing tasks...`);
            // Clear tasks
            await supabase.from('tasks').update({ assignee_id: null }).eq('assignee_id', profile.id);
            // Delete profile
            const { error: pErr } = await supabase.from('profiles').delete().eq('id', profile.id);
            if (pErr) console.error(`Error deleting profile ${email}:`, pErr);
            else console.log(`Deleted profile for ${email}`);
        }

        // Delete join requests
        const { error: jErr } = await supabase.from('join_requests').delete().eq('email', email);
        if (jErr) console.error(`Error deleting join request ${email}:`, jErr);
        else console.log(`Deleted join requests for ${email}`);
    }

    console.log('Cleanup complete.');
}

cleanup();
