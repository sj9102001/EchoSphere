'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaUserPlus } from 'react-icons/fa'; // Icons for close and add user
import { User } from '@prisma/client'; // Assuming User model from Prisma schema

interface AddParticipantModalProps {
  onClose: () => void; // Function to close the modal
  chatroomId: string; // ID of the chatroom to add participants to
}

const AddParticipantModal = ({ onClose, chatroomId }: AddParticipantModalProps) => {
  const [query, setQuery] = useState(''); // Input query for searching participants
  const [suggestions, setSuggestions] = useState<User[]>([]); // User suggestions
  const [selectedParticipants, setSelectedParticipants] = useState<User[]>([]);
  const [chatroomParticipants, setChatroomParticipants] = useState<User[]>([]); // Participants of the chatroom

  // Fetch chatroom participants
  useEffect(() => {
    async function fetchParticipants() {
      try {
        const res = await fetch(`/api/chatrooms/${chatroomId}/participants`);
        if (!res.ok) throw new Error('Failed to fetch chatroom participants');
        const data = await res.json();
        setChatroomParticipants(data.participants);
      } catch (error) {
        console.error('Error fetching chatroom participants:', error);
      }
    }

    fetchParticipants();
  }, [chatroomId]);

  // Fetch user suggestions based on query
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    async function fetchUsers() {
      try {
        const res = await fetch(`/api/users/search?name=${query}`);
        if (!res.ok) throw new Error('Failed to fetch user suggestions');
        const data: User[] = await res.json();

        // Filter out users who are already participants in the chatroom
        const filteredSuggestions = data.filter(
          (user) => !chatroomParticipants.some((participant) => participant.id === user.id)
        );

        setSuggestions(filteredSuggestions);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    }

    fetchUsers();
  }, [query, chatroomParticipants]);

  const handleAddParticipant = (user: User) => {
    if (!selectedParticipants.find((participant) => participant.id === user.id)) {
      setSelectedParticipants((prev) => [...prev, user]);
    }
    setQuery(''); // Clear search query
  };

  const handleRemoveParticipant = (userId: number) => {
    setSelectedParticipants((prev) =>
      prev.filter((participant) => participant.id !== userId)
    );
  };

  const handleSaveParticipants = async () => {
    if (selectedParticipants.length === 0) {
      alert('Please select at least one participant.');
      return;
    }

    try {
      const res = await fetch(`/api/chatrooms/${chatroomId}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participants: selectedParticipants.map((user) => user.id), // Send user IDs only
        }),
      });

      if (!res.ok) throw new Error('Failed to add participants');
      onClose(); // Close the modal after successful addition
    } catch (error) {
      console.error('Error adding participants:', error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-2xl w-full max-w-md space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Add Participants</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-100">
            <FaTimes />
          </button>
        </div>
        <input
          type="text"
          placeholder="Search users by name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="space-y-2">
          {suggestions.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
            >
              <span>{user.name}</span>
              <button
                onClick={() => handleAddParticipant(user)}
                className="p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700"
              >
                <FaUserPlus />
              </button>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <h3 className="font-bold text-lg">Selected Participants</h3>
          {selectedParticipants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
            >
              <span>{participant.name}</span>
              <button
                onClick={() => handleRemoveParticipant(participant.id)}
                className="p-2 bg-red-600 rounded-full text-white hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={handleSaveParticipants}
          className="w-full bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default AddParticipantModal;
