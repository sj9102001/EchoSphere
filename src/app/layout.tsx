"use client";
// import type { Metadata } from "next";
import "./globals.css";
import 'react-toastify/dist/ReactToastify.css';
import { SessionProvider } from "next-auth/react";
import PostUploadModal from "@/components/modals/create-modal";
import PeopleSearchModal from "@/components/modals/search-users-modal";
import { ModalProvider } from "@/context/ModalContext";
import { Toaster } from "@/components/ui/toaster";
    
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
                <SessionProvider>
                    <ModalProvider>
                        <PostUploadModal />
                        <PeopleSearchModal />
                        <Toaster />
                        {children}    
                    </ModalProvider>
                </SessionProvider>
            </body>
        </html>
    );
}
