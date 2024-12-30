import Link from 'next/link';
import { useState, useEffect } from 'react';
import { AiOutlineClose } from 'react-icons/ai';

interface Participant {
  id: number;
  name: string;
}

interface ParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatroomId: string;
}

const ParticipantsModal = ({ isOpen, onClose, chatroomId }: ParticipantsModalProps) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    async function fetchParticipants() {
      setLoading(true);

      try {
        const res = await fetch(`/api/chatrooms/${chatroomId}/participants`);
        if (!res.ok) throw new Error('Failed to fetch participants');
        const data = await res.json();
        console.log('participants:', data);
        setParticipants(data.participants); // Ensure the data is structured as expected
      } catch (error) {
        console.log('Error fetching participants:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchParticipants();
  }, [isOpen, chatroomId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-gray-800 text-white p-6 rounded-md w-80">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Participants</h3>
          <AiOutlineClose className="cursor-pointer" onClick={onClose} />
        </div>

        {loading ? (
          <p>Loading participants...</p>
        ) : (
          <ul className="mt-4">
            {participants.length > 0 ? (
              participants.map((participant) => (
                <li key={participant.id} className="py-2">
                  {/* Make participant name clickable but not look like a link */}
                  <Link
                    href={`/profile/${participant.id}`}
                    className="text-white cursor-pointer hover:text-blue-500"
                  >
                    {participant.name}
                  </Link>
                </li>
              ))
            ) : (
              <li>No participants found</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ParticipantsModal;
