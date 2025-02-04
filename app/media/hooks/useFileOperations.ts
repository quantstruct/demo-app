import { Database } from '@/supabase/functions/_lib/database';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';

export function useFileOperations() {
  const supabase = createClientComponentClient<Database>();
  const queryClient = useQueryClient();
  const router = useRouter();

  const uploadFiles = async (files: File[]) => {
    const results = await Promise.all(
      files.map(async (file) => {
        const { error } = await supabase.storage
          .from('files')
          .upload(`${crypto.randomUUID()}/${file.name}`, file);

        if (error) {
          toast({
            variant: 'destructive',
            description: `Error uploading ${file.name}: ${error.message}`,
          });
          return false;
        }
        return true;
      })
    );

    const successCount = results.filter(Boolean).length;
    const failureCount = results.length - successCount;

    if (successCount > 0) {
      toast({
        description: `Successfully uploaded ${successCount} file${successCount !== 1 ? 's' : ''}${
          failureCount > 0 ? `. ${failureCount} failed.` : ''
        }`,
      });
      queryClient.invalidateQueries(['files']);
      router.refresh();
    }

    return successCount > 0;
  };

  const deleteFile = async (selectedFile: {
    id: number;
    name: string;
    storagePath: string;
  }) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${selectedFile.name}"?`
    );
    if (!confirmed) return false;

    // First delete from documents table
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', selectedFile.id);

    if (dbError) {
      console.error('Database delete failed:', dbError);
      toast({
        variant: 'destructive',
        description: `Failed to delete document record: ${dbError.message}`,
      });
      return false;
    }

    // Then, delete from storage
    // const { error: storageError } = await supabase.storage
    //   .from('files')
    //   .remove([selectedFile.storagePath]);

    // if (storageError) {
    //   console.error('Storage delete failed:', storageError);
    //   toast({
    //     variant: 'destructive',
    //     description: `Failed to delete file from storage: ${storageError.message}`,
    //   });
    //   return false;
    // }

    toast({ description: 'File deleted successfully.' });
    queryClient.invalidateQueries(['files']);
    router.refresh();
    return true;
  };

  const downloadFile = async (storagePath: string) => {
    const { data, error } = await supabase.storage
      .from('files')
      .download(storagePath);

    if (error) {
      toast({
        variant: 'destructive',
        description: 'Failed to load file. Please try again.',
      });
      return null;
    }

    return await data.text();
  };

  const updateFile = async (file: {
    id: number;
    name: string;
    content: string;
    storagePath: string;
  }) => {
    try {
      // Ensure we have a valid storage path
      if (!file.storagePath) {
        toast({
          variant: 'destructive',
          description: 'Invalid storage path',
        });
        return false;
      }

      // First update the file content in storage
      const { error: storageError } = await supabase.storage
        .from('files')
        .upload(file.storagePath, new Blob([file.content], { type: 'text/plain' }), {
          upsert: true
        });

      if (storageError) {
        toast({
          variant: 'destructive',
          description: `Failed to update file content: ${storageError.message}`,
        });
        return false;
      }

      // Then update the document record if needed
      const { error: dbError } = await supabase
        .from('documents')
        .update({ name: file.name })
        .eq('id', file.id);

      if (dbError) {
        toast({
          variant: 'destructive',
          description: `Failed to update document record: ${dbError.message}`,
        });
        return false;
      }

      toast({ description: 'File updated successfully.' });
      queryClient.invalidateQueries(['files']);
      router.refresh();
      return true;
    } catch (error) {
      console.error('Error updating file:', error);
      toast({
        variant: 'destructive',
        description: 'An error occurred while updating the file.',
      });
      return false;
    }
  };

  return { uploadFiles, deleteFile, downloadFile, updateFile };
} 