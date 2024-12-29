'use client';

import Link from 'next/link';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react'; // Importing session hook
import CreateGroupChat from '../modals/CreateGroupChat-modal'; // Import CreateGroupChat modal component
import { FaPlus } from 'react-icons/fa'; // Icon for creating a new group chat
import { database } from '@/config'; // Firebase config import
import { ref, onValue, off, DataSnapshot, query, orderByChild, equalTo } from 'firebase/database'; // Firebase database functions

interface Chatroom {
  id: string;
  name: string;
  participants: string[];
}

const ChatRoomList = () => {
  const [chatrooms, setChatrooms] = useState<Chatroom[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession(); // Get session data
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [isClient, setIsClient] = useState(false); // To ensure client-side only rendering

  useEffect(() => {
    // Ensure the component renders only on the client side
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Check if the user is authenticated before fetching chatrooms
    if (status === 'loading') return; // Don't do anything while loading session
    if (!session) {
      setError('You need to be logged in to view chatrooms.');
      setLoading(false);
      return;
    }

    async function fetchChatrooms() {
      try {
        const res = await fetch('/api/chatrooms');
        // console.log("res", await res.json());
        if (!res.ok) throw new Error('Failed to fetch chatrooms');
        const data: Chatroom[] = await res.json();
        // console.log("data",data);
        setChatrooms(data);
      } catch (error) {
        console.error('Error fetching chatrooms:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchChatrooms();

    // Firebase listener for real-time updates (using onValue for full updates)
    const chatRoomsRef = ref(database, 'chatRooms');

    const handleChatroomUpdate = (snapshot: DataSnapshot) => {
      if (snapshot.exists()) {
        const updatedChatrooms: Chatroom[] = [];
        const currentUserId = session?.user?.id; // Ensure current user ID is available
    
        if (!currentUserId) {
          console.error('Current user ID is not available');
          return;
        }
    
        snapshot.forEach((childSnapshot) => {
          const chatroom = { id: childSnapshot.key, ...childSnapshot.val() };
     // Ensure data type consistency
     const participants = chatroom.participants.map((participant:number | string) => String(participant));
     const currentUserIdStr = String(currentUserId);

     // Check if current user ID is in participants
     if (participants.includes(currentUserIdStr)) {
       updatedChatrooms.push(chatroom);
     }
        });
    
        console.log("Updated Chatrooms:", updatedChatrooms);
    
        // Update chatrooms without duplicates
        setChatrooms((prevChatrooms) => {
          const updatedChatroomIds = updatedChatrooms.map((chatroom) => chatroom.id);
          const filteredPrevChatrooms = prevChatrooms.filter(
            (chatroom) => !updatedChatroomIds.includes(chatroom.id)
          );
    
          return [...filteredPrevChatrooms, ...updatedChatrooms];
        });
      } else {
        console.warn("No chatrooms found in the snapshot.");
      }
    };
    

    // Using onValue to listen for all changes
    onValue(chatRoomsRef, handleChatroomUpdate);

    return () => {
      off(chatRoomsRef); // Cleanup listener when component is unmounted
    };
  }, [session, status]);

  const openModal = () => setIsModalOpen(true); // Open modal
  const closeModal = () => setIsModalOpen(false); // Close modal

  // Render null during SSR to avoid hydration errors
  if (!isClient) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="text-white" />
        <h2 className="text-xl font-bold mb-4 text-gray-300">Chatrooms</h2>
        <button
          onClick={openModal}
          className="p-2 text-white bg-blue-500 rounded-full hover:bg-blue-600"
        >
          <FaPlus />
        </button>
      </div>

      {loading ? (
        <p>Loading chatrooms...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p> // Display error if user is not logged in
      ) : (
        <ul className="space-y-2">
          {chatrooms.map((chatroom) => (
            <li key={chatroom.id}>
              <Link
                href={`/chats/${chatroom.id}`}
                className="block p-2 bg-gray-700 rounded hover:bg-gray-600"
              >
                {chatroom.name}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Create Group Chat Modal */}
      {isModalOpen && <CreateGroupChat onClose={closeModal} />}
    </div>
  );
};

export default ChatRoomList;
