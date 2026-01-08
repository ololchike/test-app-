import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export interface BookingEmailData {
  to: string
  bookingReference: string
  customerName: string
  tourTitle: string
  startDate: string
  endDate: string
  adults: number
  children: number
  totalAmount: number
  agentName: string
  pdfBuffer?: Buffer | Uint8Array
}

export interface VerificationEmailData {
  to: string
  name: string
  token: string
}

export interface PasswordResetEmailData {
  to: string
  name: string
  token: string
}

export interface PasswordChangedEmailData {
  to: string
  name: string
}

export async function sendBookingConfirmationEmail(data: BookingEmailData) {
  const {
    to,
    bookingReference,
    customerName,
    tourTitle,
    startDate,
    endDate,
    adults,
    children,
    totalAmount,
    agentName,
    pdfBuffer,
  } = data

  const attachments = pdfBuffer
    ? [
        {
          filename: `SafariPlus-Itinerary-${bookingReference}.pdf`,
          content: Buffer.from(pdfBuffer),
        },
      ]
    : []

  try {
    const result = await resend.emails.send({
      from: "SafariPlus <bookings@safariplus.com>",
      to: [to],
      subject: `Booking Confirmed - ${bookingReference} | ${tourTitle}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">SafariPlus</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">Your African Adventure Awaits</p>
    </div>

    <!-- Main Content -->
    <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <!-- Success Badge -->
      <div style="text-align: center; margin-bottom: 25px;">
        <div style="display: inline-block; background: #dcfce7; color: #16a34a; padding: 8px 20px; border-radius: 20px; font-weight: 600; font-size: 14px;">
          BOOKING CONFIRMED
        </div>
      </div>

      <!-- Greeting -->
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        Dear ${customerName},
      </p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        Great news! Your safari adventure has been confirmed. Get ready for an unforgettable experience!
      </p>

      <!-- Booking Reference Box -->
      <div style="background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
        <p style="color: #6b7280; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 1px;">Booking Reference</p>
        <p style="color: #16a34a; font-size: 28px; font-weight: bold; margin: 0; font-family: monospace;">${bookingReference}</p>
      </div>

      <!-- Trip Details -->
      <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 25px 0;">
        <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 15px 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">Trip Details</h2>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Tour</td>
            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${tourTitle}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Dates</td>
            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${startDate} - ${endDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Travelers</td>
            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${adults} Adult${adults > 1 ? "s" : ""}${children > 0 ? `, ${children} Child${children > 1 ? "ren" : ""}` : ""}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Tour Operator</td>
            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${agentName}</td>
          </tr>
        </table>

        <div style="border-top: 2px solid #16a34a; margin-top: 15px; padding-top: 15px;">
          <table style="width: 100%;">
            <tr>
              <td style="color: #1f2937; font-size: 16px; font-weight: bold;">Total Paid</td>
              <td style="color: #16a34a; font-size: 20px; font-weight: bold; text-align: right;">$${totalAmount.toLocaleString()}</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Itinerary Attachment Note -->
      ${pdfBuffer ? `
      <div style="background: #fef3c7; border-radius: 8px; padding: 15px; margin: 25px 0;">
        <p style="color: #92400e; font-size: 14px; margin: 0;">
          <strong>Your detailed itinerary is attached to this email.</strong> Please save it for your records and bring it with you on your trip.
        </p>
      </div>
      ` : ""}

      <!-- What's Next -->
      <div style="margin: 25px 0;">
        <h3 style="color: #1f2937; font-size: 16px; margin: 0 0 15px 0;">What's Next?</h3>
        <ul style="color: #4b5563; font-size: 14px; line-height: 1.8; padding-left: 20px; margin: 0;">
          <li>Review your itinerary and pack accordingly</li>
          <li>Ensure your passport is valid for at least 6 months</li>
          <li>Check visa requirements for your destination</li>
          <li>Your tour operator will contact you with final details</li>
        </ul>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/booking/confirmation/${bookingReference}" style="display: inline-block; background: #16a34a; color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">View Booking Details</a>
      </div>

      <!-- Cancellation Policy -->
      <div style="background: #f9fafb; border-radius: 8px; padding: 15px; margin: 25px 0;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">
          <strong>Free Cancellation:</strong> You can cancel free of charge up to 30 days before your trip. After that, cancellation fees may apply.
        </p>
      </div>

      <!-- Contact -->
      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 5px 0;">Questions about your booking?</p>
        <p style="margin: 0;">
          <a href="mailto:support@safariplus.com" style="color: #16a34a; text-decoration: none; font-weight: 600;">support@safariplus.com</a>
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 20px;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0 0 5px 0;">
        SafariPlus - Your Trusted Safari Partner
      </p>
      <p style="color: #9ca3af; font-size: 11px; margin: 0;">
        Nairobi, Kenya | support@safariplus.com
      </p>
    </div>
  </div>
</body>
</html>
      `,
      attachments,
    })

    return { success: true, data: result }
  } catch (error) {
    console.error("Error sending booking confirmation email:", error)
    return { success: false, error }
  }
}

/**
 * Sends a verification email to a new user
 * @param data - VerificationEmailData containing recipient email, name, and verification token
 * @returns Promise with success status and result or error
 */
export async function sendVerificationEmail(data: VerificationEmailData) {
  const { to, name, token } = data

  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`

  try {
    const result = await resend.emails.send({
      from: "SafariPlus <noreply@safariplus.com>",
      to: [to],
      subject: "Verify Your SafariPlus Account",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">SafariPlus</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">Your African Adventure Awaits</p>
    </div>

    <!-- Main Content -->
    <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <!-- Icon -->
      <div style="text-align: center; margin-bottom: 25px;">
        <div style="display: inline-flex; width: 64px; height: 64px; background: #dcfce7; border-radius: 50%; align-items: center; justify-content: center;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="#16a34a"/>
          </svg>
        </div>
      </div>

      <!-- Greeting -->
      <h2 style="color: #1f2937; font-size: 24px; text-align: center; margin: 0 0 20px 0;">Verify Your Email Address</h2>

      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        Hi ${name},
      </p>

      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        Welcome to SafariPlus! We're excited to help you discover amazing safari adventures across East Africa.
      </p>

      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        To complete your registration and start planning your dream safari, please verify your email address by clicking the button below:
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="display: inline-block; background: #16a34a; color: white; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Verify Email Address</a>
      </div>

      <!-- Alternative Link -->
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
        Or copy and paste this link into your browser:
      </p>
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; margin: 15px 0; word-break: break-all;">
        <a href="${verificationUrl}" style="color: #16a34a; font-size: 13px; text-decoration: none;">${verificationUrl}</a>
      </div>

      <!-- Expiration Notice -->
      <div style="background: #fef3c7; border-radius: 8px; padding: 15px; margin: 25px 0;">
        <p style="color: #92400e; font-size: 14px; margin: 0;">
          <strong>Important:</strong> This verification link will expire in 24 hours. If you didn't create a SafariPlus account, you can safely ignore this email.
        </p>
      </div>

      <!-- What's Next -->
      <div style="margin: 25px 0;">
        <h3 style="color: #1f2937; font-size: 16px; margin: 0 0 15px 0;">Once verified, you'll be able to:</h3>
        <ul style="color: #4b5563; font-size: 14px; line-height: 1.8; padding-left: 20px; margin: 0;">
          <li>Browse hundreds of curated safari experiences</li>
          <li>Save your favorite tours to your wishlist</li>
          <li>Book tours directly with verified operators</li>
          <li>Message tour operators with questions</li>
          <li>Manage all your bookings in one place</li>
        </ul>
      </div>

      <!-- Contact -->
      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb; margin-top: 30px;">
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 5px 0;">Need help?</p>
        <p style="margin: 0;">
          <a href="mailto:support@safariplus.com" style="color: #16a34a; text-decoration: none; font-weight: 600;">support@safariplus.com</a>
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 20px;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0 0 5px 0;">
        SafariPlus - Your Trusted Safari Partner
      </p>
      <p style="color: #9ca3af; font-size: 11px; margin: 0;">
        Nairobi, Kenya | support@safariplus.com
      </p>
      <p style="color: #9ca3af; font-size: 11px; margin: 10px 0 0 0;">
        This email was sent to ${to} because you registered for a SafariPlus account.
      </p>
    </div>
  </div>
</body>
</html>
      `,
    })

    return { success: true, data: result }
  } catch (error) {
    console.error("Error sending verification email:", error)
    return { success: false, error }
  }
}

/**
 * Sends a password reset email to a user who requested to reset their password
 * @param data - PasswordResetEmailData containing recipient email, name, and reset token
 * @returns Promise with success status and result or error
 */
export async function sendPasswordResetEmail(data: PasswordResetEmailData) {
  const { to, name, token } = data
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

  try {
    const result = await resend.emails.send({
      from: "SafariPlus <noreply@safariplus.com>",
      to: [to],
      subject: "Reset Your SafariPlus Password",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">SafariPlus</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">Your African Adventure Awaits</p>
    </div>

    <!-- Main Content -->
    <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <!-- Icon -->
      <div style="text-align: center; margin-bottom: 25px;">
        <div style="display: inline-flex; width: 64px; height: 64px; background: #fef3c7; border-radius: 50%; align-items: center; justify-content: center;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9C13.71 2.9 15.1 4.29 15.1 6V8Z" fill="#f59e0b"/>
          </svg>
        </div>
      </div>

      <!-- Greeting -->
      <h2 style="color: #1f2937; font-size: 24px; text-align: center; margin: 0 0 20px 0;">Reset Your Password</h2>

      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        Hi ${name},
      </p>

      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        We received a request to reset the password for your SafariPlus account. If you made this request, click the button below to create a new password:
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="display: inline-block; background: #16a34a; color: white; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Reset Password</a>
      </div>

      <!-- Alternative Link -->
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
        Or copy and paste this link into your browser:
      </p>
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; margin: 15px 0; word-break: break-all;">
        <a href="${resetUrl}" style="color: #16a34a; font-size: 13px; text-decoration: none;">${resetUrl}</a>
      </div>

      <!-- Security Notice -->
      <div style="background: #fef3c7; border-radius: 8px; padding: 15px; margin: 25px 0;">
        <p style="color: #92400e; font-size: 14px; margin: 0;">
          <strong>Security Notice:</strong> This password reset link will expire in 1 hour and can only be used once. If you didn't request a password reset, please ignore this email and ensure your account is secure.
        </p>
      </div>

      <!-- Additional Info -->
      <div style="margin: 25px 0;">
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
          For your security, this link is valid for only 1 hour. If the link expires, you'll need to request a new password reset from the login page.
        </p>
      </div>

      <!-- Contact -->
      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb; margin-top: 30px;">
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 5px 0;">Didn't request this change?</p>
        <p style="margin: 0;">
          <a href="mailto:support@safariplus.com" style="color: #16a34a; text-decoration: none; font-weight: 600;">Contact our support team</a>
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 20px;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0 0 5px 0;">
        SafariPlus - Your Trusted Safari Partner
      </p>
      <p style="color: #9ca3af; font-size: 11px; margin: 0;">
        Nairobi, Kenya | support@safariplus.com
      </p>
      <p style="color: #9ca3af; font-size: 11px; margin: 10px 0 0 0;">
        This email was sent to ${to} because a password reset was requested for this email address.
      </p>
    </div>
  </div>
</body>
</html>
      `,
    })

    return { success: true, data: result }
  } catch (error) {
    console.error("Error sending password reset email:", error)
    return { success: false, error }
  }
}

/**
 * Sends a confirmation email after a user successfully changes their password
 * @param data - PasswordChangedEmailData containing recipient email and name
 * @returns Promise with success status and result or error
 */
export async function sendPasswordChangedEmail(data: PasswordChangedEmailData) {
  const { to, name } = data

  try {
    const result = await resend.emails.send({
      from: "SafariPlus <noreply@safariplus.com>",
      to: [to],
      subject: "Password Changed Successfully - SafariPlus",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Changed</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">SafariPlus</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">Your African Adventure Awaits</p>
    </div>

    <!-- Main Content -->
    <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <!-- Success Icon -->
      <div style="text-align: center; margin-bottom: 25px;">
        <div style="display: inline-flex; width: 64px; height: 64px; background: #dcfce7; border-radius: 50%; align-items: center; justify-content: center;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="#16a34a"/>
          </svg>
        </div>
      </div>

      <!-- Greeting -->
      <h2 style="color: #1f2937; font-size: 24px; text-align: center; margin: 0 0 20px 0;">Password Changed Successfully</h2>

      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        Hi ${name},
      </p>

      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        This email confirms that your password has been successfully changed for your SafariPlus account.
      </p>

      <!-- Success Badge -->
      <div style="text-align: center; margin: 25px 0;">
        <div style="display: inline-block; background: #dcfce7; color: #16a34a; padding: 10px 25px; border-radius: 20px; font-weight: 600; font-size: 14px;">
          PASSWORD UPDATE CONFIRMED
        </div>
      </div>

      <!-- Security Info -->
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 25px 0;">
        <p style="color: #15803d; font-size: 14px; line-height: 1.6; margin: 0;">
          <strong>Your account is secure.</strong> You can now sign in to SafariPlus using your new password.
        </p>
      </div>

      <!-- Security Notice -->
      <div style="background: #fef3c7; border-radius: 8px; padding: 15px; margin: 25px 0;">
        <p style="color: #92400e; font-size: 13px; margin: 0;">
          <strong>Didn't make this change?</strong> If you didn't change your password, please contact our support team immediately to secure your account.
        </p>
      </div>

      <!-- Tips -->
      <div style="margin: 25px 0;">
        <h3 style="color: #1f2937; font-size: 16px; margin: 0 0 15px 0;">Security Tips:</h3>
        <ul style="color: #4b5563; font-size: 14px; line-height: 1.8; padding-left: 20px; margin: 0;">
          <li>Never share your password with anyone</li>
          <li>Use a unique password for SafariPlus</li>
          <li>Consider using a password manager</li>
          <li>Update your password regularly</li>
          <li>Enable two-factor authentication when available</li>
        </ul>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/sign-in" style="display: inline-block; background: #16a34a; color: white; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Sign In to Your Account</a>
      </div>

      <!-- Contact -->
      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb; margin-top: 30px;">
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 5px 0;">Need assistance?</p>
        <p style="margin: 0;">
          <a href="mailto:support@safariplus.com" style="color: #16a34a; text-decoration: none; font-weight: 600;">support@safariplus.com</a>
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 20px;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0 0 5px 0;">
        SafariPlus - Your Trusted Safari Partner
      </p>
      <p style="color: #9ca3af; font-size: 11px; margin: 0;">
        Nairobi, Kenya | support@safariplus.com
      </p>
      <p style="color: #9ca3af; font-size: 11px; margin: 10px 0 0 0;">
        This email was sent to ${to} as a security notification for your SafariPlus account.
      </p>
    </div>
  </div>
</body>
</html>
      `,
    })

    return { success: true, data: result }
  } catch (error) {
    console.error("Error sending password changed email:", error)
    return { success: false, error }
  }
}
