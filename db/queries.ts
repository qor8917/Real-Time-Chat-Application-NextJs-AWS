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
export const getServersByProfileId = async (id: any) => {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  const server = await db.query.servers.findMany({
    where: eq(servers.profileId, id),
    orderBy: (servers, { asc }) => [asc(servers.createdAt)],
  });

  return server;
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
  await db.delete(servers).where(eq(servers.id, id));
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
