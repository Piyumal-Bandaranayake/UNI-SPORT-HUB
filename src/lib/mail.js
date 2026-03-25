import nodemailer from "nodemailer";

/**
 * Sends a premium-styled login credential email to new staff.
 * @param {string} to - Recipient email.
 * @param {string} name - Recipient name.
 * @param {string} role - Role (COACH / SUB_ADMIN).
 * @param {string} password - Raw password (unhashed).
 */
export async function sendLoginDetails(to, name, role, password) {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const subject = `🚀 Access Your ${role} Account - UniSportHub`;
        const html = `
            <div style="font-family: sans-serif; background-color: #f0f2f5; padding: 40px; border-radius: 20px;">
                <div style="max-width: 500px; margin: auto; background: white; padding: 40px; border-radius: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <div style="margin-bottom: 24px;">
                        <span style="font-size: 24px; font-weight: 900; color: #111827;">Uni<span style="color: #4f46e5;">Sport</span>Hub</span>
                    </div>
                    
                    <h1 style="color: #1e293b; font-size: 24px; margin-bottom: 16px;">Welcome to the Team, ${name}!</h1>
                    <p style="color: #475569; line-height: 1.6;">Your <strong>${role.replace('_', ' ')}</strong> account has been initialized. Use the credentials below to access the secure administrative dashboard.</p>
                    
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 24px; border-radius: 16px; margin: 32px 0;">
                        <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 10px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.1em;">Login Email</p>
                        <p style="margin: 0 0 24px 0; color: #1e293b; font-weight: 700; font-size: 16px;">${to}</p>
                        
                        <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 10px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.1em;">Security Key / Password</p>
                        <p style="margin: 0; color: #4f46e5; font-family: monospace; font-size: 18px; font-weight: 700;">${password}</p>
                    </div>
                    
                    <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login" 
                       style="display: block; background-color: #4f46e5; color: white; text-align: center; padding: 18px; border-radius: 16px; text-decoration: none; font-weight: 800; text-transform: uppercase; font-size: 14px; letter-spacing: 0.05em;">
                       Access Dashboard
                    </a>
                    
                    <p style="margin-top: 32px; color: #94a3b8; font-size: 11px; text-align: center; line-height: 1.5;">This is an automated security message. Please do not reply directly. To help protect your account, we recommend changing your password after your first login.</p>
                </div>
            </div>
        `;

        const info = await transporter.sendMail({
            from: `"UniSportHub Administration" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });

        console.log("Email notifications dispatched:", info.messageId);
        return { success: true };
    } catch (error) {
        console.error("Critical: Email notification delivery failed:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Sends a premium-styled welcome email to newly registered students.
 * @param {string} to - Recipient email.
 * @param {string} name - Recipient name.
 * @param {string} universityId - Student ID.
 */
export async function sendStudentWelcome(to, name, universityId) {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const subject = `🎉 Welcome to UniSportHub, ${name}!`;
        const html = `
            <div style="font-family: sans-serif; background-color: #f0f2f5; padding: 40px; border-radius: 20px;">
                <div style="max-width: 500px; margin: auto; background: white; padding: 40px; border-radius: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <div style="margin-bottom: 24px;">
                        <span style="font-size: 24px; font-weight: 900; color: #111827;">Uni<span style="color: #4f46e5;">Sport</span>Hub</span>
                    </div>
                    
                    <h1 style="color: #1e293b; font-size: 24px; margin-bottom: 16px;">Welcome Onboard!</h1>
                    <p style="color: #475569; line-height: 1.6;">Hello <strong>${name}</strong>, your student athlete account has been successfully verified. You now have full access to university sports schedules, team registrations, and facility bookings.</p>
                    
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 24px; border-radius: 16px; margin: 32px 0;">
                        <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 10px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.1em;">University ID</p>
                        <p style="margin: 0 0 12px 0; color: #1e293b; font-weight: 700; font-size: 16px;">${universityId}</p>
                        
                        <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 10px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.1em;">Verified Email</p>
                        <p style="margin: 0; color: #1e293b; font-weight: 700;">${to}</p>
                    </div>
                    
                    <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login" 
                       style="display: block; background-color: #10b981; color: white; text-align: center; padding: 18px; border-radius: 16px; text-decoration: none; font-weight: 800; text-transform: uppercase; font-size: 14px; letter-spacing: 0.05em;">
                       Go to My Dashboard
                    </a>
                </div>
            </div>
        `;

        await transporter.sendMail({
            from: `"UniSportHub Teams" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });

        return { success: true };
    } catch (error) {
        console.error("Student welcome email failed:", error);
        return { success: false };
    }
}
