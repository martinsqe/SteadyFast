import { sendEmail } from './utils/emailUtils.js';
import dotenv from 'dotenv';
dotenv.config();

async function generateLink() {
    try {
        console.log('--- Generating Real-Time Recovery Link ---');
        const resetUrl = 'http://localhost:5173/reset-password/test-token-123';

        const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0;">
        <h2 style="color: #2563eb;">SteadyFast Test Recovery</h2>
        <p>This is a test reset email to verify the real-time inbox.</p>
        <a href="${resetUrl}">Reset Password</a>
      </div>
    `;

        await sendEmail({
            email: 'test@example.com',
            subject: 'SteadyFast Real-Time Test',
            message: 'Test link: ' + resetUrl,
            html
        });

        console.log('✅ Link generated. Check for last_email_url.txt');
    } catch (err) {
        console.error('Failed:', err);
    }
}

generateLink();
