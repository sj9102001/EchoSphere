/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useEffect, useState } from 'react'
import { Post } from './Post'

interface PostData {
  id: number
  title: string
  content: string
  mediaUrl: string,
  createdAt: Date,
  user: {
    id: string
    name: string
    profilePicture: string | null
  }
  comments: []
  likes: []
}

interface ApiResponse {
  data: PostData[]
  meta: {
    currentPage: number
    pageSize: number
    totalPosts: number
    totalPages: number
  }
}

export default function ExplorePage() {
  const [posts, setPosts] = useState<PostData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts/explore?page=1&limit=10')
      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }
      const data: ApiResponse = await response.json()
      setPosts(data.data)
      console.log(data.data);
      setLoading(false)
    } catch (err) {
      setError('Error fetching posts. Please try again later.')
      setLoading(false)
    }
  }

  const handleLike = async (postId: number) => {
    // Implement like functionality here
    // This would typically involve making an API call to update the like status
    console.log(`Liked post ${postId}`)
  }

  if (loading) {
    return <div className="text-center mt-8">Loading...</div>
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Explore Posts</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Post
            key={post.id}
            id={post.id}
            title={post.title}
            content={post.content}
            mediaUrl={post.mediaUrl || '/placeholder.svg?height=300&width=400'}
            createdAt={new Date(post.createdAt)}
            user={post.user}
            comments={post.comments}
            likes={post.likes}
            onLike={handleLike}
          />
        ))}
      </div>
    </div>
  )
}