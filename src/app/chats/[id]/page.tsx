// app/chatroom/[id]/page.tsx
import Chatroom from '../../../components/ui/chatroom';

export default async function ChatroomDetail({ params }: { params: { id: string } }) {
  const { id } = await params;

  return <Chatroom chatroomId={id} />;
}
