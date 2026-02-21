const API_URL = 'http://localhost:5000/api';

async function testFlow() {
    try {
        console.log('--- Step 1: Requesting reset link ---');
        const response = await fetch(`${API_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@example.com' })
        });
        const data = await response.json();
        console.log('Forgot Password Response:', data);

        if (data.success) {
            console.log('Success triggered logic in backend.');
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

testFlow();
