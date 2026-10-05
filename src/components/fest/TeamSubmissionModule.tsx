'use client';

import React, { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { updateFestRegistrationFiles, type TeamFileSubmission } from '@/lib/firestore';
import { Button } from '@/components/ui/Button';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
  Loader2,
  FileArchive,
  Film,
  FileSpreadsheet,
  Link as LinkIcon,
} from 'lucide-react';

interface TeamSubmissionModuleProps {
  registrationId: string;
  participantId: string;
  festId?: string;
  existingFiles?: TeamFileSubmission[];
  onFilesUpdated?: (files: TeamFileSubmission[]) => void;
}

export function TeamSubmissionModule({
  registrationId,
  participantId,
  festId = 'fest-2026',
  existingFiles = [],
  onFilesUpdated,
}: TeamSubmissionModuleProps) {
  const [files, setFiles] = useState<TeamFileSubmission[]>(existingFiles);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFileName, setCurrentFileName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Link fallback submission
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="w-5 h-5 text-[#c94030]" />;
    if (fileType.includes('zip') || fileType.includes('compressed'))
      return <FileArchive className="w-5 h-5 text-amber-600" />;
    if (fileType.includes('video') || fileType.includes('mp4'))
      return <Film className="w-5 h-5 text-indigo-600" />;
    return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check size cap: 50MB
    const maxSizeBytes = 50 * 1024 * 1024;
    if (selectedFile.size > maxSizeBytes) {
      setError('File exceeds maximum allowed size of 50 MB. For larger videos, please use the Drive/Cloud Link option below.');
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setUploading(true);
    setUploadProgress(0);
    setCurrentFileName(selectedFile.name);

    try {
      if (!storage) {
        throw new Error('Firebase Storage is not initialized.');
      }

      // Sanitize file name
      const cleanFileName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      // Spec path: fests/{eventId}/teams/{teamId}/{file.name}
      // registrationId is the Firestore doc ID (teamId); festId is the eventId
      const storagePath = `fests/${festId}/teams/${registrationId}/${cleanFileName}`;
      const storageRef = ref(storage, storagePath);

      const uploadTask = uploadBytesResumable(storageRef, selectedFile);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setUploadProgress(progress);
        },
        (uploadErr) => {
          console.error('Storage upload error:', uploadErr);
          setError(
            uploadErr.message ||
              'Upload failed. Please check network connectivity and storage permissions.'
          );
          setUploading(false);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            const newFile: TeamFileSubmission = {
              id: `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              name: selectedFile.name,
              url: downloadUrl,
              size: selectedFile.size,
              uploadedAt: new Date().toISOString(),
              fileType: selectedFile.type || 'application/octet-stream',
            };

            // Overwrite existing if matching name, otherwise append
            const filtered = files.filter((f) => f.name !== selectedFile.name);
            const updatedList = [...filtered, newFile];

            await updateFestRegistrationFiles(registrationId, updatedList);
            setFiles(updatedList);
            onFilesUpdated?.(updatedList);
            setSuccessMsg(`"${selectedFile.name}" uploaded successfully!`);
          } catch (finErr: unknown) {
            setError(finErr instanceof Error ? finErr.message : 'Failed to finalize upload record.');
          } finally {
            setUploading(false);
            setUploadProgress(0);
            e.target.value = '';
          }
        }
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unexpected file upload error.');
      setUploading(false);
    }
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) return;

    try {
      const newFile: TeamFileSubmission = {
        id: `${Date.now()}_link`,
        name: linkTitle.trim() || 'Project Cloud / Drive Resource',
        url: linkUrl.trim(),
        size: 0,
        uploadedAt: new Date().toISOString(),
        fileType: 'link/url',
      };

      const updatedList = [...files, newFile];
      await updateFestRegistrationFiles(registrationId, updatedList);
      setFiles(updatedList);
      onFilesUpdated?.(updatedList);
      setLinkTitle('');
      setLinkUrl('');
      setShowLinkInput(false);
      setSuccessMsg('Project link added successfully!');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save project link');
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to remove this submission file?')) return;
    try {
      const updatedList = files.filter((f) => f.id !== fileId);
      await updateFestRegistrationFiles(registrationId, updatedList);
      setFiles(updatedList);
      onFilesUpdated?.(updatedList);
      setSuccessMsg('Submission file removed.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete file entry.');
    }
  };

  return (
    <div className="bg-[#ede7da] border border-[#cfc9bc] p-6 rounded space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#cfc9bc] pb-4">
        <div>
          <h4 className="text-lg font-bold text-[#141210] flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-[#c94030]" />
            Team File Submissions
          </h4>
          <p className="text-xs text-[#3a3530] mt-0.5">
            Submit your project abstract, presentation slides (PPTX/PDF), code ZIP, or demo links.
          </p>
        </div>
        <span className="font-mono text-xs text-[#6b6258] bg-[#f6f0e7] px-2.5 py-1 border border-[#cfc9bc] rounded">
          Target: {participantId}
        </span>
      </div>

      {error && (
        <div className="p-3 bg-[#c72c2c]/10 border border-[#c72c2c]/20 text-[#c72c2c] text-xs font-mono rounded flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-mono rounded flex items-center gap-2">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Upload Zone */}
      <div className="border-2 border-dashed border-[#cfc9bc] hover:border-[#c94030] bg-[#f6f0e7] p-6 text-center rounded transition-colors relative">
        <input
          type="file"
          id={`file-upload-${registrationId}`}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          disabled={uploading}
          onChange={handleFileUpload}
          accept=".pdf,.pptx,.ppt,.zip,.rar,.mp4,.docx"
        />
        <div className="flex flex-col items-center justify-center pointer-events-none">
          <UploadCloud className="w-10 h-10 text-[#c94030] mb-2" />
          <p className="font-bold text-sm text-[#141210]">
            {uploading ? `Uploading ${currentFileName}...` : 'Click or Drag files here to upload'}
          </p>
          <p className="text-xs text-[#6b6258] mt-1 font-mono">
            Supported: PDF, PPTX, ZIP, MP4 (Max 50MB)
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      {uploading && (
        <div className="space-y-1.5 bg-[#f6f0e7] p-3 border border-[#cfc9bc] rounded">
          <div className="flex justify-between text-xs font-mono text-[#141210]">
            <span className="truncate max-w-[240px]">{currentFileName}</span>
            <strong>{uploadProgress}%</strong>
          </div>
          <div className="w-full bg-[#cfc9bc] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#c94030] h-full transition-all duration-150"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Submissions List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs uppercase font-bold text-[#6b6258]">
            Uploaded Files ({files.length})
          </span>
          <button
            type="button"
            onClick={() => setShowLinkInput(!showLinkInput)}
            className="text-xs font-mono text-[#c94030] hover:underline flex items-center gap-1"
          >
            <LinkIcon size={12} /> {showLinkInput ? 'Cancel Link' : '+ Add Cloud/Drive Link'}
          </button>
        </div>

        {/* Cloud Link Input Form */}
        {showLinkInput && (
          <form onSubmit={handleAddLink} className="p-3 bg-[#f6f0e7] border border-[#cfc9bc] rounded space-y-2 text-xs">
            <input
              type="text"
              placeholder="Resource Title (e.g. Google Drive Video Demo)"
              value={linkTitle}
              onChange={(e) => setLinkTitle(e.target.value)}
              className="w-full p-2 bg-[#ede7da] border border-[#cfc9bc] rounded text-[#141210]"
            />
            <input
              type="url"
              placeholder="https://drive.google.com/..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              required
              className="w-full p-2 bg-[#ede7da] border border-[#cfc9bc] rounded text-[#141210]"
            />
            <div className="flex justify-end gap-2 pt-1">
              <Button type="submit" size="sm" className="text-xs font-mono uppercase">
                Save Link
              </Button>
            </div>
          </form>
        )}

        {files.length === 0 ? (
          <p className="text-xs font-mono text-[#6b6258] italic py-2">
            No files submitted yet. Please upload your project materials prior to competition day.
          </p>
        ) : (
          <div className="divide-y divide-[#cfc9bc] border border-[#cfc9bc] bg-[#f6f0e7] rounded">
            {files.map((file) => (
              <div
                key={file.id}
                className="p-3 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {getFileIcon(file.fileType)}
                  <div className="min-w-0">
                    <p className="font-bold text-[#141210] truncate max-w-[200px] sm:max-w-xs" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-[10px] font-mono text-[#6b6258]">
                      {file.size > 0 ? formatFileSize(file.size) : 'Cloud Resource'} · {new Date(file.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-[#ede7da] hover:bg-[#141210] hover:text-white border border-[#cfc9bc] rounded text-[#3a3530] transition-colors"
                    title="Open / Preview File"
                  >
                    <ExternalLink size={14} />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDeleteFile(file.id)}
                    className="p-1.5 bg-[#ede7da] hover:bg-[#c72c2c] hover:text-white border border-[#cfc9bc] rounded text-[#c72c2c] transition-colors"
                    title="Delete File"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
