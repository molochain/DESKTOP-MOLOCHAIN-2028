import { db } from '../core/database/db.service';
import { eq, desc, and, gte, lte, like, sql, isNotNull } from 'drizzle-orm';
import {
  services,
  serviceBookings,
  serviceReviews,
  servicePricingTiers,
  serviceMetrics,
  serviceComparisons,
  serviceInquiries,
  serviceTestimonials,
  serviceFaqs,
  serviceAvailability,
  type Service,
  type ServiceBooking,
  type ServiceReview,
  type ServicePricingTier,
  type ServiceMetric,
  type InsertServiceBooking,
  type InsertServiceReview,
  type InsertServicePricingTier,
  type InsertServiceMetric,
  type InsertServiceComparison,
} from '@db/schema';
import { logger } from '../utils/logger';

export class ServiceStorage {
  // Service CRUD Operations
  async getAllServices(filters?: {
    category?: string;
    isActive?: boolean;
    tags?: string[];
  }) {
    try {
      let query = db.select().from(services);
      
      const conditions = [];
      if (filters?.category) {
        conditions.push(eq(services.category, filters.category));
      }
      if (filters?.isActive !== undefined) {
        conditions.push(eq(services.isActive, filters.isActive));
      }
      
      if (conditions.length > 0) {
        return await query.where(and(...conditions));
      }
      
      return await query;
    } catch (error) {
      logger.error('Failed to get services:', error);
      throw error;
    }
  }

  async getServiceById(id: string) {
    try {
      const [service] = await db
        .select()
        .from(services)
        .where(eq(services.id, id))
        .limit(1);
      
      return service;
    } catch (error) {
      logger.error(`Failed to get service ${id}:`, error);
      throw error;
    }
  }

  async createService(data: any) {
    try {
      const [newService] = await db
        .insert(services)
        .values({
          id: data.id || `service-${Date.now()}`,
          title: data.title,
          description: data.description,
          category: data.category,
          features: data.features || [],
          benefits: data.benefits || [],
          tags: data.tags || [],
          ...data
        })
        .returning();
      
      return newService;
    } catch (error) {
      logger.error('Failed to create service:', error);
      throw error;
    }
  }

  async updateService(id: string, data: Partial<Service>) {
    try {
      const [updatedService] = await db
        .update(services)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(services.id, id))
        .returning();
      
      return updatedService;
    } catch (error) {
      logger.error(`Failed to update service ${id}:`, error);
      throw error;
    }
  }

  // Booking Operations
  async createBooking(data: any) {
    try {
      const bookingNumber = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      const [booking] = await db
        .insert(serviceBookings)
        .values({
          bookingNumber,
          serviceId: data.serviceId,
          userId: data.userId || null,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone || null,
          companyName: data.companyName || null,
          bookingDate: data.bookingDate || new Date(),
          serviceDate: data.serviceDate,
          endDate: data.endDate || null,
          status: data.status || 'pending',
          quantity: data.quantity || 1,
          totalAmount: data.totalAmount?.toString() || null,
          currency: data.currency || 'USD',
          paymentStatus: data.paymentStatus || 'pending',
          pickupLocation: data.pickupLocation || null,
          deliveryLocation: data.deliveryLocation || null,
          cargoDetails: data.cargoDetails || null,
          specialRequirements: data.specialRequirements || null,
          documents: data.documents || null,
          notes: data.notes || null,
        })
        .returning();
      
      // Update service metrics
      await this.updateServiceMetrics(data.serviceId, { bookings: 1 });
      
      return booking;
    } catch (error) {
      logger.error('Failed to create booking:', error);
      throw error;
    }
  }

  async getBookingsByService(serviceId: string, limit = 50) {
    try {
      return await db
        .select()
        .from(serviceBookings)
        .where(eq(serviceBookings.serviceId, serviceId))
        .orderBy(desc(serviceBookings.bookingDate))
        .limit(limit);
    } catch (error) {
      logger.error(`Failed to get bookings for service ${serviceId}:`, error);
      throw error;
    }
  }

  async getBookingsByUser(userId: number, limit = 50) {
    try {
      return await db
        .select()
        .from(serviceBookings)
        .where(eq(serviceBookings.userId, userId))
        .orderBy(desc(serviceBookings.bookingDate))
        .limit(limit);
    } catch (error) {
      logger.error(`Failed to get bookings for user ${userId}:`, error);
      throw error;
    }
  }

  async updateBookingStatus(bookingId: number, status: string, paymentStatus?: string) {
    try {
      const updateData: any = { 
        status, 
        updatedAt: new Date() 
      };
      
      if (paymentStatus) {
        updateData.paymentStatus = paymentStatus;
      }
      
      const [updated] = await db
        .update(serviceBookings)
        .set(updateData)
        .where(eq(serviceBookings.id, bookingId))
        .returning();
      
      // Update metrics based on status
      if (updated && status === 'completed') {
        await this.updateServiceMetrics(updated.serviceId, { completedBookings: 1 });
      } else if (updated && status === 'cancelled') {
        await this.updateServiceMetrics(updated.serviceId, { cancelledBookings: 1 });
      }
      
      return updated;
    } catch (error) {
      logger.error(`Failed to update booking ${bookingId}:`, error);
      throw error;
    }
  }

  // Review Operations
  async createReview(data: any) {
    try {
      const [review] = await db
        .insert(serviceReviews)
        .values({
          serviceId: data.serviceId,
          bookingId: data.bookingId || null,
          userId: data.userId || null,
          rating: data.rating,
          title: data.title || null,
          review: data.review,
          pros: data.pros || null,
          cons: data.cons || null,
          wouldRecommend: data.wouldRecommend !== false,
          verifiedPurchase: data.verifiedPurchase || false,
          helpfulCount: 0,
          images: data.images || null,
          response: null,
          responseDate: null,
          isPublished: data.isPublished || false,
        })
        .returning();
      
      // Update service metrics
      await this.updateServiceRatingMetrics(data.serviceId);
      
      return review;
    } catch (error) {
      logger.error('Failed to create review:', error);
      throw error;
    }
  }

  async getServiceReviews(serviceId: string, limit = 20) {
    try {
      return await db
        .select()
        .from(serviceReviews)
        .where(and(
          eq(serviceReviews.serviceId, serviceId),
          eq(serviceReviews.isPublished, true)
        ))
        .orderBy(desc(serviceReviews.createdAt))
        .limit(limit);
    } catch (error) {
      logger.error(`Failed to get reviews for service ${serviceId}:`, error);
      throw error;
    }
  }

  async updateReviewHelpfulness(reviewId: number) {
    try {
      const [updated] = await db
        .update(serviceReviews)
        .set({ 
          helpfulCount: sql`${serviceReviews.helpfulCount} + 1` 
        })
        .where(eq(serviceReviews.id, reviewId))
        .returning();
      
      return updated;
    } catch (error) {
      logger.error(`Failed to update review helpfulness ${reviewId}:`, error);
      throw error;
    }
  }

  // Pricing Operations
  async getServicePricing(serviceId: string) {
    try {
      return await db
        .select()
        .from(servicePricingTiers)
        .where(and(
          eq(servicePricingTiers.serviceId, serviceId),
          eq(servicePricingTiers.isActive, true)
        ))
        .orderBy(servicePricingTiers.priority);
    } catch (error) {
      logger.error(`Failed to get pricing for service ${serviceId}:`, error);
      throw error;
    }
  }

  async createPricingTier(data: any) {
    try {
      const [tier] = await db
        .insert(servicePricingTiers)
        .values({
          serviceId: data.serviceId,
          tierName: data.tierName,
          description: data.description || null,
          basePrice: data.basePrice.toString(),
          currency: data.currency || 'USD',
          billingPeriod: data.billingPeriod || null,
          features: data.features || null,
          limitations: data.limitations || null,
          discounts: data.discounts || null,
          minOrder: data.minOrder?.toString() || null,
          maxOrder: data.maxOrder?.toString() || null,
          setupFee: data.setupFee?.toString() || null,
          isActive: data.isActive !== false,
          validFrom: data.validFrom || null,
          validUntil: data.validUntil || null,
          priority: data.priority || 0,
        })
        .returning();
      
      return tier;
    } catch (error) {
      logger.error('Failed to create pricing tier:', error);
      throw error;
    }
  }

  async updatePricingTier(tierId: number, data: Partial<ServicePricingTier>) {
    try {
      const [updated] = await db
        .update(servicePricingTiers)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(servicePricingTiers.id, tierId))
        .returning();
      
      return updated;
    } catch (error) {
      logger.error(`Failed to update pricing tier ${tierId}:`, error);
      throw error;
    }
  }

  // Metrics Operations
  async getServiceMetrics(serviceId: string, startDate?: Date, endDate?: Date) {
    try {
      const conditions = [eq(serviceMetrics.serviceId, serviceId)];
      
      if (startDate) {
        conditions.push(gte(serviceMetrics.metricDate, startDate));
      }
      if (endDate) {
        conditions.push(lte(serviceMetrics.metricDate, endDate));
      }
      
      return await db
        .select()
        .from(serviceMetrics)
        .where(and(...conditions))
        .orderBy(desc(serviceMetrics.metricDate));
    } catch (error) {
      logger.error(`Failed to get metrics for service ${serviceId}:`, error);
      throw error;
    }
  }

  async updateServiceMetrics(serviceId: string, updates: {
    views?: number;
    inquiries?: number;
    bookings?: number;
    completedBookings?: number;
    cancelledBookings?: number;
    revenue?: number;
  }) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Check if today's metrics exist
      const [existing] = await db
        .select()
        .from(serviceMetrics)
        .where(and(
          eq(serviceMetrics.serviceId, serviceId),
          eq(serviceMetrics.metricDate, today)
        ))
        .limit(1);
      
      if (existing) {
        // Update existing metrics
        const updateData: any = {};
        
        if (updates.views) updateData.views = sql`${serviceMetrics.views} + ${updates.views}`;
        if (updates.inquiries) updateData.inquiries = sql`${serviceMetrics.inquiries} + ${updates.inquiries}`;
        if (updates.bookings) updateData.bookings = sql`${serviceMetrics.bookings} + ${updates.bookings}`;
        if (updates.completedBookings) updateData.completedBookings = sql`${serviceMetrics.completedBookings} + ${updates.completedBookings}`;
        if (updates.cancelledBookings) updateData.cancelledBookings = sql`${serviceMetrics.cancelledBookings} + ${updates.cancelledBookings}`;
        if (updates.revenue) updateData.revenue = sql`COALESCE(${serviceMetrics.revenue}, 0) + ${updates.revenue}`;
        
        await db
          .update(serviceMetrics)
          .set(updateData)
          .where(eq(serviceMetrics.id, existing.id));
      } else {
        // Create new metrics for today
        await db
          .insert(serviceMetrics)
          .values({
            serviceId,
            metricDate: today,
            views: updates.views || 0,
            inquiries: updates.inquiries || 0,
            bookings: updates.bookings || 0,
            completedBookings: updates.completedBookings || 0,
            cancelledBookings: updates.cancelledBookings || 0,
            revenue: updates.revenue?.toString() || '0',
          });
      }
    } catch (error) {
      logger.error(`Failed to update metrics for service ${serviceId}:`, error);
      throw error;
    }
  }

  async updateServiceRatingMetrics(serviceId: string) {
    try {
      // Calculate average rating and total reviews
      const result = await db
        .select({
          avgRating: sql<number>`AVG(${serviceReviews.rating})`,
          totalReviews: sql<number>`COUNT(*)`,
        })
        .from(serviceReviews)
        .where(and(
          eq(serviceReviews.serviceId, serviceId),
          eq(serviceReviews.isPublished, true)
        ));
      
      const { avgRating, totalReviews } = result[0] || { avgRating: 0, totalReviews: 0 };
      
      // Update today's metrics
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      await db
        .update(serviceMetrics)
        .set({
          averageRating: avgRating?.toString() || '0',
          totalReviews: totalReviews || 0,
        })
        .where(and(
          eq(serviceMetrics.serviceId, serviceId),
          eq(serviceMetrics.metricDate, today)
        ));
    } catch (error) {
      logger.error(`Failed to update rating metrics for service ${serviceId}:`, error);
      throw error;
    }
  }

  // Comparison Tracking
  async trackComparison(data: any) {
    try {
      const [comparison] = await db
        .insert(serviceComparisons)
        .values({
          userId: data.userId || null,
          sessionId: data.sessionId || null,
          comparedServices: data.comparedServices,
          comparisonCriteria: data.comparisonCriteria || null,
          selectedService: data.selectedService || null,
        })
        .returning();
      
      return comparison;
    } catch (error) {
      logger.error('Failed to track service comparison:', error);
      throw error;
    }
  }

  async getPopularComparisons(limit = 10) {
    try {
      const result = await db
        .select({
          services: serviceComparisons.comparedServices,
          count: sql<number>`COUNT(*)`,
        })
        .from(serviceComparisons)
        .groupBy(serviceComparisons.comparedServices)
        .orderBy(desc(sql`COUNT(*)`))
        .limit(limit);
      
      return result;
    } catch (error) {
      logger.error('Failed to get popular comparisons:', error);
      throw error;
    }
  }

  // Service Availability
  async checkServiceAvailability(serviceId: string, location: string) {
    try {
      const [availability] = await db
        .select()
        .from(serviceAvailability)
        .where(and(
          eq(serviceAvailability.serviceId, serviceId),
          eq(serviceAvailability.location, location)
        ))
        .limit(1);
      
      return availability;
    } catch (error) {
      logger.error(`Failed to check availability for service ${serviceId}:`, error);
      throw error;
    }
  }

  // Search and Discovery
  async searchServices(query: string) {
    try {
      return await db
        .select()
        .from(services)
        .where(and(
          eq(services.isActive, true),
          sql`(
            ${services.title} ILIKE ${'%' + query + '%'} OR
            ${services.description} ILIKE ${'%' + query + '%'} OR
            ${services.category} ILIKE ${'%' + query + '%'}
          )`
        ))
        .orderBy(desc(services.popularity));
    } catch (error) {
      logger.error('Failed to search services:', error);
      throw error;
    }
  }

  // Analytics
  async getServiceAnalytics(serviceId: string, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const metrics = await this.getServiceMetrics(serviceId, startDate);
      const reviews = await this.getServiceReviews(serviceId, 100);
      
      // Calculate analytics
      const totalBookings = metrics.reduce((sum, m) => sum + (m.bookings || 0), 0);
      const totalRevenue = metrics.reduce((sum, m) => sum + parseFloat(m.revenue || '0'), 0);
      const avgRating = reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0;
      
      return {
        totalBookings,
        totalRevenue,
        averageRating: avgRating,
        totalReviews: reviews.length,
        metrics,
        recentReviews: reviews.slice(0, 5),
      };
    } catch (error) {
      logger.error(`Failed to get analytics for service ${serviceId}:`, error);
      throw error;
    }
  }
}

export const serviceStorage = new ServiceStorage();