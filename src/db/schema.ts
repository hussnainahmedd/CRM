import { pgTable, text, timestamp, integer, boolean, uuid } from 'drizzle-orm/pg-core';

export const patients = pgTable('patients', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  age: integer('age').notNull(),
  gender: text('gender').notNull(),
  phone: text('phone'),
  notes: text('notes'),
  tags: text('tags').array(), 
  total_visits: integer('total_visits').notNull().default(0),
  total_fees: integer('total_fees').notNull().default(0),
  created_at: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  last_synced_at: timestamp('last_synced_at', { mode: 'date' }).notNull().defaultNow(),
});

export const visits = pgTable('visits', {
  id: uuid('id').primaryKey(),
  patient_id: uuid('patient_id').references(() => patients.id, { onDelete: 'cascade' }).notNull(),
  services: text('services').array().notNull(),
  fee_charged: integer('fee_charged').notNull(),
  payment_method: text('payment_method').notNull(),
  timestamp: timestamp('timestamp', { mode: 'date' }).notNull().defaultNow(),
  flag_status: boolean('flag_status').notNull().default(false),
  flag_reason: text('flag_reason'),
  last_synced_at: timestamp('last_synced_at', { mode: 'date' }).notNull().defaultNow(),
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: text('username').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  role: text('role').notNull(), // 'doctor' | 'receptionist'
});
