import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema from the original file
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Workflow schema
export const workflows = pgTable("workflows", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  nodes: jsonb("nodes").notNull(),
  connections: jsonb("connections").notNull(),
  createdBy: integer("created_by").notNull(),
  status: text("status").notNull().default("draft"),
  version: text("version").notNull().default("0.1"),
  lastSaved: timestamp("last_saved").notNull().defaultNow(),
});

export const insertWorkflowSchema = createInsertSchema(workflows).omit({
  id: true,
  lastSaved: true,
});

export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;
export type Workflow = typeof workflows.$inferSelect;

// Node schema for workflow nodes
export const nodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: z.record(z.any()).optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

export type Node = z.infer<typeof nodeSchema>;

// Connection schema for node connections
export const connectionSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourcePort: z.string().optional(),
  targetPort: z.string().optional(),
  sourcePortIndex: z.number().optional(),
  targetPortIndex: z.number().optional(),
});

export type Connection = z.infer<typeof connectionSchema>;

// Agent schema
export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  goals: jsonb("goals").notNull(),
  memory: integer("memory").notNull(),
  modelId: integer("model_id").notNull(),
});

export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
});

export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;

// Model schema for LLMs
export const models = pgTable("models", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  provider: text("provider").notNull(),
  parameters: jsonb("parameters").notNull(),
  status: text("status").notNull().default("available"),
});

export const insertModelSchema = createInsertSchema(models).omit({
  id: true,
});

export type InsertModel = z.infer<typeof insertModelSchema>;
export type Model = typeof models.$inferSelect;

// Connector schema for external systems
export const connectors = pgTable("connectors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  config: jsonb("config").notNull(),
  status: text("status").notNull().default("configured"),
});

export const insertConnectorSchema = createInsertSchema(connectors).omit({
  id: true,
});

export type InsertConnector = z.infer<typeof insertConnectorSchema>;
export type Connector = typeof connectors.$inferSelect;
