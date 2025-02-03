'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

interface CreateFileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateFileModal({ isOpen, onClose }: CreateFileModalProps) {
  const [fileName, setFileName] = useState('');
  const [content, setContent] = useState('');
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!fileName || !content) {
      toast({
        variant: 'destructive',
        description: 'Please fill in all fields',
      });
      return;
    }

    try {
      const file = new File([content], fileName, { type: 'text/plain' });
      const { error } = await supabase.storage
        .from('files')
        .upload(`${crypto.randomUUID()}/${fileName}`, file);

      if (error) throw error;

      router.refresh();
      onClose();
      setFileName('');
      setContent('');
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Error creating file. Please try again.',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Create New File</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Input
            placeholder="File name"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
          <Textarea
            placeholder="File content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
          />
          <Button onClick={handleSubmit}>Create</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 