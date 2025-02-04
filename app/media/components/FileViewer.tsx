import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import ReactMarkdown from 'react-markdown';
import { useState, useEffect } from 'react';
import { useFileOperations } from '../hooks/useFileOperations';
import { toast } from '@/components/ui/use-toast';

type FileViewerProps = {
  file: {
    id: number;
    name: string;
    content: string;
    storagePath: string;
  } | null;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
};

export function FileViewer({
  file,
  onClose,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
}: FileViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const { deleteFile, updateFile } = useFileOperations();

  useEffect(() => {
    if (file) {
      setEditedContent(file.content);
      setIsEditing(false);
    }
  }, [file]);

  const handleDelete = async () => {
    if (!file) return;
    const success = await deleteFile(file);
    if (success) {
      onClose();
    }
  };

  const handleSave = async () => {
    if (!file?.storagePath) {
      toast({
        variant: 'destructive',
        description: 'Invalid file data',
      });
      return;
    }
    
    const success = await updateFile({
      id: file.id,
      name: file.name,
      content: editedContent,
      storagePath: file.storagePath
    });
    
    if (success) {
      setIsEditing(false);
    }
  };

  return (
    <Dialog open={!!file} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <DialogTitle>{file?.name}</DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPrevious}
                  disabled={!hasPrevious}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onNext}
                  disabled={!hasNext}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (isEditing) {
                      handleSave();
                    } else {
                      setIsEditing(true);
                    }
                  }}
                >
                  {isEditing ? 'Save' : 'Edit Source'}
                </Button>
                {isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedContent(file?.content || '');
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </DialogHeader>
        <div className="mt-4">
          {isEditing ? (
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[300px] font-mono"
            />
          ) : (
            <div className="prose prose-slate max-w-none">
              <ReactMarkdown>{file?.content || ''}</ReactMarkdown>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 