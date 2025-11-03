
import React, { useState, useCallback, useRef } from 'react';

interface FileUploadProps {
  onAnalyze: (files: File[]) => void;
  isLoading: boolean;
}

const FileIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

export const FileUpload: React.FC<FileUploadProps> = ({ onAnalyze, isLoading }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze(selectedFiles);
  };
  
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  }

  return (
    <div className="bg-gray-800 p-6 md:p-8 rounded-xl border border-gray-700 shadow-2xl shadow-purple-900/10">
      <form onSubmit={handleSubmit}>
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-300 ${isDragging ? 'border-purple-400 bg-gray-700' : 'border-gray-600 hover:border-purple-500 hover:bg-gray-700/50'}`}
          onClick={triggerFileSelect}
          onDrop={handleDrop} 
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg, image/png, image/webp"
            onChange={handleFileChange}
            className="hidden"
            disabled={isLoading}
          />
          <div className="flex flex-col items-center justify-center text-gray-400">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="font-semibold">Drag & drop newspaper images here</p>
            <p className="text-sm">or click to select files</p>
          </div>
        </div>
        
        {selectedFiles.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold text-gray-300">Selected Files:</h3>
            <ul className="mt-2 space-y-2 max-h-40 overflow-y-auto pr-2">
              {selectedFiles.map((file, index) => (
                <li key={index} className="text-sm text-gray-400 bg-gray-700/50 p-2 rounded flex items-center">
                  <FileIcon className="w-5 h-5 mr-2 text-gray-500" />
                  <span>{file.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6">
          <button
            type="submit"
            disabled={isLoading || selectedFiles.length === 0}
            className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
          >
            {isLoading ? 'Analyzing...' : `Analyze ${selectedFiles.length} File(s)`}
          </button>
        </div>
      </form>
    </div>
  );
};
