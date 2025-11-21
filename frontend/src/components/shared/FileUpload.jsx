import React, { useCallback, useState } from 'react';
import { Upload, File, X } from 'lucide-react';

/**
 * Drag-and-drop file upload component
 */
const FileUpload = ({ onFileLoad, accept = '.txt', maxSize = 10 * 1024 * 1024 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      setError('');

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
    },
    [maxSize]
  );

  const handleFileInput = (e) => {
    setError('');
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file) => {
    // Validate file size
    if (file.size > maxSize) {
      setError(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
      return;
    }

    setFile(file);

    // Read file content
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      onFileLoad(text, file);
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsText(file);
  };

  const handleRemove = () => {
    setFile(null);
    setError('');
    onFileLoad('', null);
  };

  return (
    <div className="w-full">
      {!file ? (
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
            isDragging
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400'
          }`}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload
            className={`w-16 h-16 mx-auto mb-4 ${
              isDragging ? 'text-primary-600' : 'text-gray-400'
            }`}
          />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Drop your transcript file here
          </p>
          <p className="text-sm text-gray-500 mb-4">or</p>
          <label className="btn btn-primary cursor-pointer inline-block">
            Browse Files
            <input
              type="file"
              className="hidden"
              accept={accept}
              onChange={handleFileInput}
            />
          </label>
          <p className="text-xs text-gray-500 mt-4">
            Supports: TXT files (max {maxSize / (1024 * 1024)}MB)
          </p>
        </div>
      ) : (
        <div className="card animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary-100 rounded-lg">
                <File className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
