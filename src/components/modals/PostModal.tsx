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
   * For example, a thumbnail div containing the post image.
   */
  trigger: React.ReactNode;
  /**
   * (Optional) Indicates if the current user has already liked this post.
   * If not provided, we compute it from the post.likes array.
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
  // Use the likedByUser prop if provided; otherwise, check if currentUserId exists in post.likes.
  const initialLiked =
    likedByUser ||
    (currentUserId
      ? post.likes.some(
          (like) => Number(like.userId) === Number(currentUserId)
        )
      : false);

  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(post.likes.length);

  // Optional: update liked state if session or post.likes changes.
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

      // Define the expected type for the JSON response.
      type ToggleLikeResponse = {
        message: "Liked" | "Unliked";
      };

      // Parse the response and assert its type.
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

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-full max-w-4xl p-0 bg-gray-800">
        <div className="flex flex-col md:flex-row">
          {/* Left Side: Post Image */}
          <div className="relative w-full md:w-1/2 h-96 md:h-auto">
            {post.mediaUrl ? (
              <Image
                src={post.mediaUrl}
                alt={`Post by ${post.user.name}`}
                fill
                className="object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-700">
                <p className="text-white">No Media</p>
              </div>
            )}
          </div>

          {/* Right Side: Post Details */}
          <div className="w-full md:w-1/2 p-4 flex flex-col">
            {/* Caption / Content */}
            <div className="mb-4">
              <p className="text-white">{post.content}</p>
            </div>
            {/* Likes */}
            <div className="flex items-center mb-4">
              {/* Clickable heart icon */}
              <span onClick={toggleLike} className="cursor-pointer">
                {liked ? (
                  <Heart
                    fill="currentColor"
                    className="h-6 w-6 text-red-500 mr-2"
                  />
                ) : (
                  <Heart
                    fill="none"
                    className="h-6 w-6 text-red-500 mr-2"
                  />
                )}
              </span>
              <span className="text-white">{likesCount} likes</span>
            </div>
            {/* Comments Section */}
            <div className="flex-1 overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center">
                  <MessageCircle className="h-6 w-6 text-red-500 mr-2" />
                  <DialogTitle className="text-lg font-semibold text-white">
                    Comments
                  </DialogTitle>
                </div>
              </DialogHeader>
              {post.comments.length > 0 ? (
                post.comments.map((comment) => (
                  <div key={comment.id} className="mb-2">
                    <p className="text-sm text-gray-300">
                      <span className="font-bold text-white">
                        {comment.user.name}:
                      </span>{" "}
                      {comment.content}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">No comments yet.</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
