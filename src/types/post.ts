export type Post = {
    id: number;
    userId: number;
    content: string;
    createdAt: string;
    updatedAt: string;
    mediaUrl?: string;
    visibility: 'public' | 'friends-only' | 'private';
  };
  
  export type PostLike = {
    id: number;
    postId: number;
    userId: number;
    createdAt: string;
  };
  
  export type Comment = {
    id: number;
    postId: number;
    userId: number;
    content: string;
    createdAt: string;
  };
  