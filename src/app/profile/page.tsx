'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Heart, MessageCircle } from 'lucide-react'

// Mock data for the current user and friends
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

// Mock data for user posts
const userPosts = [
  { id: 1, imageUrl: '/placeholder.svg?height=300&width=300', likes: 15, comments: 5 },
  { id: 2, imageUrl: '/placeholder.svg?height=300&width=300', likes: 20, comments: 8 },
  { id: 3, imageUrl: '/placeholder.svg?height=300&width=300', likes: 10, comments: 3 },
  { id: 4, imageUrl: '/placeholder.svg?height=300&width=300', likes: 25, comments: 12 },
  { id: 5, imageUrl: '/placeholder.svg?height=300&width=300', likes: 18, comments: 7 },
  { id: 6, imageUrl: '/placeholder.svg?height=300&width=300', likes: 30, comments: 15 },
]

export default function ProfilePage() {
  const [username, setUsername] = useState(currentUser.username)
  const [bio, setBio] = useState(currentUser.bio)
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    // Here you would typically send the updated data to your backend
    console.log('Saving profile:', { username, bio })
    setIsEditing(false)
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={currentUser.avatar} alt={username} />
              <AvatarFallback>{username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{username}</h2>
              <p className="text-muted-foreground">{bio}</p>
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-muted-foreground mb-1">
                  Username
                </label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-muted-foreground mb-1">
                  Bio
                </label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full"
                  rows={4}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
              </div>
            </form>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="mb-4">Edit Profile</Button>
          )}

          <div className="mt-6">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Users className="mr-2 h-4 w-4" />
                  View Friends
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Friends List</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {friends.map((friend) => (
                    <div key={friend.id} className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={friend.avatar} alt={friend.name} />
                        <AvatarFallback>{friend.name[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{friend.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <div className="max-w-6xl mx-auto">
        <h3 className="text-2xl font-bold mb-4">My Posts</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {userPosts.map((post) => (
            <div key={post.id} className="relative group">
              <img
                src={post.imageUrl}
                alt={`Post ${post.id}`}
                className="w-full h-auto aspect-square object-cover rounded-lg transition-opacity duration-300 group-hover:opacity-75"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="text-white text-center">
                  <p className="text-lg font-bold">Post {post.id}</p>
                  <div className="flex items-center justify-center space-x-4 mt-2">
                    <span className="flex items-center">
                      <Heart className="w-5 h-5 mr-1" />
                      {post.likes}
                    </span>
                    <span className="flex items-center">
                      <MessageCircle className="w-5 h-5 mr-1" />
                      {post.comments}
                    </span>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-2 left-2 right-2 flex justify-between text-white text-sm">
                <span className="flex items-center">
                  <Heart className="w-4 h-4 mr-1" />
                  {post.likes}
                </span>
                <span className="flex items-center">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {post.comments}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}