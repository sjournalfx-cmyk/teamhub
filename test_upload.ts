
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpload() {
    console.log('Testing upload to "attachments" bucket...');

    const fileName = `test_${Date.now()}.txt`;
    const fileContent = 'This is a test file to verify Supabase Storage is working.';

    // 1. Try to upload
    const { data, error } = await supabase.storage
        .from('attachments')
        .upload(fileName, fileContent, {
            contentType: 'text/plain',
            upsert: true
        });

    if (error) {
        console.error('❌ Upload failed:', error.message);
        console.error('Error details:', error);

        if (error.message.includes('Bucket not found')) {
            console.log('\nPOSSIBLE CAUSE: The bucket name "attachments" does not match exactly, or you are connected to the wrong project.');
            console.log(`Current Project URL: ${supabaseUrl}`);
        } else if (error.message.includes('new row violates row-level security policy')) {
            console.log('\nPOSSIBLE CAUSE: RLS Policies are blocking the upload.');
            console.log('Make sure you have the "Enable insert access for authenticated users only" policy (if you are logged in) OR a public upload policy.');
            console.log('Note: This script runs as an ANONYMOUS user unless we sign in.');
        }
    } else {
        console.log('✅ Upload successful!');
        console.log('Path:', data.path);

        // 2. Try to get public URL
        const { data: publicUrlData } = supabase.storage
            .from('attachments')
            .getPublicUrl(fileName);

        console.log('Public URL:', publicUrlData.publicUrl);

        // 3. Clean up (delete the file)
        /*
        const { error: deleteError } = await supabase.storage
            .from('attachments')
            .remove([fileName]);
            
        if (deleteError) console.error('Warning: Could not delete test file:', deleteError.message);
        else console.log('Test file deleted.');
        */
    }
}

testUpload();
