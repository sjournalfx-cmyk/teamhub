
import { db } from './lib/supabase.js';
import dotenv from 'dotenv';
dotenv.config();

async function testCreateGoal() {
    try {
        const testGoal = {
            title: 'Test Goal ' + Date.now(),
            description: 'Testing goal creation',
            progress: 0,
            color: 'bg-indigo-100 text-indigo-800',
            milestones: []
        };
        console.log('Attempting to create goal:', testGoal);
        const created = await db.goals.create(testGoal);
        console.log('Successfully created goal:', created);
    } catch (error) {
        console.error('Failed to create goal:', error);
    }
}

testCreateGoal();
