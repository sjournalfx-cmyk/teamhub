
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTasksColumns() {
    const columns = ['resources', 'deliverables', 'milestone_id', 'video_url', 'dependency_id'];
    
    for (const col of columns) {
        console.log(`Checking column "${col}" in tasks table...`);
        const { error } = await supabase
            .from('tasks')
            .select(col)
            .limit(1);

        if (error) {
            if (error.message.includes(`column "${col}" does not exist`)) {
                console.log(`❌ FAIL: Column "${col}" does not exist.`);
            } else {
                console.log(`⚠️  Error for "${col}":`, error.message);
            }
        } else {
            console.log(`✅ PASS: Column "${col}" exists.`);
        }
    }
}

checkTasksColumns();
