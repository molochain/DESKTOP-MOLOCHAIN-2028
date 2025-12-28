/**
 * Quote Request Routes
 * Handles quote submission requests for services
 */

import { Router } from "express";
import { z } from "zod";
import { logger } from "../../utils/logger";
import { db } from "../../db";
import { contactSubmissions } from "../../../shared/schema";
import { emailService } from "../../services/email.service";

const router = Router();

const quoteSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  service: z.string().min(1, "Service is required"),
  details: z.string().min(1, "Details are required"),
});

router.post("/", async (req, res) => {
  try {
    const validatedData = quoteSchema.parse(req.body);
    
    const [submission] = await db.insert(contactSubmissions).values({
      name: validatedData.name,
      email: validatedData.email,
      subject: `Quote Request: ${validatedData.service}`,
      message: validatedData.details,
      status: 'pending',
      formTypeId: 2, // Quote Request form type ID
    }).returning();
    
    logger.info(`Quote request received from ${validatedData.email} for service: ${validatedData.service}`);
    
    // Send email notification (non-blocking)
    emailService.notifyFormSubmission('quote', {
      name: validatedData.name,
      email: validatedData.email,
      subject: `Quote Request: ${validatedData.service}`,
      message: `Service: ${validatedData.service}\n\nDetails:\n${validatedData.details}`,
    }).catch(err => {
      logger.warn('Failed to send quote notification email:', err);
    });
    
    res.status(201).json({ 
      success: true,
      message: "Quote request received. We'll get back to you shortly!",
      data: { id: submission.id }
    });
  } catch (error) {
    logger.error("Error processing quote request:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid form data. Please check your inputs and try again.'
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: "Failed to submit quote request. Please try again later." 
    });
  }
});

export default router;
