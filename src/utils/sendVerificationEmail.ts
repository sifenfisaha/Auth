import { transporter } from "../configs/nodemailer.config";

export const sendVerificationOtp = async (
  toEmail: string,
  name: string,
  otp: string
): Promise<void> => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: "Your Verification OTP",
    html: `
        <p>Hi ${name || "there"},</p>
      <p>Your verification code is: <strong>${otp}</strong></p>
      <p>This code is valid for 24 hours.</p>
      <p>If you did not request this, please ignore this email.</p>
      <p>Thanks,<br>The Team</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("OTP email sent:", info.response);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw error;
  }
};
