import { 
  users, 
  services, 
  projects, 
  commodities,
  type User, 
  type InsertUser,
  type InsertService,
  type InsertProject,
  type InsertCommodity
} from "../shared/schema";
import { db } from './db';
import { eq } from "drizzle-orm";

type Service = typeof services.$inferSelect;
type Project = typeof projects.$inferSelect;
type Commodity = typeof commodities.$inferSelect;

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;

  // Service operations (infrastructure for future API endpoints)
  // These methods are implemented but not yet wired to routes
  getService(id: string): Promise<Service | undefined>;
  getServices(): Promise<Service[]>;
  getServicesByCategory(category: string): Promise<Service[]>;
  createService(insertService: InsertService): Promise<Service>;
  updateService(id: string, updates: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: string): Promise<boolean>;

  // Project operations (infrastructure for future API endpoints)
  // These methods are implemented but not yet wired to routes
  getProject(id: number): Promise<Project | undefined>;
  getProjects(): Promise<Project[]>;
  getProjectsByClient(clientId: number): Promise<Project[]>;
  createProject(insertProject: InsertProject): Promise<Project>;
  updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // Commodity operations (infrastructure for future API endpoints)
  // These methods are implemented but not yet wired to routes
  getCommodity(id: number): Promise<Commodity | undefined>;
  getCommodities(): Promise<Commodity[]>;
  getCommoditiesByCategory(category: string): Promise<Commodity[]>;
  createCommodity(insertCommodity: InsertCommodity): Promise<Commodity>;
  updateCommodity(id: number, updates: Partial<InsertCommodity>): Promise<Commodity | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Service operations
  async getService(id: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || undefined;
  }

  async getServices(): Promise<Service[]> {
    return await db.select().from(services);
  }

  async getServicesByCategory(category: string): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.category, category));
  }

  async createService(insertService: InsertService): Promise<Service> {
    const [service] = await db
      .insert(services)
      .values(insertService)
      .returning();
    return service;
  }

  async updateService(id: string, updates: Partial<InsertService>): Promise<Service | undefined> {
    const [service] = await db
      .update(services)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(services.id, id))
      .returning();
    return service || undefined;
  }

  async deleteService(id: string): Promise<boolean> {
    const result = await db.delete(services).where(eq(services.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Project operations
  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }

  async getProjectsByClient(clientId: number): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.clientId, clientId));
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values(insertProject)
      .returning();
    return project;
  }

  async updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project || undefined;
  }

  async deleteProject(id: number): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Commodity operations
  async getCommodity(id: number): Promise<Commodity | undefined> {
    const [commodity] = await db.select().from(commodities).where(eq(commodities.id, id));
    return commodity || undefined;
  }

  async getCommodities(): Promise<Commodity[]> {
    return await db.select().from(commodities);
  }

  async getCommoditiesByCategory(category: string): Promise<Commodity[]> {
    return await db.select().from(commodities).where(eq(commodities.category, category));
  }

  async createCommodity(insertCommodity: InsertCommodity): Promise<Commodity> {
    const [commodity] = await db
      .insert(commodities)
      .values(insertCommodity)
      .returning();
    return commodity;
  }

  async updateCommodity(id: number, updates: Partial<InsertCommodity>): Promise<Commodity | undefined> {
    const [commodity] = await db
      .update(commodities)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(commodities.id, id))
      .returning();
    return commodity || undefined;
  }
}

export const storage = new DatabaseStorage();
