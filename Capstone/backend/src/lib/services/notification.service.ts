import { In } from "typeorm";
import { AppDataSource } from "../config/db";
import { getIO } from "../config/socket";
import { Notification } from "../entity/notification";
import { User, UserRole } from "../entity/User";
import nodemailer from "nodemailer";

type NotificationTarget = { userIds: string[] } | { role: UserRole };

type NotificationData = {
  eventKey: string;
  title: string;
  message: string;
  link: string;
};

export async function notifyUsers(
  target: NotificationTarget,
  data: NotificationData,
  sendEmail = false,
) {
  const userRepository = AppDataSource.getRepository(User);
  const notificationRepository = AppDataSource.getRepository(Notification);

  const users = await userRepository.find({
    where:
      "role" in target
        ? { role: target.role, isActive: true }
        : { id: In(target.userIds), isActive: true },
  });

  for (const user of users) {
    let notification: Notification;

    try {
      notification = await notificationRepository.save(
        notificationRepository.create({
          user,
          ...data,
        }),
      );
    } catch (error) {
      // The unique user + eventKey constraint prevents duplicate notifications.
      if ((error as { code?: string }).code === "23505") continue;
      throw error;
    }

    getIO().to(`user:${user.id}`).emit("notification:new", notification);

    if (!sendEmail) continue;

    const gmailUser = process.env.EMAIL_FROM;
    const gmailAppPassword = process.env.APP_PASSWORD;
    const frontendUrl = process.env.FRONTEND_URL;

    if (!gmailUser || !gmailAppPassword || !frontendUrl) {
      console.warn(
        "Email not sent: configure GMAIL_USER, GMAIL_APP_PASSWORD and FRONTEND_URL.",
      );
      continue;
    }

    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: gmailUser,
          pass: gmailAppPassword,
        },
      });

      const result = await transporter.sendMail({
        from: `"SmartHire AI" <${gmailUser}>`,
        to: user.email,
        subject: data.title,
        text: `${data.message}\n\nOpen: ${frontendUrl}${data.link}`,
      });

      // console.info("Gmail accepted notification email:", {
      //   messageId: result.messageId,
      // });
    } catch (error) {
      console.error("Gmail email send failed:", error);
    }
  }
}
