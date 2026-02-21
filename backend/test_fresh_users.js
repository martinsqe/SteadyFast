const API_URL = 'http://localhost:5000/api';

async function verifyRoleFlow(email, name, role) {
    try {
        console.log(`\n--- Testing ${role} Flow [${email}] ---`);

        // 1. Register fresh user
        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password: 'password123', role })
        });
        const regData = await regRes.json();
        if (regRes.status === 201 || (regRes.status === 400 && regData.message.includes('exists'))) {
            console.log(`Step 1: User ready (${regRes.status === 201 ? 'Created' : 'Existing'})`);
        } else {
            console.error('Step 1 failed:', regData);
            return;
        }

        // 2. Request Reset
        const forgotRes = await fetch(`${API_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const forgotData = await forgotRes.json();
        console.log('Step 2: Forgot Password triggered:', forgotData.message);

        // Note: To truly verify the reset in a script without direct DB access here, 
        // I would need to find the token. In this environment, I'll leverage db_verify.js logic 
        // or just assume if status is 200, the controller logic (which I verified in consolidated_verify.js) works.
        // However, I want a REAL E2E verification. I'll use consolidated logic for the "Reset" part.
    } catch (err) {
        console.error('Error:', err.message);
    }
}

async function run() {
    await verifyRoleFlow('fresh_client@test.com', 'Fresh Client', 'client');
    await verifyRoleFlow('fresh_mechanic@test.com', 'Fresh Mechanic', 'mechanic');
}

run();
