import {
  pgEnum,
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';
import {
  type InferSelectModel,
  relations,
  InferInsertModel,
} from 'drizzle-orm';

//프로필 테이블
export const profiles = pgTable('Profile', {
  id: uuid('id').primaryKey(),
  userId: text('userId').unique().notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  imageUrl: text('imageUrl'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

export const profileRelation = relations(profiles, ({ many }) => ({
  servers: many(servers),
}));

//서버 테이블
export const servers = pgTable('Server', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  inviteCode: text('inviteCode').unique().notNull(),
  imageUrl: text('imageUrl'),
  profileId: text('profileId').references(() => profiles.id, {
    onDelete: 'cascade',
  }),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});
export const serverRelation = relations(servers, ({ many, one }) => ({
  channels: many(channels),
  members: many(members),
  profile: one(profiles, {
    fields: [servers.profileId],
    references: [profiles.id],
  }),
}));

//채널 테이블
export const channelTypeEnum = pgEnum('channelType', [
  'TEXT',
  'AUDIO',
  'VIDEO',
]);
export enum ChannelType {
  TEXT = 'TEXT',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
}
export const channels = pgTable('Channel', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  type: channelTypeEnum('type').default('TEXT').notNull(),
  serverId: text('serverId')
    .references(() => servers.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  profileId: text('profileId')
    .references(() => profiles.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});
export const channelRelation = relations(channels, ({ one }) => ({
  server: one(servers, {
    fields: [channels.serverId],
    references: [servers.id],
  }),
  profile: one(profiles, {
    fields: [channels.profileId],
    references: [profiles.id],
  }),
}));

//멤버 테이블
export const memberTypeEnum = pgEnum('memberType', [
  'ADMIN',
  'MODERATOR',
  'GUEST',
]);
export enum MemberRole {
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  GUEST = 'GUEST',
}
export const members = pgTable('Member', {
  id: uuid('id').primaryKey(),
  role: memberTypeEnum('role').default('GUEST').notNull(),
  serverId: text('serverId').references(() => servers.id, {
    onDelete: 'cascade',
  }),
  profileId: text('profileId').references(() => profiles.id, {
    onDelete: 'cascade',
  }),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});
export const memberRelation = relations(members, ({ one }) => ({
  server: one(servers, {
    fields: [members.serverId],
    references: [servers.id],
  }),
  profile: one(profiles, {
    fields: [members.profileId],
    references: [profiles.id],
  }),
}));

//메세지 테이블
export const messages = pgTable('Message', {
  id: uuid('id').primaryKey(),
  content: text('content').notNull(),
  fileUrl: text('fileUrl').notNull(),
  deleted: boolean('deleted').default(false),
  channelId: text('channelId').references(() => channels.id),
  memberId: text('memberId').references(() => members.id),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});
export const messageRelation = relations(messages, ({ one }) => ({
  member: one(members, {
    fields: [messages.memberId],
    references: [members.id],
  }),
  channel: one(channels, {
    fields: [messages.channelId],
    references: [channels.id],
  }),
}));

export type Profile =
  | (InferSelectModel<typeof profiles> & {
      servers: Server[];
    })
  | InferSelectModel<typeof profiles>;
export type InsertProfile = InferInsertModel<typeof profiles>;

export type Server =
  | (InferSelectModel<typeof servers> & {
      channels: Channel[];
      members: Member[];
      profile: Profile;
    })
  | InferSelectModel<typeof servers>;

export type InsertServer =
  | (InferInsertModel<typeof servers> & {
      channels: Channel[];
      members: Member[];
      profile: Profile;
    })
  | InferInsertModel<typeof servers>;

export type Member =
  | (InferSelectModel<typeof members> & {
      server: Server;
      profile: Profile;
    })
  | InferSelectModel<typeof members>;
export type Channel =
  | (InferSelectModel<typeof channels> & {
      server: Server;
      profile: Profile;
    })
  | InferSelectModel<typeof channels>;
export type Message = InferSelectModel<typeof messages> & {
  member: Member;
  channel: Channel;
};
