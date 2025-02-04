import { toast } from '@/components/ui/use-toast';
import { FileIcon } from './FileIcon';
import { useFileOperations } from '@/app/media/hooks/useFileOperations';

type FileGridProps = {
  documents: any[];
  onFileSelect: (file: { id: number; name: string; content: string; storagePath: string }, index: number) => void;
};

export function FileGrid({ documents, onFileSelect }: FileGridProps) {
  const { downloadFile } = useFileOperations();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
      {documents.map((document, index) => (
        <div
          key={document.id}
          className="flex flex-col gap-2 justify-center items-center border rounded-md p-4 sm:p-6 text-center overflow-hidden cursor-pointer hover:bg-slate-100"
          onClick={async () => {
            if (!document.storage_object_path) {
              toast({
                variant: 'destructive',
                description: 'Failed to load file, please try again.',
              });
              return;
            }

            const content = await downloadFile(document.storage_object_path);
            if (content) {
              onFileSelect({
                id: document.id,
                name: document.name,
                content,
                storagePath: document.storage_object_path,
              }, index);
            }
          }}
        >
          <FileIcon />
          {document.name}
        </div>
      ))}
    </div>
  );
} 