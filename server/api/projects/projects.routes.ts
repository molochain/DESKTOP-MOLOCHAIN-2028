import { Router } from 'express';
import path from 'path';
import fs from 'fs/promises';
import multer from 'multer';
import crypto from 'crypto';
import { logger } from '../../utils/logger';
import { cacheResponse } from '../../core/cache/cache.service';

const router = Router();

const projectStorage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    const projectsDir = "./attached_assets/projects/";
    try {
      await fs.mkdir(projectsDir, { recursive: true });
      cb(null, projectsDir);
    } catch (error) {
      cb(error as Error, projectsDir);
    }
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(8).toString("hex");
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "-");
    cb(null, uniqueSuffix + "-" + sanitizedFilename);
  },
});

const projectUpload = multer({
  storage: projectStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype === "application/zip" ||
      file.originalname.endsWith(".zip")
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only ZIP archives are allowed for projects.",
        ),
      );
    }
  },
});

router.post(
  "/upload",
  projectUpload.single("project"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No project file uploaded" });
      }

      res.status(200).json({
        message: "Project uploaded successfully",
        project: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          url: `/projects/${req.file.filename}`,
        },
      });

      logger.info(
        `Project uploaded: ${req.file.originalname} (${req.file.filename})`,
      );
    } catch (error) {
      logger.error("Error uploading project:", error);
      res
        .status(500)
        .json({
          message: "Failed to upload project",
          error: (error as Error).message,
        });
    }
  },
);

router.get(
  "/examples",
  cacheResponse("api", undefined, 900),
  async (_req, res) => {
    try {
      const exampleProjects = [
        {
          id: "molochain-docs",
          name: "MolochainDocs2-5325",
          description:
            "Official Molochain ecosystem library with comprehensive documentation and references",
          fileName: "molochain-docs.zip",
          url: "/projects/molochain-docs.zip",
          replitUrl:
            "https://replit.com/t/molochain/repls/MolochainDocs2-5325",
          featured: true,
        },
        {
          id: "api-client-demo",
          name: "API Client Demo",
          description:
            "Example of integrating with the MoloChain API using our JavaScript client library",
          fileName: "api-client-demo.zip",
          url: "/projects/api-client-demo.zip",
          replitUrl: "https://replit.com/@MoloChain/API-Client-Demo",
        },
        {
          id: "tracking-widget",
          name: "Tracking Widget",
          description:
            "Embeddable tracking widget for websites that demonstrates real-time updates using WebSockets",
          fileName: "tracking-widget.zip",
          url: "/projects/tracking-widget.zip",
          replitUrl: "https://replit.com/@MoloChain/Tracking-Widget",
        },
        {
          id: "route-optimization",
          name: "Route Optimization",
          description:
            "Logistics route optimization demo showing how to use our APIs for efficient delivery paths",
          fileName: "route-optimization.zip",
          url: "/projects/route-optimization.zip",
          replitUrl: "https://replit.com/@MoloChain/Route-Optimization",
        },
        {
          id: "commodity-alerts",
          name: "Commodity Alerts",
          description:
            "Real-time commodity price alert system that monitors prices and sends notifications",
          fileName: "commodity-alerts.zip",
          url: "/projects/commodity-alerts.zip",
          replitUrl: "https://replit.com/@MoloChain/Commodity-Alerts",
        },
      ];

      res.status(200).json(exampleProjects);
    } catch (error) {
      logger.error("Error listing example projects:", error);
      res.status(500).json({ message: "Failed to list example projects" });
    }
  },
);

router.get(
  "/",
  cacheResponse("api", undefined, 300),
  async (_req, res) => {
    try {
      const projectsDir = path.join(
        process.cwd(),
        "attached_assets",
        "projects",
      );

      await fs.mkdir(projectsDir, { recursive: true });

      const files = await fs.readdir(projectsDir);

      const projects = files
        .filter((file) => file.endsWith(".zip"))
        .map((file) => ({
          filename: file,
          url: `/projects/${file}`,
          uploadedAt: new Date().toISOString(),
        }));

      res.status(200).json(projects);
    } catch (error) {
      logger.error("Error listing projects:", error);
      res.status(500).json({ message: "Failed to list projects" });
    }
  },
);

router.get("/:id/updates", async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);

    res.json([]);
  } catch (error) {
    logger.error("Error fetching project updates:", error);
    res.status(500).json({ error: "Failed to fetch project updates" });
  }
});

router.post("/:id/milestones", async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const milestone = req.body;

    res.json({ success: true, milestone: { ...milestone, projectId } });
  } catch (error) {
    logger.error("Error adding milestone:", error);
    res.status(500).json({ error: "Failed to add milestone" });
  }
});

export default router;
