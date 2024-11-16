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
  DialogTrigger,
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
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulating an API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("Submitting post:", { postContent, imageFile });

    setIsLoading(false);
    onOpenChange(false);
    setPostContent("");
    setImageFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="sm:max-w-[425px] bg-white dark:bg-black">
        <DialogHeader>
          <DialogTitle>Create a New Post</DialogTitle>
          <DialogDescription>
            Share your thoughts or an image with your followers.
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
              <Label htmlFor="image-upload" className='dark:text-white text-black'>Upload Image</Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="cursor-pointer text-black dark:text-white"
              />
              {imageFile && (
                <p className="text-sm text-black dark:text-white text-muted-foreground">
                  Selected file: {imageFile.name}
                </p>
              )}
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
