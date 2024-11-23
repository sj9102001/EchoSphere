"use client";
import type { Metadata } from "next";
import "./globals.css";
import 'react-toastify/dist/ReactToastify.css';
import { SessionProvider } from "next-auth/react";
    
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className="dark"
            >
                <SessionProvider>{children}</SessionProvider>
            </body>
        </html>
    );
}
