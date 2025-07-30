'use client';

import React, { useState, useRef } from 'react';
import { pdfToTextService } from '../utils/pdfToTextService';
import { FILE_SIZE_LIMITS, PROGRESS_PERCENTAGES } from '../constants';

interface FileUploadProps {
  onFileProcessed: (file: File, extractedText: string, fileUrl?: string) => void;
  onError: (error: string) => void;
}

export default function FileUpload({ onFileProcessed, onError }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Dosya validasyonu
    if (file.type !== 'application/pdf') {
      onError('Sadece PDF dosyaları yüklenebilir');
      return;
    }

    if (file.size > FILE_SIZE_LIMITS.PDF_MAX_SIZE) {
      onError('Dosya boyutu 10MB\'dan büyük olamaz');
      return;
    }

    setIsUploading(true);
    setProgress(PROGRESS_PERCENTAGES.UPLOAD_START);

    try {
      // Firebase Storage'a yükle
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const uploadData = await uploadResponse.json();
      setProgress(PROGRESS_PERCENTAGES.UPLOAD_MIDDLE);

      // PDF'den metin çıkar
      const result = await pdfToTextService.extractTextFromFile(file);
      setProgress(PROGRESS_PERCENTAGES.UPLOAD_COMPLETE);

      if (!result.success) {
        onError(result.error || 'PDF işleme hatası');
        return;
      }
      
      // Başarılı işlem - fileUrl ve extractedText ile
      onFileProcessed(file, result.text || '', uploadData.fileUrl);
      
    } catch (error) {
      onError('Dosya yükleme hatası');
    } finally {
      setIsUploading(false);
      setProgress(PROGRESS_PERCENTAGES.UPLOAD_START);
      // File input'u temizle
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // data:application/pdf;base64, kısmını çıkar
        const base64 = result.split(',')[1];
        if (base64) {
          resolve(base64);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file) {
        // File input'a dosyayı set et
        if (fileInputRef.current) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          fileInputRef.current.files = dataTransfer.files;
          handleFileSelect({ target: { files: dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>);
        }
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isUploading 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".pdf"
          className="hidden"
        />
        
        {isUploading ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">Yükleniyor... {progress}%</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">
                PDF dosyasını buraya sürükleyin veya seçin
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Dosya Seç
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Sadece PDF dosyaları, maksimum 10MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 