'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaUserPlus } from 'react-icons/fa'; // Icons for close and add user
import { User } from '@prisma/client'; // Assuming User model from Prisma schema

interface CreateGroupChatProps {
  onClose: () => void; // Function to close the modal
}

const CreateGroupChat = ({ onClose }: CreateGroupChatProps) => {
  const [groupName, setGroupName] = useState('');
  const [participants, setParticipants] = useState<User[]>([]);
  const [suggestions, setSuggestions] = useState<User[]>([]); // User suggestions
  const [query, setQuery] = useState(''); // Input query for searching participants

  // Fetch users (participants) suggestions
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    async function fetchUsers() {
      try {
        console.log('Fetching users with query:', query);
        const res = await fetch(`/api/users/search?name=${query}`);
        if (!res.ok) throw new Error('Failed to fetch users');
        const data: User[] = await res.json();
        setSuggestions(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    }

    fetchUsers();
  }, [query]);

  const handleAddParticipant = (user: User) => {
    setParticipants((prev) => [...prev, user]);
    setQuery(''); // Clear search query after adding a user
  };

  const handleRemoveParticipant = (userId: number) => {
    setParticipants((prev) => prev.filter((participant) => participant.id !== userId));
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || participants.length === 0) {
      alert('Please provide a group name and add participants.');
      return;
    }

    try {
      const res = await fetch('/api/chatrooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: groupName,
          participants: participants.map((user) => user.id), // Only send user ids
        }),
      });

      if (!res.ok) throw new Error('Failed to create group chat');

      const data = await res.json();
      console.log('Group chat created:', data);
      onClose(); // Close the modal after successful creation
    } catch (error) {
      console.error('Error creating group chat:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-gray-800 p-6 rounded-lg w-1/3">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">Create Group Chat</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <FaTimes />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300">Group Name</label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name"
            className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300">Participants</label>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Add participants"
              className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {suggestions.length > 0 && query && (
              <ul className="absolute w-full bg-gray-700 border border-gray-600 rounded-md mt-1 z-10">
                {suggestions.map((user) => (
                  <li
                    key={user.id}
                    className="p-2 hover:bg-gray-600 cursor-pointer flex items-center"
                    onClick={() => handleAddParticipant(user)}
                  >
                    <FaUserPlus className="mr-2" />
                    {user.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {participants.map((user) => (
              <span
                key={user.id}
                className="flex items-center bg-blue-600 text-white rounded-full py-1 px-3"
              >
                {user.name}
                <button
                  className="ml-2 text-xs"
                  onClick={() => handleRemoveParticipant(user.id)}
                >
                  <FaTimes />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose} // Close the modal on cancel
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateGroup}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupChat;
