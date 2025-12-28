// server/external-status.ts
import type { Express, Request, Response } from "express";
import { db } from "./db"; // اگر اسم export تو db.ts چیز دیگری است، همان را استفاده کن
// یا اگر Neon مستقیم استفاده می‌کنی، این خط را با درایور خودت هماهنگ کن

export function registerExternalStatusRoutes(app: Express) {
  app.get("/api/external/status", async (req: Request, res: Response) => {
    try {
      // اینجا فعلاً یک تست ساده می‌زنیم؛ اگر خواستی بعداً real health + counts اضافه می‌کنیم
      // مثلاً:
      // const users = await db.select().from(usersTable).limit(1);

      return res.json({
        ok: true,
        service: "molochain-platform",
        mode: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString(),
        webSocket: {
          namespaces: [
            "/ws/main",
            "/ws/tracking",
            "/ws/collaboration",
            "/ws/mololink",
            "/ws/notifications",
            "/ws/project-updates",
            "/ws/activity-logs",
            "/ws/commodity-chat",
          ],
        },
        database: {
          status: "connected", // اگر خواستی با یک query واقعی تست کن
        },
        message: "External status endpoint is alive.",
      });
    } catch (error) {
      console.error("External status error:", error);
      return res.status(500).json({
        ok: false,
        error: "EXTERNAL_STATUS_FAILED",
      });
    }
  });
}
