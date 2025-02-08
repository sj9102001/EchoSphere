"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Heart, MessageCircle, Pen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import PostModal from "@/components/modals/PostModal";
interface Friend {
  id: number;
  name: string;
  avatar: string;
}

// const userPosts = [
//   { id: 1, imageUrl: '/placeholder.svg?height=300&width=300', likes: 15, comments: 5 },
//   { id: 2, imageUrl: '/placeholder.svg?height=300&width=300', likes: 20, comments: 8 },
//   { id: 3, imageUrl: '/placeholder.svg?height=300&width=300', likes: 10, comments: 3 },
// ];

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
  comments: {
    id: number;
    content: string;
    createdAt: Date;
    user: {
      id: number;
      name: string;
      profilePicture: string | null;
    };
  }[];
  likes: {
    userId: number;
  }[];
}

export default function ProfilePage() {
  const [userData, setUserData] = useState({
    id: "",
    name: "",
    bio: "",
    email: "",
    createdAt: "",
  });
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();

  // Ensure hooks are called unconditionally
  const loggedInUserId = session?.user?.id;

  useEffect(() => {
    async function handleProfile() {
      // Redirect unauthenticated users
      if (status === "unauthenticated") {
        router.replace("/auth/login");
        return;
      }

      // Fetch user data if authenticated and `params.id` is available
      if (status === "authenticated" && params.id) {
        try {
          const response = await fetch(`/api/users/${params.id}`);
          const data = await response.json();

          if (!data.error) {
            setUserData(data);
            setUsername(data.name);
            setBio(data.bio);
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }
      }
    }

    handleProfile();
  }, [status, params.id, router]);

  const handleSave = async () => {
    const response = await fetch(`/api/users/${userData.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userData.id, name: username, bio }),
    });

    if (response.ok) {
      const updatedUser = await response.json();
      setUserData(updatedUser);
      setIsEditing(false);
    }
  };
  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await fetch(`/api/users/${userData.id}/friends`);
        if (!response.ok) {
          throw new Error("Failed to fetch friends");
        }
        const data = await response.json();
        setFriends(data.friends);
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };

    if (userData.id) {
      fetchFriends();
    }
  }, [userData.id]); // ✅ Only depends on userData.id

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts/user");

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await response.json();
      setPosts(data.data);
      console.log(data.data);
      setLoading(false);
    } catch {
      setError("Error fetching posts. Please try again later.");
      setLoading(false);
    }
  };

  if (loading || status === "loading") {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }

  const isOwnProfile =
    userData.id && userData.id.toString() === loggedInUserId?.toString();

  return (
    <div className="flex flex-col gap-4 p-4 min-h-screen bg-background">
      {/* Profile Section */}
      <div className="w-full max-w-3xl mx-auto space-y-4">
        <div className="rounded-xl bg-card p-6 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={"/default-avatar.png"} alt={username} />
              <AvatarFallback>{username[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h1 className="text-2xl text-white font-bold">{username}</h1>
              <p className="text-white">{bio}</p>
            </div>
          </div>

          <div className="flex gap-2 justify-center">
            {isOwnProfile ? (
              // If viewing own profile
              <>
                {isEditing ? (
                  <div className="w-full text-white max-w-md space-y-4">
                    <Input
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    <Textarea
                      placeholder="Bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSave}>Save</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Button onClick={() => setIsEditing(true)}>
                      <Pen className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="text-white" variant="outline">
                          <Users className="mr-2 text-white h-4 w-4" />
                          View Friends
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Friends</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          {friends.map((friend) => (
                            <div
                              key={friend.id}
                              className="flex items-center gap-4 text-white"
                            >
                              <Avatar>
                                <AvatarImage
                                  src={friend.avatar}
                                  alt={friend.name}
                                />
                                <AvatarFallback>
                                  {friend.name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{friend.name}</span>
                            </div>
                          ))}
                          {friends.length === 0 && (
                            <p className="text-white">No friends found</p>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </>
                )}
              </>
            ) : (
              // If viewing another user's profile
              <>
                <Button variant="outline">Add Friend</Button>
                <Button variant="outline">Remove Friend</Button>
              </>
            )}
          </div>
        </div>

        {/* Posts Section */}
        <div className="space-y-4">
          <h2 className="text-xl text-white font-semibold">My Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {posts.map((post) => (
              <PostModal
                key={post.id}
                post={post}
                // Use the post thumbnail as the trigger to open the modal
                trigger={
                  <div className="relative aspect-square rounded-xl overflow-hidden group bg-card cursor-pointer">
                    {post.mediaUrl ? (
                      <Image
                        src={post.mediaUrl}
                        alt={`Post by ${post.user.name}`}
                        fill
                        className="object-contain w-full h-full transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-700">
                        <p className="text-white">No Media</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="flex gap-6 text-white">
                        <span className="flex items-center gap-2">
                          <Heart className="h-6 w-6" />
                          {post.likes.length}
                        </span>
                        <span className="flex items-center gap-2">
                          {/* You can include an icon for comments here */}
                          <MessageCircle className="h-6 w-6" />
                          <span>{post.comments.length}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
