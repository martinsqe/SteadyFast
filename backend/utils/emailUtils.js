import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const sendEmail = async (options) => {
    try {
        let transporter;

        if (process.env.EMAIL_HOST && process.env.EMAIL_USER) {
            transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: parseInt(process.env.EMAIL_PORT) || 465,
                secure: parseInt(process.env.EMAIL_PORT) === 465,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
        } else {
            console.log("🛠️ Generating Ethereal test account for real-time inbox...");
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
        }

        const mailOptions = {
            from: `"SteadyFast Support" <support@steadyfast.com>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html,
        };

        const info = await transporter.sendMail(mailOptions);

        const testUrl = nodemailer.getTestMessageUrl(info);
        if (testUrl) {
            console.log("------------------------------------------");
            console.log("📧 Real-time Test Email Sent!");
            console.log(`🔗 VIEW INBOX: ${testUrl}`);
            console.log("------------------------------------------");

            // Write to a predictable location
            const urlFile = path.join(__dirname, "..", "last_email_url.txt");
            fs.writeFileSync(urlFile, testUrl);
        }

        return info;
    } catch (err) {
        console.error("❌ [EMAIL ERROR]:", err);
        throw err;
    }
};
