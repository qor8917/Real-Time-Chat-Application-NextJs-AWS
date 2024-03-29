'use server';
import { auth } from '@clerk/nextjs';
import db from '@/db/drizzle';
import {
  type Profile,
  type Server,
  profiles,
  servers,
  channels,
} from '@/db/schema';
import { eq } from 'drizzle-orm';
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
  const newProfile: Profile[] = await db
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
    return undefined;
  }

  const server = await db.query.servers.findFirst({
    where: eq(servers.profileId, id),
  });

  return server;
};

export const createServer = async (imageUrl: string, name: string) => {
  const profile = await getProfile();
  const newServer: Server[] = await db
    .insert(servers)
    .values([
      {
        id: v4(),
        name,
        inviteCode: v4(),
        imageUrl,
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
  return newServer;
};
