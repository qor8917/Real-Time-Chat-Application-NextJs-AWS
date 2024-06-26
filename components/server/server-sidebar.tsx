import { redirect } from 'next/navigation';
import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from 'lucide-react';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

import { ServerHeader } from './server-header';
import { ServerSearch } from './server-search';
import { ServerSection } from './server-section';
import { ServerChannel } from './server-channel';
import { ServerMember } from './server-member';
import { getProfile, getServerById } from '@/db/queries';
import { Channel, ChannelType, Member, MemberRole, Server } from '@/db/schema';

interface ServerSidebarProps {
  serverId: string;
}

const iconMap = {
  [ChannelType.TEXT]: <Hash className="mr-2 h-4 w-4" />,
  [ChannelType.AUDIO]: <Mic className="mr-2 h-4 w-4" />,
  [ChannelType.VIDEO]: <Video className="mr-2 h-4 w-4" />,
};

const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: (
    <ShieldCheck className="h-4 w-4 mr-2 text-indigo-500" />
  ),
  [MemberRole.ADMIN]: <ShieldAlert className="h-4 w-4 mr-2 text-rose-500" />,
};

export const ServerSidebar = async ({ serverId }: ServerSidebarProps) => {
  const profile = await getProfile();

  if (!profile) {
    return redirect('/');
  }
  const server = (await getServerById(serverId)) as Server;

  const textChannels = server?.channels?.filter(
    (channel: any) => channel.type === ChannelType.TEXT
  );
  const audioChannels = server?.channels?.filter(
    (channel: any) => channel.type === ChannelType.AUDIO
  );
  const videoChannels = server?.channels?.filter(
    (channel: any) => channel.type === ChannelType.VIDEO
  );
  const members = server?.members?.filter(
    (member: any) => member.profileId !== profile.id
  );

  if (!server) {
    return redirect('/');
  }

  const role = server?.members!.find(
    (member: any) => member.profileId === profile.id
  )?.role as MemberRole;

  return (
    <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
      <ServerHeader server={server} role={role} />
      <ScrollArea className="flex-1 px-3">
        <div className="mt-2">
          <ServerSearch
            data={[
              {
                label: 'Text Channels',
                type: 'channel',
                data: textChannels?.map((channel: Channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type],
                })),
              },
              {
                label: 'Voice Channels',
                type: 'channel',
                data: audioChannels?.map((channel: Channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type],
                })),
              },
              {
                label: 'Video Channels',
                type: 'channel',
                data: videoChannels?.map((channel: Channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type],
                })),
              },
              {
                label: 'Members',
                type: 'member',
                data: members?.map((member: Member) => ({
                  id: member.id,
                  // name: member.profile.name,
                  name: 'aaa',
                  icon: roleIconMap[member.role],
                })),
              },
            ]}
          />
        </div>
        <Separator className="bg-zinc-200 dark:bg-zinc-700 rounded-md my-2" />
        {!!textChannels?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="channels"
              channelType={ChannelType.TEXT}
              role={role}
              label="Text Channels"
              server={server}
            />
            <div className="space-y-[2px]">
              {textChannels.map((channel: any) => (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  role={role!}
                  server={server!}
                />
              ))}
            </div>
          </div>
        )}
        {!!audioChannels?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="channels"
              channelType={ChannelType.AUDIO}
              role={role}
              label="Voice Channels"
              server={server}
            />
            <div className="space-y-[2px]">
              {audioChannels.map((channel: any) => (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  role={role}
                  server={server}
                />
              ))}
            </div>
          </div>
        )}
        {!!videoChannels?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="channels"
              channelType={ChannelType.VIDEO}
              role={role}
              label="Video Channels"
              server={server}
            />
            <div className="space-y-[2px]">
              {videoChannels.map((channel: any) => (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  role={role}
                  server={server}
                />
              ))}
            </div>
          </div>
        )}
        {!!members?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="members"
              role={role}
              label="Members"
              server={server}
            />
            <div className="space-y-[2px]">
              {members.map((member: any) => (
                <ServerMember key={member.id} member={member} />
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
