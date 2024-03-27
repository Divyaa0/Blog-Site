import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import 'react-toastify/dist/ReactToastify.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Imentus Admin",
  description: "Imentus admin app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body 
        suppressHydrationWarning={true}
      className={inter.className}>{children}</body>
    </html>
  );
}
