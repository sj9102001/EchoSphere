'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImagePlus, Loader2 } from 'lucide-react'

interface PostUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PostUploadModal({ open, onOpenChange }: PostUploadModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [visibility, setVisibility] = useState("public");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    //TODO Implement Create Post API
    // Simulating an API call

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('content', postContent);
      if (mediaFile) {
        formData.append('mediaUrl', mediaFile);
      }
      formData.append("visibility", visibility);
      // API call to the backend
      const response = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create the post');
      }

      const data = await response.json();
      console.log("Post created successfully:", data);

      // Clear form and close modal
      setPostContent("");
      setMediaFile(null);
      onOpenChange(false);
      setVisibility("public");
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="sm:max-w-[425px] bg-white dark:bg-black">
        <DialogHeader>
          <DialogTitle>Create a New Post</DialogTitle>
          <DialogDescription>
            Share your thoughts or a media file with your followers.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="post-content" className="text-black dark:text-white">Post Content</Label>
              <Textarea
                id="post-content"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="What's on your mind?"
                className="resize-none text-black dark:text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="media-upload" className='dark:text-white text-black'>Upload Media</Label>
              <Input
                id="media-upload"
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                className="cursor-pointer text-black dark:text-white"
              />
              {mediaFile && (
                <p className="text-sm text-black dark:text-white text-muted-foreground">
                  Selected file: {mediaFile.name}
                </p>
              )}
            </div>
              <div className="grid gap-2">
              <Label htmlFor="visibility" className="text-black dark:text-white">Visibility</Label>
              <select
                id="visibility"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="p-2 border rounded-md bg-white dark:bg-black text-black dark:text-white"
              >
                <option value="" disabled>Select visibility</option>
                <option value="public">Public</option>
                <option value="friends-only">Friends Only</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" className='text-black dark:text-white' variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <ImagePlus className="mr-2 h-4 w-4" />
                  Post
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
