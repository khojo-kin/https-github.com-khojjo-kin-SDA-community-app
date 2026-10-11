import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';

// Users table linked to Auth UID (Firebase / Clerk)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  username: text('username'),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  church: text('church'),
  isCreator: boolean('is_creator').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Community Posts table
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  caption: text('caption').notNull(),
  location: text('location'),
  churchTag: text('church_tag'),
  kind: text('kind').default('post').notNull(), // 'post' | 'reel'
  mediaUrl: text('media_url'),
  audioTitle: text('audio_title'),
  audioArtist: text('audio_artist'),
  likeCount: integer('like_count').default(0).notNull(),
  commentCount: integer('comment_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Post Comments table
export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  postId: integer('post_id')
    .references(() => posts.id)
    .notNull(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  text: text('text').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// SDA Hymns reference table
export const hymns = pgTable('hymns', {
  number: integer('number').primaryKey(),
  title: text('title').notNull(),
  section: text('section').notNull(),
  author: text('author'),
  lyrics: text('lyrics'),
});

// Sabbath Study Marks & Verse bookmarks
export const sabbathMarks = pgTable('sabbath_marks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  reference: text('reference').notNull(),
  verseText: text('verse_text').notNull(),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
  sabbathMarks: many(sabbathMarks),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));
