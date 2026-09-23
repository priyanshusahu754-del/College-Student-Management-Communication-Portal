import React, { useRef, useState } from 'react';
import { UploadCloud, File, X } from 'lucide-react';

export const FileUploadDropzone = ({
  onFileSelect,
  selectedFile,
  onFileRemove,
  accept = ".pdf,.doc,.docx,.ppt,.pptx,.zip,.png,.jpg",
  maxSizeMB = 16,
  label = "Upload file"
}) => {
  const inputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState('');

  const validateAndPass = (file) => {
    setError('');
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds limit of ${maxSizeMB}MB`);
      return;
    }

    onFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndPass(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</label>

      {selectedFile ? (
        <div className="flex items-center justify-between p-3.5 bg-indigo-50/50 border border-indigo-200/80 rounded-xl">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <File className="w-5 h-5" />
            </div>
            <div className="truncate">
              <p className="text-sm font-medium text-slate-800 truncate">{selectedFile.name}</p>
              <p className="text-xs text-slate-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onFileRemove}
            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
            isDragOver 
              ? 'border-indigo-500 bg-indigo-50/40' 
              : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50'
          }`}
        >
          <UploadCloud className="w-8 h-8 text-indigo-500 mb-2" />
          <p className="text-xs font-medium text-slate-700">
            Click to upload or drag and drop
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            PDF, DOCX, PPT, PNG up to {maxSizeMB}MB
          </p>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                validateAndPass(e.target.files[0]);
              }
            }}
          />
        </div>
      )}

      {error && <p className="text-xs text-rose-600 mt-1.5">{error}</p>}
    </div>
  );
};
