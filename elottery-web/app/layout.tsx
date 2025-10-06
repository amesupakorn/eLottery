import "./globals.css";
import { AlertProvider } from "@/context/AlertContext";
import GlobalErrorAlert from "@/components/globalAlert";
import NavBar from "@/components/navBar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <AlertProvider>
          <NavBar />
          <GlobalErrorAlert />
          <main className="">{children}</main>
        </AlertProvider>
      </body>
    </html>
  );
}