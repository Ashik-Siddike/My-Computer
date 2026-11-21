import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../../context/StoreContext';
import {
  Upload,
  Image as ImageIcon,
  Copy,
  Trash2,
  Check,
  Search,
  Loader2,
  RefreshCw,
  X,
  AlertCircle
} from 'lucide-react';

interface MediaFile {
  name: string;
  url: string;
  size: number;
  date: string;
  mimetype?: string;
}

interface MediaLibraryManagerProps {
  token: string | null;
}

export const MediaLibraryManager: React.FC<MediaLibraryManagerProps> = ({ token }) => {
  const { addToast } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<MediaFile | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);

  // Fetch Media Files
  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/media', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.files)) {
        setFiles(data.files);
      }
    } catch (err: any) {
      console.warn('[MediaLibrary fetch error]:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  // Upload multiple files
  const handleFilesUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    if (!token) {
      addToast('Error', 'Admin authentication required', 'warning');
      return;
    }

    setUploading(true);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      setUploadProgressText(`Uploading ${i + 1} of ${fileList.length}: ${file.name}`);

      try {
        const formData = new FormData();
        formData.append('image', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const data = await res.json();
        if (res.ok && data.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }

    setUploading(false);
    setUploadProgressText(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (successCount > 0) {
      addToast('Upload Complete', `Successfully uploaded ${successCount} file(s)`);
      fetchMedia();
    }
    if (failCount > 0) {
      addToast('Upload Warning', `${failCount} file(s) failed to upload`, 'warning');
    }
  };

  // Copy URL to Clipboard
  const handleCopyUrl = (url: string) => {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(url);
    addToast('URL Copied', 'Direct image URL copied to clipboard');
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  // Delete Media File
  const handleDeleteConfirm = async () => {
    if (!deleteTarget || !token) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/media/${encodeURIComponent(deleteTarget.name)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        addToast('File Deleted', `${deleteTarget.name} removed from storage`);
        setFiles(prev => prev.filter(f => f.name !== deleteTarget.name));
        setDeleteTarget(null);
      } else {
        throw new Error(data.error || 'Failed to delete file');
      }
    } catch (err: any) {
      addToast('Delete Failed', err.message, 'warning');
    } finally {
      setDeleting(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Filtered files
  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 mb-2 uppercase tracking-wider">
            Asset Repository
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Media & Image Library
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Store and manage product photographs, logos, and banners locally on your server
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchMedia}
            disabled={loading}
            className="p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title="Refresh media files"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload From Computer</span>
          </button>
        </div>
      </div>

      {/* Hidden Multi-file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={e => handleFilesUpload(e.target.files)}
        className="hidden"
      />

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={e => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={e => {
          e.preventDefault();
          setIsDragging(false);
          handleFilesUpload(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
            : 'border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50/50'
        }`}
      >
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 border border-blue-100">
          <Upload className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-900 mb-1">
          {uploading ? uploadProgressText : 'Drag & Drop Images Here or Browse Computer'}
        </h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Supports PNG, JPG, WebP, SVG up to 10MB per file. Multiple files can be uploaded simultaneously.
        </p>
        {uploading && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing and saving to storage...</span>
          </div>
        )}
      </div>

      {/* Search & Stats Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search media files by name..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-slate-50/50"
          />
        </div>

        <div className="text-xs text-slate-500 font-semibold px-2">
          Total: <strong className="text-slate-900">{filteredFiles.length}</strong> stored image(s)
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-semibold">Reading local media directory...</p>
        </div>
      ) : filteredFiles.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredFiles.map(file => (
            <div
              key={file.name}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between group hover:border-blue-300 hover:shadow-md transition-all shadow-xs"
            >
              {/* Image Preview Container */}
              <div
                onClick={() => setPreviewFile(file)}
                className="w-full aspect-square bg-slate-50 p-2 flex items-center justify-center cursor-pointer relative group/img overflow-hidden"
              >
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-full object-contain mix-blend-multiply transition-transform duration-200 group-hover/img:scale-105"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-2.5 py-1 rounded-lg bg-white/90 text-slate-900 text-[10px] font-bold shadow-xs">
                    Zoom
                  </span>
                </div>
              </div>

              {/* Metadata */}
              <div className="p-3 border-t border-slate-100 flex-1 flex flex-col justify-between">
                <div>
                  <div
                    className="text-xs font-bold text-slate-900 truncate"
                    title={file.name}
                  >
                    {file.name}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium mt-1">
                    <span>{formatSize(file.size)}</span>
                    <span>{formatDate(file.date)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(file.url)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    title="Copy direct image link"
                  >
                    {copiedUrl === file.url ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedUrl === file.url ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(file)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete image file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 mb-1">
            {search.trim() ? 'No files match your search' : 'No images uploaded yet'}
          </h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
            Images uploaded from your computer will appear here for fast reuse across product cards.
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload First Image</span>
          </button>
        </div>
      )}

      {/* Lightbox Image Preview Modal */}
      {previewFile && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <span className="text-xs font-bold text-slate-900 truncate max-w-md">{previewFile.name}</span>
              <button
                type="button"
                onClick={() => setPreviewFile(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 bg-slate-100 flex items-center justify-center max-h-[70vh]">
              <img
                src={previewFile.url}
                alt={previewFile.name}
                className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-md"
              />
            </div>
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Size: <strong>{formatSize(previewFile.size)}</strong></span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyUrl(previewFile.url)}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold transition-colors cursor-pointer"
                >
                  Copy URL
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewFile(null)}
                  className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3 border border-red-100">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1">
              Delete This File?
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Are you sure you want to permanently delete <strong className="text-slate-800">{deleteTarget.name}</strong> from server storage? If this image is being used by any product cards, they will need a replacement image.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Permanently Delete</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
