export interface GuideCategory {
  id: number;
  code: string;
  name: string;
  description: string;
  icon: string;
}

export interface Guide {
  id: number;
  categoryId: number;
  code: string;
  title: string;
  description: string;
  path: string;
  content?: string;
  documentType?: string;
  parentGuideId?: number;
  icon?: string;
  tags?: string[];
  metadata?: any;
  accessLevel?: string;
  viewCount: number;
  sortOrder?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GuideStats {
  totalGuides: string;
  categoryStats: {
    categoryId: number;
    count: string;
  }[];
  mostViewed: Guide[];
}

export interface GuideProgress {
  userId: number;
  guideId: number;
  progress: number;
  completed: boolean;
  lastViewedAt: string;
}