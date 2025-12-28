import { useQuery, useMutation, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { getApiUrl } from '@/lib/apiConfig';
import { queryClient } from '@/lib/queryClient';

export interface PostCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  author?: string;
  author_avatar?: string;
  published_at?: string;
  created_at: string;
  updated_at?: string;
  categories?: PostCategory[];
  tags?: string[];
  is_featured?: boolean;
  reading_time?: number;
}

export interface Testimonial {
  id: number;
  name: string;
  company?: string;
  position?: string;
  content: string;
  rating?: number;
  avatar?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface FaqTopic {
  id: number;
  name: string;
  slug: string;
  description?: string;
  sort_order?: number;
}

export interface Faq {
  id: number;
  question: string;
  answer: string;
  topic?: FaqTopic;
  sort_order?: number;
  is_active?: boolean;
}

export interface GroupedFaqs {
  topic: FaqTopic;
  faqs: Faq[];
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  department?: string;
  bio?: string;
  photo?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  twitter?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface CMSResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

async function fetchCMS<T>(path: string): Promise<T> {
  const url = getApiUrl('cms', path);
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch from CMS: ${response.statusText}`);
  }

  const json: CMSResponse<T> = await response.json();
  return json.data;
}

async function postCMS<T, D>(path: string, data: D): Promise<T> {
  const url = getApiUrl('cms', path);
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  const json: CMSResponse<T> = await response.json();
  return json.data;
}

export function useBlogPosts(): UseQueryResult<BlogPost[], Error> {
  return useQuery<BlogPost[], Error>({
    queryKey: ['cms', 'blog', 'posts'],
    queryFn: () => fetchCMS<BlogPost[]>('/blog/posts'),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useBlogPost(slug: string): UseQueryResult<BlogPost | null, Error> {
  return useQuery<BlogPost | null, Error>({
    queryKey: ['cms', 'blog', 'posts', slug],
    queryFn: async () => {
      try {
        return await fetchCMS<BlogPost>(`/blog/posts/${slug}`);
      } catch (error) {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
    enabled: !!slug,
  });
}

export function useBlogCategories(): UseQueryResult<PostCategory[], Error> {
  return useQuery<PostCategory[], Error>({
    queryKey: ['cms', 'blog', 'categories'],
    queryFn: () => fetchCMS<PostCategory[]>('/blog/categories'),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useTestimonials(): UseQueryResult<Testimonial[], Error> {
  return useQuery<Testimonial[], Error>({
    queryKey: ['cms', 'testimonials'],
    queryFn: () => fetchCMS<Testimonial[]>('/testimonials'),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useFAQs(): UseQueryResult<GroupedFaqs[], Error> {
  return useQuery<GroupedFaqs[], Error>({
    queryKey: ['cms', 'faqs', 'grouped'],
    queryFn: () => fetchCMS<GroupedFaqs[]>('/faqs/grouped'),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useTeamMembers(): UseQueryResult<TeamMember[], Error> {
  return useQuery<TeamMember[], Error>({
    queryKey: ['cms', 'team'],
    queryFn: () => fetchCMS<TeamMember[]>('/team'),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useContactForm(): UseMutationResult<{ success: boolean; message: string }, Error, ContactFormData> {
  return useMutation({
    mutationFn: (data: ContactFormData) => 
      postCMS<{ success: boolean; message: string }, ContactFormData>('/contact', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'contact'] });
    },
  });
}
