'use server';
import { auth } from '@clerk/nextjs';
import db from '@/db/drizzle';
import {
  type Server,
  profiles,
  servers,
  channels,
  members,
  MemberRole,
  InsertServer,
  InsertProfile,
  Channel,
  ChannelType,
} from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { v4 } from 'uuid';

export const getProfile = async () => {
  const { userId } = auth();

  if (!userId) {
    return undefined;
  }
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });
  return profile;
};
export const createProfile = async (user: any) => {
  const newProfile: InsertProfile[] = await db
    .insert(profiles)
    .values([
      {
        id: v4(),
        userId: user.id,
        name: `${user.firstName} ${user.lastName}`,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
    .returning();

  return newProfile;
};
export const getServerByProfileId = async (id: any) => {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  const server = await db.query.servers.findFirst({
    where: eq(servers.profileId, id),
    with: {
      channels: true,
      members: { with: { profile: true } },
      profile: true,
    },
  });
  return server;
};
export const getServerByInviteCodeAndIncludeProfile = async (
  inviteCode: any,
  profileId: any
) => {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  const server = await db.query.servers.findFirst({
    where: eq(servers.inviteCode, inviteCode),
    with: {
      channels: true,
      members: { where: eq(members.profileId, profileId) },
      profile: true,
    },
  });
  return server;
};
export const getServerByInviteCode = async (inviteCode: any) => {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  const server = await db.query.servers.findFirst({
    where: eq(servers.inviteCode, inviteCode),
    with: {
      channels: true,
      members: true,
      profile: true,
    },
  });
  return server;
};
export const getServersByProfileId = async (id: any) => {
  const { userId } = auth();

  if (!userId) {
    return null;
  }
  const FoundServers: any[] = [];
  //사용자가 멤버로서 속해있는 모든 멤버 찾음
  const membersByProfile = await db.query.members.findMany({
    where: eq(members.profileId, id),
  });
  //멤버로서 속해있는 모든 서버 찾음

  for (const member of membersByProfile) {
    const server = await db.query.servers.findFirst({
      where: eq(servers.id, member.serverId!),
    });
    FoundServers.push(server);
  }

  return FoundServers;
};
export const getServerById = async (id: any) => {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  const server = await db.query.servers.findFirst({
    where: eq(servers.id, id),
    with: {
      channels: true,
      members: { with: { profile: true } },
      profile: true,
    },
  });
  return server;
};
export const getInitialChannelByServerId = async (serverId: string) => {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  const server = await db.query.servers.findFirst({
    where: eq(servers.id, serverId),
    with: {
      channels: {
        where: eq(channels.name, 'general'),
        orderBy: (channels, { asc }) => [asc(channels.createdAt)],
      },
      members: { with: { profile: true } },
    },
  });
  return server;
};
export const createServer = async (
  name: string | null,
  imageUrl: string | null
) => {
  const profile = await getProfile();
  const newServer: InsertServer[] = await db
    .insert(servers)
    .values([
      {
        id: v4(),
        name: name ? name : profile!.name,
        inviteCode: v4(),
        imageUrl: imageUrl ? imageUrl : profile!.imageUrl,
        profileId: profile!.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
    .returning();

  await db.insert(channels).values([
    {
      id: v4(),
      name: 'general',
      profileId: profile!.id,
      serverId: newServer[0].id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  await db.insert(members).values([
    {
      id: v4(),
      role: MemberRole.ADMIN,
      profileId: profile!.id,
      serverId: newServer[0].id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  return newServer;
};

export const updateServerInviteCode = async (
  serverId: string
): Promise<Server> => {
  const updatedServer = await db
    .update(servers)
    .set({ inviteCode: v4() })
    .where(eq(servers.id, serverId))
    .returning();
  return updatedServer[0];
};
export const updateServerNameAndImageUrl = async (
  serversId: string,
  name: string | null,
  imageUrl: string | null
): Promise<Server> => {
  const profile = await getProfile();

  const updatedServer = await db
    .update(servers)
    .set({
      name: name ? name : profile?.name,
      imageUrl: imageUrl ? imageUrl : profile?.imageUrl,
    })
    .where(eq(servers.id, serversId))
    .returning();
  return updatedServer[0];
};
export const updateServerMember = async (
  serversId: string,
  name: string | null,
  imageUrl: string | null
): Promise<Server> => {
  const profile = await getProfile();

  const updatedServer = await db
    .update(servers)
    .set({
      name: name ? name : profile?.name,
      imageUrl: imageUrl ? imageUrl : profile?.imageUrl,
    })
    .where(eq(servers.id, serversId))
    .returning();
  return updatedServer[0];
};
export const createChannel = async (
  serverId: string,
  name: string,
  type: ChannelType
) => {
  const profile = await getProfile();
  const createChannel = await db.insert(channels).values([
    {
      id: v4(),
      name,
      type,
      profileId: profile!.id,
      serverId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
};

export const deleteServerById = async (id: string) => {
  return await db.delete(servers).where(eq(servers.id, id)).returning();
};
export const deleteChannelById = async (id: string) => {
  await db.delete(channels).where(eq(channels.id, id));
};
export const updateChannelNameAndType = async (
  channelId: string,
  name: string | null,
  type: ChannelType
): Promise<Channel> => {
  const updatedChannel = await db
    .update(channels)
    .set({
      name: name ? name : '제목없음',
      type,
    })
    .where(eq(channels.id, channelId))
    .returning();
  return updatedChannel[0];
};
export const getChannelById = async (id: any) => {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  const channel = await db.query.channels.findFirst({
    where: eq(channels.id, id),
  });
  return channel;
};
export const getMemberByServerIdAndProfileId = async (
  serverId: any,
  profileId: any
) => {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  const channel = await db.query.members.findFirst({
    where: and(
      eq(members.serverId, serverId),
      eq(members.profileId, profileId)
    ),
    with: {
      profile: true,
    },
  });
  return channel;
};

export const createMember = async (serverId: string, profileId: string) => {
  const createMember = await db.insert(members).values([
    {
      id: v4(),
      role: MemberRole.GUEST,
      profileId: profileId,
      serverId: serverId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  return createMember;
};
export const deleteMember = async (serverId: string, profileId: string) => {
  const deletedUser = await db
    .delete(members)
    .where(
      and(eq(members.profileId, profileId), eq(members.serverId, serverId))
    )
    .returning();
  return deletedUser;
};
