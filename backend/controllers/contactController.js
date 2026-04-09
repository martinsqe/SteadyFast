import { sendEmail } from "../utils/emailUtils.js";

export const submitContact = async (req, res) => {
  try {
    const { name, email, category, subject, message } = req.body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ success: false, message: "Name, email and message are required." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email address." });
    }

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#e2e8f0;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#1e40af,#7c3aed);padding:24px 32px;">
          <h1 style="margin:0;color:#fff;font-size:1.5rem;">SteadyFast — New Contact Message</h1>
        </div>
        <div style="padding:28px 32px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#94a3b8;width:110px;">Name</td><td style="padding:8px 0;color:#f1f5f9;font-weight:600;">${name}</td></tr>
            <tr><td style="padding:8px 0;color:#94a3b8;">Email</td><td style="padding:8px 0;color:#f1f5f9;">${email}</td></tr>
            <tr><td style="padding:8px 0;color:#94a3b8;">Category</td><td style="padding:8px 0;color:#f1f5f9;">${category || "General"}</td></tr>
            <tr><td style="padding:8px 0;color:#94a3b8;">Subject</td><td style="padding:8px 0;color:#f1f5f9;">${subject || "—"}</td></tr>
          </table>
          <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:20px 0;" />
          <p style="color:#94a3b8;margin:0 0 8px 0;font-size:0.85rem;">Message</p>
          <p style="color:#e2e8f0;line-height:1.7;background:#1e293b;border-radius:8px;padding:16px;margin:0;">${message.replace(/\n/g, "<br>")}</p>
          <p style="color:#64748b;font-size:0.78rem;margin-top:24px;">Sent via SteadyFast Contact Form · ${new Date().toUTCString()}</p>
        </div>
      </div>
    `;

    // Send to support inbox
    await sendEmail({
      email: process.env.EMAIL_USER || "mjjemba9@gmail.com",
      subject: `[SteadyFast Contact] ${category ? `[${category}] ` : ""}${subject || "New message from " + name}`,
      message: `Name: ${name}\nEmail: ${email}\nCategory: ${category}\nSubject: ${subject}\n\n${message}`,
      html,
    });

    // Auto-reply to sender
    await sendEmail({
      email,
      subject: "We received your message — SteadyFast Support",
      message: `Hi ${name},\n\nThank you for reaching out to SteadyFast. We have received your message and will get back to you within 24 hours.\n\nBest regards,\nSteadyFast Support Team`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#1e40af,#7c3aed);padding:24px 32px;border-radius:12px 12px 0 0;">
            <h1 style="margin:0;color:#fff;font-size:1.4rem;">Thank you, ${name}!</h1>
          </div>
          <div style="background:#0f172a;color:#e2e8f0;padding:28px 32px;border-radius:0 0 12px 12px;">
            <p style="line-height:1.7;">We've received your message and our team will get back to you within <strong>24 hours</strong>.</p>
            <p style="line-height:1.7;">In the meantime, if you have an urgent roadside emergency, please call us directly at <strong>+254 700 000 000</strong>.</p>
            <p style="color:#64748b;font-size:0.82rem;margin-top:28px;">SteadyFast — 24/7 Roadside Assistance</p>
          </div>
        </div>`,
    }).catch(() => {}); // Don't fail if auto-reply bounces

    res.json({ success: true, message: "Message sent successfully! We'll be in touch within 24 hours." });
  } catch (err) {
    console.error("Contact form error:", err);
    res.status(500).json({ success: false, message: "Failed to send message. Please try again." });
  }
};
