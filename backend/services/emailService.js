// ============================================
// PolicySphere AI — Email Service
// ============================================

import nodemailer from 'nodemailer';

const isTestMode = process.env.NODE_ENV !== 'production';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'test@ethereal.email',
    pass: process.env.SMTP_PASS || 'testpassword'
  }
});

export async function sendPasswordResetEmail(email, resetToken) {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; background: #f9f7f4; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; }
        .logo { font-size: 24px; font-weight: 800; color: #988065; margin-bottom: 24px; }
        .title { font-size: 20px; font-weight: 600; color: #2c2722; margin-bottom: 16px; }
        .content { color: #5a5348; line-height: 1.6; margin-bottom: 24px; }
        .button { display: inline-block; background: #988065; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; }
        .footer { color: #8f877b; font-size: 12px; margin-top: 24px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">PolicySphere AI</div>
        <div class="title">Reset Your Password</div>
        <div class="content">
          <p>You requested to reset your password. Click the button below to create a new password:</p>
          <p style="text-align: center; margin: 24px 0;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
        <div class="footer">
          PolicySphere AI — Autonomous Decision Engine for Policy Risk Analysis
        </div>
      </div>
    </body>
    </html>
  `;

  if (isTestMode) {
    console.log(`[TEST MODE] Password reset email would be sent to: ${email}`);
    console.log(`[TEST MODE] Reset URL: ${resetUrl}`);
    return { testMode: true, url: resetUrl };
  }

  try {
    const info = await transporter.sendMail({
      from: '"PolicySphere AI" <noreply@policysphere.ai>',
      to: email,
      subject: 'Reset Your Password - PolicySphere AI',
      html: htmlContent
    });
    
    console.log(`Password reset email sent to ${email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw error;
  }
}

export async function sendWelcomeEmail(email, username) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; background: #f9f7f4; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; }
        .logo { font-size: 24px; font-weight: 800; color: #988065; margin-bottom: 24px; }
        .title { font-size: 20px; font-weight: 600; color: #2c2722; margin-bottom: 16px; }
        .content { color: #5a5348; line-height: 1.6; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">PolicySphere AI</div>
        <div class="title">Welcome, ${username}!</div>
        <div class="content">
          <p>Thank you for joining PolicySphere AI.</p>
          <p>You can now:</p>
          <ul>
            <li>Analyze policy risks</li>
            <li>Use document analyzer</li>
            <li>Ask AI questions about policies</li>
            <li>Save and compare scenarios</li>
          </ul>
        </div>
      </div>
    </body>
    </html>
  `;

  if (isTestMode) {
    console.log(`[TEST MODE] Welcome email would be sent to: ${email}`);
    return { testMode: true };
  }

  try {
    const info = await transporter.sendMail({
      from: '"PolicySphere AI" <noreply@policysphere.ai>',
      to: email,
      subject: 'Welcome to PolicySphere AI',
      html: htmlContent
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { success: false };
  }
}

export async function sendAnalysisReport(email, reportData) {
  console.log(`[INFO] Report email would be sent to: ${email}`, reportData);
  return { success: true, testMode: true };
}