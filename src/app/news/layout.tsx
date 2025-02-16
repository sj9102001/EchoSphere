import type { Metadata } from "next";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { AppSidebar } from "@/components/app-sidebar";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";

export const metadata: Metadata = {
    title: "Echosphere - News",
    description: "Latest news updates powered by API Tube.",
};

export default function NewsLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1 text-white" />
                        <h1 className="text-xl font-bold text-white">Latest News</h1>
                    </div>
                </header>
                {children}
                <ToastContainer />
            </SidebarInset>
        </SidebarProvider>
    );
}
