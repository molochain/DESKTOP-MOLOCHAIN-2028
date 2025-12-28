import { useState } from 'react';
import { Folder, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreateFolderDialogProps {
  onCreateFolder: (name: string) => void;
  isLoading: boolean;
}

export default function CreateFolderDialog({ onCreateFolder, isLoading }: CreateFolderDialogProps) {
  const [folderName, setFolderName] = useState('');
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!folderName.trim()) {
      setError('Folder name is required');
      return;
    }
    
    // Check if folder name contains invalid characters
    const invalidChars = /[\\/:*?"<>|]/;
    if (invalidChars.test(folderName)) {
      setError('Folder name cannot contain any of these characters: \\ / : * ? " < > |');
      return;
    }
    
    onCreateFolder(folderName);
    setError('');
    
    // Only close the dialog if not in loading state
    if (!isLoading) {
      setOpen(false);
      setFolderName('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFolderName(e.target.value);
    if (error) {
      setError('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Folder className="mr-2 h-4 w-4" />
          New Folder
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Enter a name for your new folder in Google Drive.
            </DialogDescription>
          </DialogHeader>

          <div className="my-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name" className="text-right">
                Folder Name
              </Label>
              <Input
                id="folder-name"
                value={folderName}
                onChange={handleChange}
                placeholder="My New Folder"
                className={error ? 'border-destructive' : ''}
                disabled={isLoading}
                autoFocus
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setOpen(false);
                setFolderName('');
                setError('');
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !folderName.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Folder'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}