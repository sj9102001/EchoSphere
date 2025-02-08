"use client";

import React from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Heart, MessageCircle } from "lucide-react";

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
}

const PostModal: React.FC<PostModalProps> = ({ post, trigger }) => {
  return (
    <Dialog>
      {/* Wrap the trigger element with DialogTrigger */}
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      {/* Added a greyish background (bg-gray-800) to suit the dark theme */}
      <DialogContent className="w-full max-w-4xl p-0 bg-gray-800">
        <div className="flex flex-col md:flex-row">
          {/* Left Side: Post Image */}
          <div className="relative w-full md:w-1/2 h-96 md:h-auto">
            {post.mediaUrl ? (
              <Image
                src={post.mediaUrl}
                alt={`Post by ${post.user.name}`}
                fill
                className="object-contain" // Changed from object-cover to object-contain
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
              <Heart className="h-6 w-6 text-red-500 mr-2" />
              <span className="text-white">{post.likes.length} likes</span>
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
};

export default PostModal;
