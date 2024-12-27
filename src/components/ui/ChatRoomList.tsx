'use client';

import Link from 'next/link';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react'; // Importing session hook
import CreateGroupChat from '../modals/CreateGroupChat-modal'; // Import CreateGroupChat modal component
import { FaPlus } from 'react-icons/fa'; // Icon for creating a new group chat

interface Chatroom {
  id: string;
  name: string;
  participants: string[];
}

// interface ChatRoomListProps {
//   chatrooms: Chatroom[];
// }

const ChatRoomList = () => {
  const [chatrooms, setChatrooms] = useState<Chatroom[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession(); // Get session data
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

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
        if (!res.ok) throw new Error('Failed to fetch chatrooms');
        const data: Chatroom[] = await res.json();
        setChatrooms(data);
      } catch (error) {
        console.error('Error fetching chatrooms:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchChatrooms();
  }, [session, status]);

  const openModal = () => setIsModalOpen(true); // Open modal
  const closeModal = () => setIsModalOpen(false); // Close modal

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
