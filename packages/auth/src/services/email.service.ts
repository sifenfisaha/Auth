import nodemailer, { Transporter } from "nodemailer";
import { getAuthConfig } from "../configs/store";

type sendArgs = { to: string; subject: string; html: string; text?: string };

export class EmailService {
  private static transporter: Transporter | null = null;

  private static getTransporter(): Transporter | "console" {
    const configs = getAuthConfig();
    const emailCfg = configs.email;

    if (!emailCfg?.enabled) return "console";
    if (!emailCfg || emailCfg.transport === "console") return "console";

    if (emailCfg.transport === "smpt") {
      if (!this.transporter) {
        if (!emailCfg.stmp) {
          throw new Error(
            "SMTP options are required when email.transport = 'smtp'"
          );
        }
        this.transporter = nodemailer.createTransport({
          host: emailCfg.stmp.host,
          port: emailCfg.stmp.port,
          secure: emailCfg.stmp.secure,
          auth: {
            user: emailCfg.stmp.auth.user,
            pass: emailCfg.stmp.auth.pass,
          },
        });
      }
      return this.transporter;
    }
    return "console";
  }

  static async send(args: sendArgs) {
    const configs = getAuthConfig();
    const from = configs.email?.from || "no-replay@example.com";
    const transporter = this.getTransporter();
    if (transporter === "console") {
      console.log(
        `[email:console] to=${args.to} subject="${args.subject}"\n${args.html}`
      );
      return;
    }
    await transporter.sendMail({
      from,
      to: args.to,
      subject: args.subject,
      html: args.html,
      text: args.text,
    });
  }
  static renderVerificationTemplate(user: any, otp: string, req?: any) {
    const configs = getAuthConfig();
    const override = configs.email?.templates?.verification;

    if (override) return override({ user, otp, req });

    return {
      subject: "Verify your email",
      html: `
        <p>Hello ${user.name || "there"},</p>
        <p>Your verification code is:</p>
        <h2>${otp}</h2>
        <p>This code will expire in 24 hours. If you did not sign up, please ignore this email.</p>
      `,
      text: `Your verification code is: ${otp}`,
    };
  }

  static renderPasswordResetTemplate(user: any, otp: string, req?: any) {
    const config = getAuthConfig();
    const override = config.email?.templates?.passwordReset;
    if (override) return override({ user, otp, req });

    return {
      subject: "Password reset code",
      html: `
        <p>Hello ${user.name || "there"},</p>
        <p>Your password reset code is:</p>
        <h2>${otp}</h2>
        <p>This code will expire in 10 minutes. If you didn't request a reset, you can ignore this email.</p>
      `,
      text: `Your password reset code is: ${otp}`,
    };
  }
}
