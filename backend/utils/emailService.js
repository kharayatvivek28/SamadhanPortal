import dotenv from 'dotenv';

dotenv.config();

/**
 * Core helper parameter to send email via Brevo REST API
 * Bypasses Render's SMTP Port Block by using HTTP (Port 443)
 */
const sendBrevoEmail = async (to, subject, html) => {
  if (!process.env.BREVO_API_KEY) {
    console.warn("Skipping email: BREVO_API_KEY is not configured.");
    return;
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        sender: { 
          name: "Samadhan Portal", 
          email: process.env.EMAIL_USER // Best practice: must be verified in Brevo
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Brevo API Error:", errorData);
      throw new Error(`Email sending failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error("Failed to execute Brevo API call:", error.message);
  }
};

/**
 * Send an OTP verification email.
 * @param {string} to - Recipient email address
 * @param {string} otp - 6-digit OTP
 */
export const sendOtpEmail = async (to, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #1e3a5f; margin-bottom: 8px;">Samadhan Portal</h2>
      <p style="color: #555; font-size: 14px;">Use the following OTP to verify your email address:</p>
      <div style="background: #f0f4f8; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1e3a5f;">${otp}</span>
      </div>
      <p style="color: #888; font-size: 12px;">This OTP is valid for 10 minutes. Do not share it with anyone.</p>
    </div>
  `;
  await sendBrevoEmail(to, 'Verify Your Email – Samadhan Portal', html);
};

/**
 * Send a password reset email.
 * @param {string} to - Recipient email address
 * @param {string} resetUrl - Password reset URL
 */
export const sendPasswordResetEmail = async (to, resetUrl) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #1e3a5f; margin-bottom: 8px;">Password Reset Request</h2>
      <p style="color: #555; font-size: 14px;">You are receiving this email because you (or someone else) have requested the reset of a password. Please make a PUT request to the link below:</p>
      <div style="margin: 20px 0;">
        <a href="${resetUrl}" style="background-color: #1e3a5f; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
      </div>
      <p style="color: #888; font-size: 12px;">This link is valid for 10 minutes. If you did not request this, please ignore this email.</p>
    </div>
  `;
  await sendBrevoEmail(to, 'Password Reset – Samadhan Portal', html);
};

/**
 * Send complaint assignment email to citizen.
 * @param {string} to - Recipient email address
 * @param {string} complaintId - ID of complaint
 * @param {string} departmentName - Department assigned
 * @param {string} officerName - Officer assigned
 */
export const sendAssignmentEmail = async (to, complaintId, departmentName, officerName) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #1e3a5f; margin-bottom: 8px;">Complaint Assignment</h2>
      <p style="color: #555; font-size: 14px;">Your complaint <strong>${complaintId}</strong> has been assigned.</p>
      <div style="background: #f0f4f8; border-radius: 8px; padding: 20px; font-size: 14px; margin: 20px 0;">
        <p><strong>Department:</strong> ${departmentName || 'N/A'}</p>
        <p><strong>Officer:</strong> ${officerName || 'Pending'}</p>
      </div>
      <p style="color: #555; font-size: 14px;">You can track the progress on the Samadhan Portal.</p>
    </div>
  `;
  await sendBrevoEmail(to, 'Complaint Assignment Update – Samadhan Portal', html);
};

/**
 * Send complaint status update email.
 * @param {string} to - Recipient email address
 * @param {string} complaintId - ID of complaint
 * @param {string} newStatus - New status
 */
export const sendStatusUpdateEmail = async (to, complaintId, newStatus) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #1e3a5f; margin-bottom: 8px;">Complaint Updated</h2>
      <p style="color: #555; font-size: 14px;">The status of your complaint <strong>${complaintId}</strong> has been updated.</p>
      <div style="background: #f0f4f8; border-radius: 8px; padding: 20px; font-size: 14px; margin: 20px 0;">
        <p><strong>New Status:</strong> ${newStatus}</p>
      </div>
      <p style="color: #555; font-size: 14px;">Log in to the Samadhan Portal to view full details.</p>
    </div>
  `;
  await sendBrevoEmail(to, 'Complaint Status Update – Samadhan Portal', html);
};
