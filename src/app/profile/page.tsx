'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Heart, MessageCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Mock data remains the same as your original code
const currentUser = {
  username: 'johndoe',
  bio: 'I love coding and building awesome things!',
  avatar: 'https://github.com/shadcn.png',
}

const friends = [
  { id: 1, name: 'Jane Smith', avatar: 'https://github.com/shadcn.png' },
  { id: 2, name: 'Mike Johnson', avatar: 'https://github.com/shadcn.png' },
  { id: 3, name: 'Sarah Williams', avatar: 'https://github.com/shadcn.png' },
]

const userPosts = [
  { id: 1, imageUrl: '/placeholder.svg?height=300&width=300', likes: 15, comments: 5 },
  { id: 2, imageUrl: '/placeholder.svg?height=300&width=300', likes: 20, comments: 8 },
  { id: 3, imageUrl: '/placeholder.svg?height=300&width=300', likes: 10, comments: 3 },
]

export default function ProfilePage() {
  const [username, setUsername] = useState(currentUser.username)
  const [bio, setBio] = useState(currentUser.bio)
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    setIsEditing(false)
  }

  return (
    <div className="flex flex-col gap-4 p-4 min-h-screen bg-background">
      {/* Profile Section */}
      <div className="w-full max-w-3xl   mx-auto space-y-4">
        <div className="rounded-xl bg-card p-6 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={currentUser.avatar} alt={username} />
              <AvatarFallback>{username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h1 className="text-2xl text-white font-bold">{username}</h1>
              <p className="text-white">{bio}</p>
            </div>
          </div>

          <div className="flex gap-2 justify-center">
            {isEditing ? (
              <div className="w-full text-white max-w-md space-y-4">
                <Input
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <Textarea
                  placeholder="Bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>Save</Button>
                </div>
              </div>
            ) : (
              <>
                <Button onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className='text-white' variant="outline">
                      <Users className="mr-2 text-white h-4 w-4" />
                      View Friends
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Friends</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {friends.map((friend) => (
                        <div key={friend.id} className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={friend.avatar} alt={friend.name} />
                            <AvatarFallback>{friend.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{friend.name}</span>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>

        {/* Posts Section */}
        <div className="space-y-4">
          <h2 className="text-xl text-white font-semibold">My Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {userPosts.map((post) => (
              <div key={post.id} className="relative aspect-square rounded-xl overflow-hidden group bg-card">
                <img
                  src={post.imageUrl}
                  alt={`Post ${post.id}`}
                  className="object-cover w-full h-full transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex gap-6 text-white">
                    <span className="flex items-center gap-2">
                      <Heart className="h-6 w-6" />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-2">
                      <MessageCircle className="h-6 w-6" />
                      {post.comments}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}