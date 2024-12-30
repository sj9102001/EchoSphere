'use client';

import Link from 'next/link';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react'; // Importing session hook
import CreateGroupChat from '../modals/CreateGroupChat-modal'; // Import CreateGroupChat modal component
import {FaUserPlus, FaSave, FaPlus, FaEdit, FaTrash } from 'react-icons/fa'; // Icons for creating, editing, and deleting chatrooms
import { database } from '@/config'; // Firebase config import
import { ref, onValue, off, DataSnapshot } from 'firebase/database'; // Firebase database functions
import AddParticipantModal from '../modals/AddParticipantModal'; // Import AddParticipantModal
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
  const [isAddParticipantModalOpen, setIsAddParticipantModalOpen] = useState(false);
  const [selectedChatroomId, setSelectedChatroomId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false); // To ensure client-side only rendering
  const [editingChatroomId, setEditingChatroomId] = useState<string | null>(null); // State to track chatroom being edited
  const [editedName, setEditedName] = useState<string>(''); // State to track the updated name

  useEffect(() => {
    // Ensure the component renders only on the client side
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (status === 'loading') return;
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
    
    onValue(chatRoomsRef, handleChatroomUpdate);

    return () => {
      off(chatRoomsRef); // Cleanup listener
    };
  }, [session, status]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const openAddParticipantModal = (chatroomId: string) => {
    setSelectedChatroomId(chatroomId);
    setIsAddParticipantModalOpen(true);
  };
  const closeAddParticipantModal = () => setIsAddParticipantModalOpen(false);
  // const handleCloseModal = () => {
  //   setIsAddParticipantModalOpen(false); // Close the AddParticipantModal
  //   setSelectedChatroomId(null); // Reset the selectedChatroomId
  // };

  const handleEditChatroom = (chatroomId: string, currentName: string) => {
    setEditingChatroomId(chatroomId);
    setEditedName(currentName);
  };

  const handleSaveChatroom = async () => {
    if (!editingChatroomId || !editedName) return;

    try {
      const response = await fetch(`/api/chatrooms`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: editingChatroomId,name: editedName }),
      });

      if (response.ok) {
        setChatrooms((prevChatrooms) =>
          prevChatrooms.map((chatroom) =>
            chatroom.id === editingChatroomId
              ? { ...chatroom, name: editedName }
              : chatroom
          )
        );
        setEditingChatroomId(null); // Reset editing state
      } else {
        console.error('Failed to update chatroom');
      }
    } catch (error) {
      console.error('Error updating chatroom:', error);
    }
  };

  const handleDeleteChatroom = async (chatroomId: string) => {
    // Confirm if the user really wants to delete the chatroom
    if (window.confirm("Are you sure you want to delete this chatroom?")) {
      try {
        const response = await fetch(`/api/chatrooms/`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: chatroomId}),
        });
  
        if (response.ok) {
          // Remove the chatroom from the local state to reflect the deletion immediately
          setChatrooms((prevChatrooms) =>
            prevChatrooms.filter((chatroom) => chatroom.id !== chatroomId)
          );
          console.log(`Chatroom with ID ${chatroomId} has been deleted`);
        } else {
          console.error('Failed to delete chatroom');
        }
      } catch (error) {
        console.error('Error deleting chatroom:', error);
      }
    }
  };
  

  if (!isClient) return null;

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
        <p className="text-red-500">{error}</p>
      ) : (
        <ul className="space-y-2">
          {chatrooms.map((chatroom) => (
            <li key={chatroom.id} className="flex items-center justify-between group">
              {/* Container with padding and rounded corners */}
              <div className="flex justify-between w-full p-2 bg-gray-700 rounded hover:bg-gray-600">
                {/* Link for name (chatroom name is clickable) */}
                <Link href={`/chats/${chatroom.id}`} className="flex-grow text-white truncate">
                  {editingChatroomId === chatroom.id ? (
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="bg-gray-600 text-white p-1 rounded w-full"
                    />
                  ) : (
                    <span className="text-white">{chatroom.name}</span>
                  )}
                </Link>
  
                {/* Icons for edit and delete */}
                <div className="flex gap-2 items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openAddParticipantModal(chatroom.id);
                    }}
                    className="p-1 text-blue-400 hover:text-blue-500"
                  >
                    <FaUserPlus />
                  </button>
                  {editingChatroomId === chatroom.id ? (
                    <button
                      onClick={handleSaveChatroom}
                      className="p-1 text-green-500 hover:text-green-600"
                    >
                      <FaSave />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditChatroom(chatroom.id, chatroom.name);
                      }}
                      className="p-1 text-yellow-400 hover:text-yellow-500"
                    >
                      <FaEdit />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChatroom(chatroom.id);
                    }}
                    className="p-1 text-red-500 hover:text-red-600"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {isModalOpen && <CreateGroupChat onClose={closeModal} />}
      {isAddParticipantModalOpen && 
        selectedChatroomId && (
          <AddParticipantModal 
            onClose={closeAddParticipantModal} 
            chatroomId={selectedChatroomId} 
          />
        )
      }
    </div>
  );
};

export default ChatRoomList;