/**
 * Hook for managing collaborative documents with Google Drive
 */
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

// Document type enum to match server-side
export enum GoogleDocType {
  DOCUMENT = 'application/vnd.google-apps.document',
  SPREADSHEET = 'application/vnd.google-apps.spreadsheet',
  PRESENTATION = 'application/vnd.google-apps.presentation',
  DRAWING = 'application/vnd.google-apps.drawing',
  FORM = 'application/vnd.google-apps.form',
}

// Interface for document permission
export interface DocumentPermission {
  type: 'user' | 'group' | 'domain' | 'anyone';
  role: 'owner' | 'organizer' | 'fileOrganizer' | 'writer' | 'commenter' | 'reader';
  emailAddress?: string;
  domain?: string;
}

// Interface for document metadata
export interface CollaborativeDocument {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  webContentLink?: string;
  embedUrl?: string;
  createdTime?: string;
  modifiedTime?: string;
}

// Result type for document creation
export interface CreateDocumentResult {
  success: boolean;
  document?: CollaborativeDocument;
  message?: string;
}

// Result type for document sharing
export interface ShareDocumentResult {
  success: boolean;
  permissions?: any[];
  message?: string;
}

// Result type for document listing
export interface ListDocumentsResult {
  success: boolean;
  documents?: CollaborativeDocument[];
  message?: string;
}

// Result type for document embed info
export interface DocumentEmbedResult {
  success: boolean;
  document?: CollaborativeDocument;
  message?: string;
}

/**
 * Hook for managing collaborative documents
 */
export function useCollaborativeDocuments() {
  const { toast } = useToast();
  
  // Query to fetch collaborative documents
  const {
    data: documents,
    isLoading: isLoadingDocuments,
    error: documentsError,
    refetch: refetchDocuments
  } = useQuery<ListDocumentsResult>({
    queryKey: ['/api/collaborative-documents'],
    queryFn: async () => {
      const response = await axios.get('/api/collaborative-documents');
      return response.data;
    },
    select: (data) => data,
    onError: (error: any) => {
      toast({
        title: 'Error loading documents',
        description: error.message || 'Failed to load collaborative documents',
        variant: 'destructive',
      });
    }
  });
  
  // Mutation to create a new document
  const createDocumentMutation = useMutation<
    CreateDocumentResult,
    Error,
    { name: string; type: GoogleDocType; folderId?: string }
  >({
    mutationFn: async ({ name, type, folderId }) => {
      const response = await axios.post('/api/collaborative-documents', {
        name,
        type,
        folderId
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Document created',
        description: `Successfully created ${data.document?.name}`,
      });
      refetchDocuments();
    },
    onError: (error) => {
      toast({
        title: 'Failed to create document',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Mutation to share a document
  const shareDocumentMutation = useMutation<
    ShareDocumentResult,
    Error,
    { fileId: string; permissions: DocumentPermission[]; sendNotifications?: boolean }
  >({
    mutationFn: async ({ fileId, permissions, sendNotifications }) => {
      const response = await axios.post(`/api/collaborative-documents/${fileId}/share`, {
        permissions,
        sendNotifications
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Document shared',
        description: 'Successfully shared document with collaborators',
      });
    },
    onError: (error) => {
      toast({
        title: 'Sharing failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Query to get document embed info
  const getDocumentEmbed = async (documentId: string): Promise<DocumentEmbedResult> => {
    try {
      const response = await axios.get(`/api/collaborative-documents/${documentId}/embed`);
      return response.data;
    } catch (error: any) {
      toast({
        title: 'Failed to get document',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  // Helper function to get human-readable document type
  const getDocumentTypeName = (mimeType: string): string => {
    switch (mimeType) {
      case GoogleDocType.DOCUMENT:
        return 'Document';
      case GoogleDocType.SPREADSHEET:
        return 'Spreadsheet';
      case GoogleDocType.PRESENTATION:
        return 'Presentation';
      case GoogleDocType.DRAWING:
        return 'Drawing';
      case GoogleDocType.FORM:
        return 'Form';
      default:
        return 'File';
    }
  };
  
  // Function to get appropriate icon name based on document type
  const getDocumentIcon = (mimeType: string): string => {
    switch (mimeType) {
      case GoogleDocType.DOCUMENT:
        return 'file-text';
      case GoogleDocType.SPREADSHEET:
        return 'table';
      case GoogleDocType.PRESENTATION:
        return 'presentation';
      case GoogleDocType.DRAWING:
        return 'pen-tool';
      case GoogleDocType.FORM:
        return 'clipboard-list';
      default:
        return 'file';
    }
  };
  
  return {
    // Queries
    documents: documents?.documents || [],
    isLoadingDocuments,
    documentsError,
    refetchDocuments,
    
    // Mutations
    createDocument: createDocumentMutation.mutate,
    isCreatingDocument: createDocumentMutation.isPending,
    shareDocument: shareDocumentMutation.mutate,
    isSharingDocument: shareDocumentMutation.isPending,
    
    // Helper functions
    getDocumentEmbed,
    getDocumentTypeName,
    getDocumentIcon,
    
    // Document types
    documentTypes: GoogleDocType,
  };
}