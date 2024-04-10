import { redirectToSignIn } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

import { ChatHeader } from '@/components/chat/chat-header';
import { ChatInput } from '@/components/chat/chat-input';
import { MediaRoom } from '@/components/media-room';
import {
  getChannelById,
  getMemberByServerIdAndProfileId,
  getProfile,
} from '@/db/queries';
import { ChannelType } from '@/db/schema';
import { ChatMessages } from '@/components/chat/chat-messages';

interface ChannelIdPageProps {
  params: {
    serverId: string;
    channelId: string;
  };
}

const ChannelIdPage = async ({ params }: ChannelIdPageProps) => {
  const profile = await getProfile();

  if (!profile) {
    return redirectToSignIn();
  }

  const channel = await getChannelById(params.channelId);

  const member = await getMemberByServerIdAndProfileId(
    params.serverId,
    profile.id
  );

  if (!channel || !member) {
    redirect('/');
  }
  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader
        name={channel.name}
        serverId={channel.serverId}
        type="channel"
      />
      {channel.type === ChannelType.TEXT && (
        <>
          <ChatMessages
            member={member}
            profile={profile}
            name={channel.name}
            chatId={channel.id}
            type="channel"
            apiUrl="https://7m3zd43vv6.execute-api.me-central-1.amazonaws.com/product/chats"
          />
          <ChatInput
            name={channel.name}
            member={member}
            type="channel"
            apiUrl="/api/socket/messages"
            channelId={channel.id}
          />
        </>
      )}
      {channel.type === ChannelType.AUDIO && (
        <MediaRoom chatId={channel.id} video={false} audio={true} />
      )}
      {channel.type === ChannelType.VIDEO && (
        <MediaRoom chatId={channel.id} video={true} audio={true} />
      )}
    </div>
  );
};

export default ChannelIdPage;
