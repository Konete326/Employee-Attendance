import Notification from "@/models/Notification";

export async function createNotification(params: {
  userId: string | any;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  link?: string;
}) {
  try {
    await Notification.create({
      userId: params.userId,
      title: params.title,
      message: params.message,
      type: params.type || "info",
      link: params.link || null,
      isRead: false,
    });
    return true;
  } catch (error) {
    console.error("Error creating notification:", error);
    return false;
  }
}
