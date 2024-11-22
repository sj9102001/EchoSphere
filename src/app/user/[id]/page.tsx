import { notFound } from "next/navigation";
import { use } from "react";

async function fetchUser(id: string) {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${id}`;
    console.log('Fetching user from:', url); // Log the URL
    const res = await fetch(url);
    if (!res.ok) return null;
    return res.json();
  }
  

export default async function UserProfile({ params }: { params: { id: string } }) {
  const { id } = await params; // get user id from URL parameters
  const user = await fetchUser(id);

  if (!user) {
    notFound(); // returns a 404 page if the user is not found
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div
        style={{
          backgroundImage: `url(${user.coverPhoto || "/default-cover.jpg"})`,
          height: "200px",
        }}
      >
        <img
          src={user.profilePicture || "/default-avatar.png"}
          alt="Profile"
          style={{ width: "100px", height: "100px", borderRadius: "50%" }}
        />
      </div>
      <h1>{user.name}</h1>
      <p>{user.bio || "No bio available."}</p>
      <p>Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
    </div>
  );
}
