'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useCallback } from 'react';
import { useDocuments } from './hooks/useDocuments';
import { useFileOperations } from './hooks/useFileOperations';
import { FileGrid } from './components/FileGrid';
import { FileViewer } from './components/FileViewer';
import { Textarea } from '@/components/ui/textarea';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

export default function FilesPage() {
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(-1);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { data: documents } = useDocuments();
  const { uploadFiles } = useFileOperations();
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { toast } = useToast();
  const [fileName, setFileName] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [selectedContent, setSelectedContent] = useState<string>('');

  const handleFileSelect = async (file: { 
    id: number; 
    name: string; 
    content: string; 
    storagePath: string 
  }, index: number) => {
    setSelectedFileIndex(index);
    setSelectedContent(file.content);
  };

  const handleClose = () => {
    setSelectedFileIndex(-1);
  };

  const handleNext = () => {
    if (selectedFileIndex < (documents?.length || 0) - 1) {
      setSelectedFileIndex(selectedFileIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (selectedFileIndex > 0) {
      setSelectedFileIndex(selectedFileIndex - 1);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await uploadFiles(files);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      await uploadFiles(files);
    }
  };

  const selectedFile = selectedFileIndex >= 0 && documents?.[selectedFileIndex] 
    ? {
        id: documents[selectedFileIndex].id!,
        name: documents[selectedFileIndex].name!,
        content: selectedContent,
        storagePath: documents[selectedFileIndex].storage_object_path!
      }
    : null;

  return (
    <div className="max-w-6xl m-4 sm:m-10 flex flex-col gap-8 grow items-stretch">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Create File Form */}
        <div className="flex flex-col gap-4 p-6 border rounded-lg">
          <h2 className="text-lg font-semibold">Create New File</h2>
          <Input
            placeholder="File name"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
          <Textarea
            placeholder="File content"
            value={fileContent}
            onChange={(e) => setFileContent(e.target.value)}
            rows={10}
          />
          <Button onClick={async () => {
            if (fileName && fileContent) {
              const file = new File([fileContent], fileName, { type: 'text/plain' });
              await uploadFiles([file]);
              setFileName('');
              setFileContent('');
            }
          }}>Create</Button>
        </div>

        {/* Upload File Area */}
        <div
          className="flex flex-col gap-4 p-6 border rounded-lg transition-colors"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <h2 className="text-lg font-semibold">Upload File</h2>
          <div className="flex flex-col gap-4 grow items-center justify-center">
            <div className="w-full h-full flex flex-col items-center justify-center text-center">
              <input
                type="file"
                multiple
                onChange={handleFileInput}
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="w-full h-full flex flex-col items-center justify-center cursor-pointer py-12"
              >
                <svg
                  className="w-12 h-12 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-gray-600">
                  Drag and drop your file here, or{" "}
                  <span className="text-blue-500">browse</span>
                </p>
              </label>
            </div>
          </div>
        </div>
      </div>

      {documents && (
        <FileGrid 
          documents={documents} 
          onFileSelect={handleFileSelect}
        />
      )}

      <FileViewer
        file={selectedFile}
        onClose={handleClose}
        onNext={handleNext}
        onPrevious={handlePrevious}
        hasNext={selectedFileIndex < (documents?.length || 0) - 1}
        hasPrevious={selectedFileIndex > 0}
      />
    </div>
  );
}
