"use client"

import * as React from "react"
import {
  Command,
  Map,
  MessageCircleIcon,
  PlusIcon,
  SearchIcon,
  User,
  UserIcon,
} from "lucide-react"
import { useState } from "react"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"
import PostUploadModal from "@/components/modals/create-modal"
import PeopleSearchModal from "./modals/search-users-modal"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)

  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      {
        title: "Chats",
        onClick: () => {
          router.push('/chats');
        },
        icon: MessageCircleIcon,
      },
      {
        title: "Search",
        onClick: () => setIsSearchModalOpen(true),
        icon: SearchIcon,
      },
      {
        title: "Create",
        onClick: () => setIsModalOpen(true),
        icon: PlusIcon,
      },
      {
        title: "Profile",
        onClick: () => {
          router.push('/profile');
        },
        icon: UserIcon,
      },
    ],  
    navSecondary: [],
    projects: [],
  }
  
  return (
    <>
      <Sidebar variant="inset" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <a href="/home  ">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Command className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">EchoSphere</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={data.navMain} />
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={data.user} />
        </SidebarFooter>
      </Sidebar>
      <PeopleSearchModal open={isSearchModalOpen} onOpenChange={setIsSearchModalOpen}/>
      <PostUploadModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>

  )
}
