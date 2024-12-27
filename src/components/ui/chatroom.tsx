'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react'; // Import next-auth's useSession hook

export interface ChatMessage {
  id: number;
  sender: string;
  message: string;
}

interface ChatroomProps {
  chatroomId: string;
}

export default function Chatroom({ chatroomId }: ChatroomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession(); // Get session data

  // Function to fetch messages
  useEffect(() => {
    async function fetchMessages() {
      if (!session) return; // Don't fetch messages if no session exists

      try {
        const res = await fetch(`/api/chatrooms/${chatroomId}`);
        if (!res.ok) throw new Error('Failed to fetch messages');
        const data: ChatMessage[] = await res.json();
        setMessages(data);
      } catch (error) {
        console.log('Error fetching chatroom messages:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();
  }, [chatroomId, session]); // Fetch messages whenever chatroomId or session changes

  // Function to send a message
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
          Authorization: `Bearer ${session?.user?.token}`, // Send token in Authorization header
        },
        body: JSON.stringify({ message: newMessage }),
      });

      if (!res.ok) throw new Error('Failed to send message');
      const data: ChatMessage = await res.json();
      setMessages((prevMessages) => [...prevMessages, data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Handle loading state and authentication check
  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="h-full flex flex-col bg-gray-950 text-gray-300">
        <header className="p-4 bg-gray-800 border-b border-gray-700">
          <h2 className="text-lg font-bold">Chatroom {chatroomId}</h2>
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
        <h2 className="text-lg font-bold">Chatroom {chatroomId}</h2>
      </header>

      <main className="flex-1 p-4 overflow-y-auto">
        {loading ? (
          <p>Loading messages...</p>
        ) : (
          <ul className="space-y-2">
            {messages.map((msg) => (
              <li
                key={msg.id}
                className="p-2 bg-gray-800 rounded hover:bg-gray-700"
              >
                <strong>{msg.sender}:</strong> {msg.message}
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
