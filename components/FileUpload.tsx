import React, { useState, useRef } from 'react';
import { Upload, X, Check, Loader2, Image as ImageIcon, FileText, FileSpreadsheet } from 'lucide-react';
import { db } from '../lib/supabase';

interface FileUploadProps {
    onUploadComplete: (url: string, fileName: string) => void;
    bucket?: string;
    accept?: string;
    label?: string;
    className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
    onUploadComplete,
    bucket = 'attachments',
    accept = "image/*,.pdf,.csv,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip",
    label = "Upload File",
    className = ""
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setError(null);
        setProgress(10);

        try {
            // Create a unique path for the file
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const path = `${fileName}`;

            setProgress(30);
            const publicUrl = await db.storage.uploadFile(bucket, path, file);

            setProgress(100);
            onUploadComplete(publicUrl, file.name);

            // Reset after a short delay
            setTimeout(() => {
                setProgress(0);
                setIsUploading(false);
            }, 1000);

        } catch (err: any) {
            console.error('Upload error:', err);
            setError(err.message || 'Failed to upload file');
            setIsUploading(false);
            setProgress(0);
        }
    };

    const getFileIcon = () => {
        if (accept.includes('image')) return <ImageIcon size={14} />;
        if (accept.includes('pdf')) return <FileText size={14} />;
        if (accept.includes('csv')) return <FileSpreadsheet size={14} />;
        return <Upload size={14} />;
    };

    return (
        <div className={`relative ${className}`}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept={accept}
                className="hidden"
            />

            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-black/10 dark:border-white/20 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 hover:border-neon-cyan/50 transition-all rounded-sm group disabled:opacity-50`}
            >
                {isUploading ? (
                    <>
                        <Loader2 size={14} className="animate-spin text-neon-cyan" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-neon-cyan">Uploading {progress}%</span>
                    </>
                ) : (
                    <>
                        {getFileIcon()}
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white">{label}</span>
                    </>
                )}
            </button>

            {error && (
                <div className="mt-2 p-2 bg-rose-500/10 border border-rose-500/20 rounded-sm text-[9px] font-bold text-rose-500 uppercase tracking-widest animate-in fade-in slide-in-from-top-1">
                    {error}
                </div>
            )}

            {progress === 100 && !error && (
                <div className="absolute -right-2 -top-2 bg-neon-green text-obsidian-950 rounded-full p-0.5 shadow-lg animate-in zoom-in">
                    <Check size={10} />
                </div>
            )}
        </div>
    );
};

export default FileUpload;
