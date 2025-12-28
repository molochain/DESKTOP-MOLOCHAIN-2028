import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileIcon, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';

interface UploadingFile {
  file: File;
  progress: number;
  status: 'queued' | 'uploading' | 'error' | 'complete';
  error?: string;
}

interface DropzoneUploaderProps {
  parentFolderId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function DropzoneUploader({ parentFolderId, onSuccess, onCancel }: DropzoneUploaderProps) {
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'queued' as const
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    multiple: true
  });

  const handleRemoveFile = (index: number) => {
    setFiles(files => files.filter((_, i) => i !== index));
  };

  const uploadFile = async (file: File, index: number) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('parentId', parentFolderId);

    try {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          
          setFiles(currentFiles => {
            const newFiles = [...currentFiles];
            newFiles[index] = { 
              ...newFiles[index], 
              progress: percentComplete,
              status: 'uploading'
            };
            return newFiles;
          });
          
          // Update overall progress
          const totalProgress = files.reduce((acc, file, i) => {
            if (i === index) {
              return acc + percentComplete;
            }
            return acc + file.progress;
          }, 0);
          
          setOverallProgress(Math.round(totalProgress / files.length));
        }
      });

      return new Promise<void>((resolve, reject) => {
        xhr.open('POST', '/api/drive/upload');
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setFiles(currentFiles => {
              const newFiles = [...currentFiles];
              newFiles[index] = { 
                ...newFiles[index], 
                progress: 100,
                status: 'complete'
              };
              return newFiles;
            });
            resolve();
          } else {
            const errorMessage = xhr.statusText || 'Upload failed';
            setFiles(currentFiles => {
              const newFiles = [...currentFiles];
              newFiles[index] = { 
                ...newFiles[index], 
                status: 'error',
                error: errorMessage
              };
              return newFiles;
            });
            reject(new Error(errorMessage));
          }
        };
        
        xhr.onerror = () => {
          setFiles(currentFiles => {
            const newFiles = [...currentFiles];
            newFiles[index] = { 
              ...newFiles[index], 
              status: 'error',
              error: 'Network error'
            };
            return newFiles;
          });
          reject(new Error('Network error'));
        };
        
        xhr.send(formData);
      });
    } catch (error) {
      setFiles(currentFiles => {
        const newFiles = [...currentFiles];
        newFiles[index] = { 
          ...newFiles[index], 
          status: 'error',
          error: (error as Error).message || 'Upload failed'
        };
        return newFiles;
      });
      throw error;
    }
  };

  const startUpload = async () => {
    if (files.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No files to upload',
        description: 'Please add at least one file to upload.'
      });
      return;
    }
    
    setIsUploading(true);
    setOverallProgress(0);
    
    try {
      await Promise.all(files.map((file, index) => uploadFile(file.file, index)));
      
      toast({
        title: 'Upload complete',
        description: `Successfully uploaded ${files.length} file(s)`
      });
      
      onSuccess();
    } catch (error) {
      // Upload error - handled by toast notification
      
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: 'Some files failed to upload. Check file status for details.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getFileStatusIcon = (status: string) => {
    switch (status) {
      case 'queued':
        return null;
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getFileTypeIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension || '')) {
      return <img src="/icons/image-icon.svg" className="h-8 w-8" alt="Image" />;
    }
    
    if (['mp4', 'webm', 'avi', 'mov', 'wmv'].includes(extension || '')) {
      return <img src="/icons/video-icon.svg" className="h-8 w-8" alt="Video" />;
    }
    
    if (['mp3', 'wav', 'ogg', 'flac'].includes(extension || '')) {
      return <img src="/icons/audio-icon.svg" className="h-8 w-8" alt="Audio" />;
    }
    
    if (['doc', 'docx', 'txt', 'rtf', 'pdf'].includes(extension || '')) {
      return <img src="/icons/document-icon.svg" className="h-8 w-8" alt="Document" />;
    }
    
    if (['xls', 'xlsx', 'csv'].includes(extension || '')) {
      return <img src="/icons/spreadsheet-icon.svg" className="h-8 w-8" alt="Spreadsheet" />;
    }
    
    if (['ppt', 'pptx'].includes(extension || '')) {
      return <img src="/icons/presentation-icon.svg" className="h-8 w-8" alt="Presentation" />;
    }
    
    return <FileIcon className="h-8 w-8 text-muted-foreground" />;
  };

  return (
    <div className="flex flex-col space-y-4">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/20 hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <Upload className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium">
            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
          </h3>
          <p className="text-sm text-muted-foreground">
            or click to browse files
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <>
          <div className="bg-muted p-4 rounded-md max-h-64 overflow-y-auto">
            <h4 className="font-medium mb-2">Files to upload ({files.length})</h4>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-background rounded border">
                  <div className="flex items-center overflow-hidden">
                    <div className="mr-2 flex-shrink-0">
                      {getFileTypeIcon(file.file.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{file.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {getFileStatusIcon(file.status)}
                    {file.status === 'uploading' && (
                      <div className="w-16 mr-2">
                        <Progress value={file.progress} className="h-2" />
                      </div>
                    )}
                    {file.status === 'queued' && !isUploading && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6" 
                        onClick={() => handleRemoveFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {files.some(file => file.status === 'error') && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Upload failed</AlertTitle>
              <AlertDescription>
                Some files failed to upload. Try again or check your connection.
              </AlertDescription>
            </Alert>
          )}

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall progress</span>
                <span>{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} />
            </div>
          )}
        </>
      )}

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel} disabled={isUploading}>
          Cancel
        </Button>
        <Button 
          disabled={files.length === 0 || isUploading} 
          onClick={startUpload}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload {files.length > 0 ? `(${files.length})` : ''}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}