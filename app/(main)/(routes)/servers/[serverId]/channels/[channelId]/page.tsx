import { redirectToSignIn } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

import { ChatHeader } from '@/components/chat/chat-header';
import { ChatInput } from '@/components/chat/chat-input';
import { ChatMessages } from '@/components/chat/chat-messages';
import { MediaRoom } from '@/components/media-room';
import {
  getChannelById,
  getMemberByServerIdAndProfileId,
  getProfile,
} from '@/db/queries';
import { ChannelType } from '@/db/schema';

interface ChannelIdPageProps {
  params: {
    serverId: string;
    channelId: string;
  };
}

const ChannelIdPage = async ({ params }: ChannelIdPageProps) => {
  console.log('채널가져오기 시작', new Date().getSeconds(), Date.now());
  const profile = await getProfile();

  if (!profile) {
    return redirectToSignIn();
  }
  console.log(
    'DB채널가져오기 시작',
    new Date().getSeconds(),
    params.channelId,
    Date.now()
  );

  const channel = await getChannelById(params.channelId);

  const member = await getMemberByServerIdAndProfileId(
    params.serverId,
    profile.id
  );
  console.log(
    'DB채널가져오기 끝남',
    new Date().getSeconds(),
    params.channelId,
    Date.now()
  );

  if (!channel || !member) {
    redirect('/');
  }
  console.log('채널가져오기 끝남', new Date().getSeconds(), Date.now());

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
            name={channel.name}
            chatId={channel.id}
            type="channel"
            apiUrl="/api/messages"
            socketUrl="/api/socket/messages"
            socketQuery={{
              channelId: channel.id,
              serverId: channel.serverId,
            }}
            paramKey="channelId"
            paramValue={channel.id}
          />
          <ChatInput
            name={channel.name}
            type="channel"
            apiUrl="/api/socket/messages"
            query={{
              channelId: channel.id,
              serverId: channel.serverId,
            }}
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
