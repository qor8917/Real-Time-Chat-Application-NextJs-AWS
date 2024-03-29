import { pgEnum, pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { InferSelectModel, relations } from 'drizzle-orm';

export const profiles = pgTable('Profile', {
  id: uuid('id').primaryKey(),
  userId: text('userId').unique().notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  imageUrl: text('imageUrl').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

export const profileRelation = relations(profiles, ({ many }) => ({
  servers: many(servers),
}));
export const servers = pgTable('Server', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  inviteCode: text('inviteCode').unique(),
  imageUrl: text('imageUrl').notNull(),
  profileId: text('profileId').references(() => profiles.id, {
    onDelete: 'cascade',
  }),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});
export const serverRelation = relations(servers, ({ many, one }) => ({
  channels: many(channels),
  members: many(members),
  profileId: one(profiles, {
    fields: [servers.profileId],
    references: [profiles.id],
  }),
}));

export const channelTypeEnum = pgEnum('channelType', [
  'TEXT',
  'AUDIO',
  'VIDEO',
]);
export const channels = pgTable('Channel', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  type: channelTypeEnum('type').default('TEXT'),
  serverId: text('serverId').references(() => servers.id, {
    onDelete: 'cascade',
  }),
  profileId: text('profileId').references(() => profiles.id, {
    onDelete: 'cascade',
  }),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});
export const channelRelation = relations(channels, ({ many, one }) => ({
  serverId: one(servers, {
    fields: [channels.serverId],
    references: [servers.id],
  }),
  profileId: one(profiles, {
    fields: [channels.profileId],
    references: [profiles.id],
  }),
}));
export const memberTypeEnum = pgEnum('memberType', [
  'ADMIN',
  'MODERATOR',
  'GUEST',
]);
export const members = pgTable('Member', {
  id: uuid('id').primaryKey(),
  role: memberTypeEnum('role').default('GUEST'),
  serverId: text('serverId').references(() => servers.id, {
    onDelete: 'cascade',
  }),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});
export const memberRelation = relations(members, ({ many, one }) => ({
  serverId: one(servers, {
    fields: [members.serverId],
    references: [servers.id],
  }),
}));

export const messages = pgTable('Message', {
  id: uuid('id').primaryKey(),
  content: text('content').notNull(),
  fileUrl: text('fileUrl').notNull(),
  channelId: text('channelId').references(() => channels.id),
  memberId: text('memberId').references(() => members.id),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});
export const messageRelation = relations(messages, ({ one }) => ({
  memberId: one(members, {
    fields: [messages.memberId],
    references: [members.id],
  }),
  channelId: one(channels, {
    fields: [messages.channelId],
    references: [channels.id],
  }),
}));

export type Profile = InferSelectModel<typeof profiles>;
export type Server = InferSelectModel<typeof servers>;
export type Member = InferSelectModel<typeof members>;
export type Channel = InferSelectModel<typeof channels>;
export type Message = InferSelectModel<typeof messages>;
