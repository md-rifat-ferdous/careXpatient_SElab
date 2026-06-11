'use client';

import React, { useState, useEffect } from 'react';
import { ConsultationFile } from '@/types/consultation';
import { uploadFileApi, getFilesApi } from '@/services/consultation.service';

interface Props {
  appointmentId: string;
  token: string;
  userRole: 'Patient' | 'Doctor';
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function FileShare({ appointmentId, token, userRole }: Props) {
  const [files, setFiles] = useState<ConsultationFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadFiles();
  }, [appointmentId]);

  const loadFiles = async () => {
    try {
      const res = await getFilesApi(appointmentId, token);
      setFiles(res.data || []);
    } catch (err) {
      console.error('Failed to load files:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      await uploadFileApi(appointmentId, file, token);
      await loadFiles();
    } catch (err) {
      console.error('Failed to upload file:', err);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('word')) return '📝';
    return '📎';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">Files & Reports</h3>
        {userRole === 'Doctor' && (
          <label className="cursor-pointer">
            <span className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition-colors">
              {isUploading ? 'Uploading...' : 'Upload'}
            </span>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      <div className="p-4 max-h-64 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400">
              {userRole === 'Doctor' ? 'Upload prescription or reports here.' : 'No files shared yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <a
                key={file.id}
                href={`${API_URL}${file.fileUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
              >
                <span className="text-xl">{getFileIcon(file.fileType)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.fileName}</p>
                  <p className="text-xs text-gray-400">
                    {file.uploadedByRole === 'Doctor' ? 'Doctor' : 'Patient'} &bull; {formatDate(file.createdAt)}
                  </p>
                </div>
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
