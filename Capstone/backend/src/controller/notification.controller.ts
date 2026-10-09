import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../lib/config/db";
import { Notification } from "../lib/entity/notification";
import { getIO } from "../lib/config/socket";

const notificationRepository = AppDataSource.getRepository(Notification);

export const getMyNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const [notifications, unreadCount] = await Promise.all([
      notificationRepository.find({
        where: { user: { id: req.user!.id } },
        order: { createdAt: "DESC" },
        take: 30,
      }),
      notificationRepository.count({
        where: { user: { id: req.user!.id }, isRead: false },
      }),
    ]);

    return res.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await notificationRepository.update(
      { id: String(req.params.id), user: { id: req.user!.id } },
      { isRead: true },
    );

    return res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const deleteMyNotification = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await notificationRepository.delete({
      id: String(req.params.id),
      user: { id: req.user!.id },
    });

    getIO().to(`user:${req.user!.id}`).emit("notification:updated");
    return res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const clearMyNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await notificationRepository.delete({ user: { id: req.user!.id } });

    getIO().to(`user:${req.user!.id}`).emit("notification:updated");
    return res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
