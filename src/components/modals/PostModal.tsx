"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Heart, MessageCircle } from "lucide-react";
import { useSession } from "next-auth/react";

interface Comment {
  id: number;
  content: string;
  createdAt: Date;
  user: {
    id: number;
    name: string;
    profilePicture: string | null;
  };
}

interface PostData {
  id: number;
  content: string;
  createdAt: Date;
  mediaUrl: string | null;
  user: {
    id: number;
    name: string;
    profilePicture: string | null;
  };
  comments: Comment[];
  likes: {
    userId: number;
  }[];
}

interface PostModalProps {
  post: PostData;
  /**
   * The element that triggers the modal when clicked.
   */
  trigger: React.ReactNode;
  /**
   * (Optional) Indicates if the current user has already liked this post.
   */
  likedByUser?: boolean;
}

export default function PostModal({
  post,
  trigger,
  likedByUser = false,
}: PostModalProps) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  // Compute initial liked state:
  const initialLiked =
    likedByUser ||
    (currentUserId
      ? post.likes.some(
          (like) => Number(like.userId) === Number(currentUserId)
        )
      : false);

  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [comments, setComments] = useState<Comment[]>(post.comments);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (currentUserId) {
      const newLiked = post.likes.some(
        (like) => Number(like.userId) === Number(currentUserId)
      );
      setLiked(newLiked);
    }
  }, [currentUserId, post.likes]);

  const toggleLike = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      type ToggleLikeResponse = {
        message: "Liked" | "Unliked";
      };
      const data = (await response.json()) as ToggleLikeResponse;
      if (data.message === "Liked") {
        setLiked(true);
        setLikesCount((prev) => prev + 1);
      } else if (data.message === "Unliked") {
        setLiked(false);
        setLikesCount((prev) => prev - 1);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const response = await fetch(`/api/posts/${post.id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });
      const result = await response.json();
      if (response.ok && result.comment) {
        setComments((prev) => [...prev, result.comment]);
        setNewComment("");
      } else {
        console.error("Error adding comment:", result.error);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-full max-w-5xl p-0 bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left Side: Post Image */}
          <div className="relative w-full md:w-1/2 h-96 md:h-auto">
            {post.mediaUrl ? (
              <Image
                src={post.mediaUrl}
                alt={`Post by ${post.user.name}`}
                fill
                className="object-contain rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-700 rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none">
                <p className="text-white text-xl">No Media</p>
              </div>
            )}
          </div>
          {/* Right Side: Post Details */}
          <div className="w-full md:w-1/2 p-8 flex flex-col space-y-4">
            {/* Caption */}
            <div>
              <p className="text-white text-base md:text-lg font-medium leading-relaxed">
                {post.content}
              </p>
            </div>
            {/* Likes */}
            <div className="flex items-center space-x-4">
              <span onClick={toggleLike} className="cursor-pointer transition-transform transform hover:scale-110">
                {liked ? (
                  <Heart fill="currentColor" className="h-8 w-8 text-red-500" />
                ) : (
                  <Heart fill="none" className="h-8 w-8 text-red-500" />
                )}
              </span>
              <span className="text-white text-lg">{likesCount} likes</span>
            </div>
            {/* Comments Section */}
            <div className="flex-1 flex flex-col mt-0">
              {/* Fixed Comments Title */}
              <div className="sticky top-0 z-10 pb-2">
                <DialogHeader>
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-6 w-6 text-red-500" />
                    <DialogTitle className="text-2xl font-semibold text-white">
                      Comments
                    </DialogTitle>
                  </div>
                </DialogHeader>
              </div>
              {/* Scrollable Comments List */}
              <div className="overflow-y-auto pr-2 max-h-72 space-y-1 px-4">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="p-3 bg-gray-700 rounded-lg shadow-inner">
                      <p className="text-sm text-gray-300">
                        <span className="font-bold text-white">{comment.user.name}:</span>{" "}
                        {comment.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">No comments yet.</p>
                )}
              </div>
              {/* Fixed Add Comment Form */}
              <div className="px-4 mt-4">
                <textarea
                  className="w-full p-4 rounded-lg bg-gray-600 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder="Write your comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <button
                  className="mt-3 w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                  onClick={handleAddComment}
                >
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
