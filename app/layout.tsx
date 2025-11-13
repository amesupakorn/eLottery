// app/layout.tsx
import "./globals.css";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { AlertProvider } from "@/context/AlertContext";
import { UserProvider } from "@/context/UserContext";
import GlobalErrorAlert from "@/components/globalAlert";
import NavBar from "@/components/navBar";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const idToken = cookieStore.get("id_token")?.value;

  // decode token ฝั่ง server
  let user = null;
  if (idToken) {
    try {
      const decoded: any = jwt.decode(idToken);
      user = {
        email: decoded.email,
        name: decoded.name || decoded["cognito:username"] || "User",
      };
    } catch {
      user = null;
    }
  }

  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <UserProvider initialUser={user}>
          <AlertProvider>
            <NavBar />
            <GlobalErrorAlert />
            <main>{children}</main>
          </AlertProvider>
        </UserProvider>
      </body>
    </html>
  );
}