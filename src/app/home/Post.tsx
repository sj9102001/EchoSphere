import Image from 'next/image'
import { useState } from 'react'
import { Heart, MessageCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface PostProps {
    id: number
    title: string
    content: string
    mediaUrl: string
    createdAt: Date
    user: {
        id: string
        name: string
        profilePicture: string | null
    }
    comments: any[]
    likes: any[]
    onLike: (postId: number) => void
}

export function Post({ id, title, content, createdAt, mediaUrl, user, comments, likes, onLike }: PostProps) {
    const [likeCount, setLikeCount] = useState(likes.length)
    const [isLiked, setIsLiked] = useState(false)

    const handleLike = () => {
        onLike(id)
        if (isLiked) {
            setLikeCount(likeCount - 1)
        } else {
            setLikeCount(likeCount + 1)
        }
        setIsLiked(!isLiked)
    }

    return (
        <div className="bg-card border border-white p-4 text-white rounded-lg shadow-md overflow-hidden">
            <Image
                src={mediaUrl}
                alt={title}
                width={400}
                height={300}
                className="w-full h-48 object-cover"
            />
            <div className="p-4">
                <div className="flex items-center mb-2">
                    <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={user.profilePicture || undefined} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{user.name}</span>
                </div>
                <h2 className="text-xl font-semibold mb-2">{title}</h2>
                <p className="text-muted-foreground mb-4">{content}</p>
                <div className="flex items-center justify-between">
                    <div className="flex items-center justify-between space-x-4">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`flex hover:bg-red-700 items-center ${isLiked ? 'bg-red-500' : ''}`}
                                onClick={handleLike}
                            >
                                <Heart className="mr-1 h-4 w-4" />
                                <span>{likeCount}</span>
                            </Button>
                            <div className="flex items-center text-muted-foreground">
                                <MessageCircle className="mr-1 h-4 w-4" />
                                <span>{comments.length} Comments</span>
                            </div>
                        </div>
                        <span>Uploaded: {createdAt.getDate()}/{createdAt.getMonth() + 1}/{createdAt.getFullYear()}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}