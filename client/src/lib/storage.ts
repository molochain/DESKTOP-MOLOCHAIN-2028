
import { Client } from '@replit/object-storage';

const storage = new Client();

export const uploadFile = async (filename: string, data: Buffer | string) => {
  try {
    let result;
    if (typeof data === 'string') {
      result = await storage.uploadFromText(filename, data);
    } else {
      result = await storage.uploadFromBytes(filename, data);
    }
    
    if (!result.ok) {
      throw new Error(`Upload failed: ${result.error}`);
    }
    
    // Return a constructed URL since Replit Object Storage doesn't support signed URLs
    // Files are accessible via the bucket URL structure
    return `/storage/${filename}`;
  } catch (error) {
    // Upload error handled
    throw error;
  }
};

export const getFileUrl = async (filename: string) => {
  try {
    // Since Replit Object Storage doesn't support signed URLs directly,
    // we return a standard path that can be accessed through the application
    return `/storage/${filename}`;
  } catch (error) {
    // Get URL error handled
    throw error;
  }
};

export const downloadFile = async (filename: string): Promise<any | null> => {
  try {
    const result = await storage.downloadAsBytes(filename);
    if (!result.ok) {
      // Download failed
      return null;
    }
    return result.value;
  } catch (error) {
    // Download error handled
    throw error;
  }
};

export const listFiles = async () => {
  try {
    const result = await storage.list();
    if (!result.ok) {
      throw new Error(`List failed: ${result.error}`);
    }
    return result.value;
  } catch (error) {
    // List error handled
    throw error;
  }
};

export const deleteFile = async (filename: string) => {
  try {
    const result = await storage.delete(filename);
    if (!result.ok) {
      throw new Error(`Delete failed: ${result.error}`);
    }
    return true;
  } catch (error) {
    // Handle delete error gracefully
    // Delete error handled in development
    throw error;
  }
};
