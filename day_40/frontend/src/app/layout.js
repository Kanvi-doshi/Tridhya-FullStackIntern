import "./globals.css";
import { AuthProvider } from "@/components/context/AuthContext";
import { ToastProvider } from "@/components/toast/toastContext";

export const metadata = {
  title: "EventHub",
  description: "Event Management Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
