'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react'; 
import { database } from '@/config'; 
import { ref, onChildChanged, onChildAdded,onChildRemoved, get, off, query, orderByChild, equalTo, DataSnapshot } from 'firebase/database'; 
import { AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai'; // Add icons for edit and delete
import ParticipantModal from '../modals/participants-modal'
export interface ChatMessage {
  id: number;
  sender: string;
  message: string;
  senderId: number;
}

interface ChatroomProps {
  chatroomId: string;
}

export default function Chatroom({ chatroomId }: ChatroomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatRoomName, setChatRoomName] = useState<string>(''); 
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editedMessage, setEditedMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: session, status } = useSession(); 

  useEffect(() => {
    async function fetchChatroomDetails() {
      if (!session) return;

      try {
        const res = await fetch(`/api/chatrooms/${chatroomId}`);
        if (!res.ok) throw new Error('Failed to fetch chatroom details');
        const data = await res.json();

        setChatRoomName(data?.chatRoomName?.name ?? 'Chatroom'); 
        setMessages(data?.messages ?? []);
      } catch (error) {
        console.log('Error fetching chatroom details:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchChatroomDetails();
  }, [chatroomId, session]);

  useEffect(() => {
    if (!chatroomId) return;

    const messagesRef = ref(database, 'messages');
    const chatroomMessagesRef = query(messagesRef, orderByChild('chatRoomId'), equalTo(Number(chatroomId)));

    const handleNewMessage = async (snapshot: DataSnapshot) => {
      if (snapshot.exists()) {
        const newMessageData = snapshot.val();
        const senderId = newMessageData.senderId;

        // Fetch sender's name asynchronously
        const userRef = ref(database, `users/${senderId}`);
        const userSnapshot = await get(userRef);
        const userName = userSnapshot.exists() ? userSnapshot.val().name : 'Unknown User';

        // Create a new message object with the sender's name
        const newMessage: ChatMessage = {
          id: newMessageData.id,
          sender: userName, 
          message: newMessageData.content,
          senderId: senderId,
        };

        // Update state only if the message isn't already present
        setMessages((prevMessages) => {
          const existingMessage = prevMessages.find((msg) => msg.id === newMessage.id);
          if (existingMessage) {
              return prevMessages;  // If message exists, don't add it again
          }
          return [...prevMessages, newMessage];
      });
        
      }
    };

  // Handle updated messages
  const handleUpdatedMessage = async (snapshot: DataSnapshot) => {
    if (snapshot.exists()) {
      const updatedMessageData = snapshot.val();
      const senderId = updatedMessageData.senderId;

      const userRef = ref(database, `users/${senderId}`);
      const userSnapshot = await get(userRef);
      const userName = userSnapshot.exists() ? userSnapshot.val().name : 'Unknown User';

      const updatedMessage: ChatMessage = {
        id: updatedMessageData.id,
        sender: userName,
        message: updatedMessageData.content,
        senderId: senderId,
      };

      setMessages((prevMessages) => {
        return prevMessages.map((msg) =>
          msg.id === updatedMessage.id ? { ...msg, message: updatedMessage.message } : msg
        );
      });
    }
  };
  const handleDeletedMessage = async (snapshot: DataSnapshot) => {
    if (snapshot.exists()) {
      const deletedMessageData = snapshot.val();
      const deletedMessageId = deletedMessageData.id;

      // Remove deleted message from the state
      setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== deletedMessageId));
    }
  };


  // Set up listeners for new and updated messages
  const newMessageListener = onChildAdded(chatroomMessagesRef, handleNewMessage);
  const updatedMessageListener = onChildChanged(chatroomMessagesRef, handleUpdatedMessage);
  const deletedMessageListener = onChildRemoved(chatroomMessagesRef, handleDeletedMessage);
  return () => {
    off(chatroomMessagesRef, 'child_added', handleNewMessage);
    off(chatroomMessagesRef, 'child_changed', handleUpdatedMessage);
    off(chatroomMessagesRef, 'child_removed', handleDeletedMessage);
  };
}, [chatroomId]); // Dependency array ensures re-run only when chatroomId changes

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    if (!session) {
      console.error('You need to be logged in to send a message.');
      return;
    }

    try {
      const res = await fetch(`/api/chatrooms/${chatroomId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.token}`, 
        },
        body: JSON.stringify({ message: newMessage }),
      });

      if (!res.ok) throw new Error('Failed to send message');
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const updateMessage = async (messageId: number) => {
    if (!editedMessage.trim()) return;

    try {
      const res=await fetch(`/api/chatrooms/${chatroomId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.token}`, 
         },
        body: JSON.stringify({ messageId, editedMessage }),
      });

      if (!res.ok) throw new Error('Failed to update message');
      
      // Update local state
      setMessages((prevMessages) => {
        return prevMessages.map((msg) =>
          msg.id === messageId ? { ...msg, message: editedMessage } : msg
        );
      });

      setEditingMessageId(null);
      setEditedMessage('');
    } catch (error) {
      console.error('Error updating message:', error);
    }
  };

  const deleteMessage = async (messageId: number) => {
    try {
      // Send delete request to API
      const res = await fetch(`/api/chatrooms/${chatroomId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId }),
      });

      if (!res.ok) throw new Error('Failed to delete message');

      // Remove message from state
      setMessages((prevMessages) => {
        return prevMessages.filter((msg) => msg.id !== messageId);
      });
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="h-full flex flex-col bg-gray-950 text-gray-300">
        <header className="p-4 bg-gray-800 border-b border-gray-700">
          <h2 className="text-lg font-bold">Chatroom</h2>
        </header>
        <main className="flex-1 p-4 overflow-y-auto">
          <p>You need to be logged in to view or send messages.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-950 text-gray-300">
      <header className="p-4 bg-gray-800 border-b border-gray-700">
        <h2 className="text-lg font-bold">{chatRoomName}</h2>
      </header>

      <main className="flex-1 p-4 overflow-y-auto">
        {loading ? (
          <p>Loading messages...</p>
        ) : (
<ul className="space-y-2">
  {messages.map((msg) => (
    <li
      key={msg.id}
      className="relative p-2 bg-gray-800 rounded hover:bg-gray-700 group"
    >
      <div className="flex items-center">
        <strong>{msg.sender}:</strong>
        {editingMessageId === msg.id ? (
          <input
            type="text"
            value={editedMessage}
            onChange={(e) => setEditedMessage(e.target.value)}
            className="flex-1 p-2 bg-gray-700 text-gray-300 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <span className="flex-grow pl-2">{msg.message}</span>
        )}
        {/* Check if the current user is the sender before showing edit/delete icons */}
        {session?.user.id == msg.senderId && (
          <div className="absolute right-2 flex gap-2 opacity-0 group-hover:opacity-100">
            <AiOutlineEdit
              onClick={() => {
                setEditingMessageId(msg.id);
                setEditedMessage(msg.message);
              }}
              className="cursor-pointer text-blue-500"
            />
            <AiOutlineDelete
              onClick={() => deleteMessage(msg.id)}
              className="cursor-pointer text-red-500"
            />
          </div>
        )}
      </div>

      {editingMessageId === msg.id && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => updateMessage(msg.id)}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-400"
          >
            Save
          </button>
          <button
            onClick={() => setEditingMessageId(null)}
            className="p-2 bg-gray-500 text-white rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      )}
    </li>
  ))}
</ul>

        )}
      </main>

      <footer className="p-4 border-t border-gray-700 bg-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 bg-gray-700 text-gray-300 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-400"
          >
            Send
          </button>
        </div>
      </footer>
    </div>
  );
}
