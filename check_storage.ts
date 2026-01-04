
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStorage() {
    console.log('Checking storage buckets...');

    console.log('Listing all buckets...');
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
        console.error('Error listing buckets:', error.message);
        return;
    }

    if (!buckets || buckets.length === 0) {
        console.log('No buckets found. This might mean:');
        console.log('1. The buckets were not created.');
        console.log('2. You are connected to the wrong Supabase project.');
        console.log('3. RLS policies are preventing the anon key from listing buckets (though usually getBucket works).');
    } else {
        console.log(`Found ${buckets.length} buckets:`);
        buckets.forEach(b => {
            console.log(`- ID: '${b.id}', Name: '${b.name}', Public: ${b.public}`);
        });
    }

    // Check specifically for our target buckets
    const targetBuckets = ['attachments', 'avatars'];
    const missing = targetBuckets.filter(t => !buckets?.some(b => b.id === t));

    if (missing.length > 0) {
        console.log(`\nWARNING: The following required buckets are missing from the list: ${missing.join(', ')}`);
    } else {
        console.log('\nSUCCESS: All required buckets are present!');
    }
}

checkStorage();
