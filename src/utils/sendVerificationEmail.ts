import { transporter } from "../configs/nodemailer.config";
import jwt from "jsonwebtoken";

export const sendVerificationOtp = async (
  toEmail: string,
  name: string,
  UserId: string
): Promise<void> => {
  const token = jwt.sign({ id: UserId }, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });
  const verificationLink = `http://localhost:3000/api/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: "Your Verification OTP",
    html: `
      <p>Hi ${name || "there"},</p>
      <p>Click below to verify your email:</p>
      <a href="${verificationLink}">${verificationLink}</a>
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
