/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useContext, useState } from 'react'
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
import { ModalContext } from '@/context/ModalContext'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/config'
import { useToast } from '@/hooks/use-toast'


export default function PostUploadModal() {
  const {
    createPostModalIsOpen,
    createPostModalChange,
  } = useContext(ModalContext); const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [postContent, setPostContent] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [visibility, setVisibility] = useState("public");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!postContent.trim()) {
      toast({
        title: "Post Content Cannot be Empty",
      });
      return;
    }

    setIsLoading(true);

    try {
      let mediaUrl = '';

      if (mediaFile) {
        // Upload file to Firebase Storage
        const fileRef = ref(storage, `posts/${Date.now()}_${mediaFile.name}`);
        const uploadTask = uploadBytesResumable(fileRef, mediaFile);

        mediaUrl = await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress); // Update progress
            },
            (error) => {
              reject(error); // Handle errors
            },
            async () => {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadUrl); // Resolve with the download URL
            }
          );
        });
      }

      // Call backend API to create the post
      const response = await fetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify({
          content: postContent,
          mediaUrl,
          visibility,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create the post');
      }

      const data = await response.json();
      toast({
        title: "Post Created Successfully",
      });

      // Clear form and close modal
      setPostContent('');
      setMediaFile(null);
      createPostModalChange(false);
      setVisibility('public');
    } catch (error: unknown) {
  // Narrow the type of `error`
  if (error instanceof Error) {
    console.error('Error creating post:', error);
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
  } else {
    console.error('Unexpected error:', error);
    toast({
      title: "Error",
      description: 'An unexpected error occurred.',
      variant: "destructive",
    });
  }
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={createPostModalIsOpen} onOpenChange={createPostModalChange}>
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
              <Label htmlFor="post-content" className="text-black dark:text-white">
                Post Content
              </Label>
              <Textarea
                id="post-content"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="What's on your mind?"
                className="resize-none text-black dark:text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="media-upload" className="dark:text-white text-black">
                Upload Media
              </Label>
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
              {uploadProgress > 0 && (
                <p className="text-sm text-muted-foreground">
                  Upload Progress: {Math.round(uploadProgress)}%
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="visibility" className="text-black dark:text-white">
                Visibility
              </Label>
              <select
                id="visibility"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="p-2 border rounded-md bg-white dark:bg-black text-black dark:text-white"
              >
                <option value="" disabled>
                  Select visibility
                </option>
                <option value="public">Public</option>
                <option value="friends-only">Friends Only</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              className="text-black dark:text-white"
              variant="outline"
              onClick={() => createPostModalChange(false)}
            >
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