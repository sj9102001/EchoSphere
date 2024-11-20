'use client'

import * as React from 'react'
import { Bell, Home, MessageCircle, Search, Settings, TrendingUpIcon as Trending, User } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar'

export default function AppSidebar() {
  const { setTheme } = useTheme()

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Search, label: 'Explore', href: '/explore' },
    { icon: Bell, label: 'Notifications', href: '/notifications' },
    { icon: MessageCircle, label: 'Messages', href: '/messages' },
  ]

  const trendingTopics = [
    { topic: '#TechNews', posts: '2.5K' },
    { topic: '#CodingTips', posts: '1.8K' },
    { topic: '#AIInnovation', posts: '3.2K' },
  ]

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/avatars/01.png" alt="@username" />
            <AvatarFallback>UN</AvatarFallback>
          </Avatar>
          <div className="ml-2 flex-1 truncate">
            <p className="text-sm font-medium">Username</p>
            <p className="text-xs text-muted-foreground">@username</p>
          </div>
          <SidebarTrigger className="ml-auto hidden lg:flex" />
        </SidebarHeader>
        <SidebarContent className="flex flex-col gap-4 p-4">
          <form>
            <Label htmlFor="search" className="sr-only">
              Search
            </Label>
            <Input
              id="search"
              placeholder="Search..."
              className="w-full"
            />
          </form>
          <nav>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild>
                    <a href={item.href} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </nav>
          <div>
            <h3 className="mb-2 text-sm font-semibold">Trending Topics</h3>
            <div className="space-y-2">
              {trendingTopics.map((topic) => (
                <div key={topic.topic} className="flex items-center justify-between">
                  <span className="text-sm">{topic.topic}</span>
                  <Badge variant="secondary">{topic.posts} posts</Badge>
                </div>
              ))}
            </div>
          </div>
        </SidebarContent>
        <SidebarFooter className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <User className="h-4 w-4" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </SidebarProvider>
  )
}