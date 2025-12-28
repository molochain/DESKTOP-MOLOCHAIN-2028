import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Divisions - Level 2 (under Departments)
export const divisions = pgTable("divisions", {
  id: serial("id").primaryKey(),
  departmentId: integer("department_id").notNull().references(() => departments.id),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  description: text("description"),
  headId: text("head_id"),
  status: text("status").notNull().default("active"),
  metrics: jsonb("metrics").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Domains - Level 3 (under Divisions)
export const domains = pgTable("domains", {
  id: serial("id").primaryKey(),
  divisionId: integer("division_id").notNull().references(() => divisions.id),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  type: text("type").notNull(), // Technical, Business, Support, etc.
  description: text("description"),
  ownerId: text("owner_id"),
  priority: integer("priority").default(0),
  capabilities: jsonb("capabilities").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Sub-Domains - Level 4 (under Domains)
export const subDomains = pgTable("sub_domains", {
  id: serial("id").primaryKey(),
  domainId: integer("domain_id").notNull().references(() => domains.id),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  specialty: text("specialty"),
  leadId: text("lead_id"),
  teamSize: integer("team_size").default(0),
  technologies: jsonb("technologies").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Units - Level 5 (under Sub-Domains)
export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  subDomainId: integer("sub_domain_id").notNull().references(() => subDomains.id),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  function: text("function"),
  managerId: text("manager_id"),
  capacity: integer("capacity").default(0),
  utilization: integer("utilization").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Sub-Units - Level 6 (under Units)
export const subUnits = pgTable("sub_units", {
  id: serial("id").primaryKey(),
  unitId: integer("unit_id").notNull().references(() => units.id),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  task: text("task"),
  supervisorId: text("supervisor_id"),
  memberCount: integer("member_count").default(0),
  skills: jsonb("skills").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Teams - Level 7 (under Sub-Units)
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  subUnitId: integer("sub_unit_id").notNull().references(() => subUnits.id),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  teamLeadId: text("team_lead_id"),
  size: integer("size").default(0),
  purpose: text("purpose"),
  performanceScore: integer("performance_score").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Workgroups - Level 8 (under Teams)
export const workgroups = pgTable("workgroups", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull().references(() => teams.id),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  objective: text("objective"),
  coordinatorId: text("coordinator_id"),
  memberIds: jsonb("member_ids").default([]),
  deliverables: jsonb("deliverables").default([]),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Create schemas for each entity
export const insertDivisionSchema = createInsertSchema(divisions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDomainSchema = createInsertSchema(domains).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSubDomainSchema = createInsertSchema(subDomains).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUnitSchema = createInsertSchema(units).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSubUnitSchema = createInsertSchema(subUnits).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTeamSchema = createInsertSchema(teams).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWorkgroupSchema = createInsertSchema(workgroups).omit({ id: true, createdAt: true, updatedAt: true });

// Type exports
export type Division = typeof divisions.$inferSelect;
export type InsertDivision = z.infer<typeof insertDivisionSchema>;
export type Domain = typeof domains.$inferSelect;
export type InsertDomain = z.infer<typeof insertDomainSchema>;
export type SubDomain = typeof subDomains.$inferSelect;
export type InsertSubDomain = z.infer<typeof insertSubDomainSchema>;
export type Unit = typeof units.$inferSelect;
export type InsertUnit = z.infer<typeof insertUnitSchema>;
export type SubUnit = typeof subUnits.$inferSelect;
export type InsertSubUnit = z.infer<typeof insertSubUnitSchema>;
export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Workgroup = typeof workgroups.$inferSelect;
export type InsertWorkgroup = z.infer<typeof insertWorkgroupSchema>;

// Import departments reference (ecosystemDepartments is the parent table)
import { ecosystemDepartments as departments } from "./schema";