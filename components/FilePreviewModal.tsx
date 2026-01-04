
import React from 'react';
import { X, Download, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { Deliverable } from '../types';

interface FilePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    files: Deliverable[];
    initialIndex?: number;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ isOpen, onClose, files, initialIndex = 0 }) => {
    const [currentIndex, setCurrentIndex] = React.useState(initialIndex);

    React.useEffect(() => {
        setCurrentIndex(initialIndex);
    }, [initialIndex]);

    if (!isOpen || files.length === 0) return null;

    const currentFile = files[currentIndex];
    const isImage = currentFile.type === 'image' || currentFile.type === 'comparison';
    const isPdf = currentFile.type === 'pdf';

    const handleDownload = () => {
        const url = currentFile.url || currentFile.data;
        if (!url) return;
        const link = document.createElement('a');
        link.href = url;
        link.download = currentFile.fileName || 'resource';
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-obsidian-950/90 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="absolute top-6 right-6 flex items-center gap-4 z-10">
                <button
                    onClick={handleDownload}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full transition-all"
                    title="Download"
                >
                    <Download size={20} />
                </button>
                <button
                    onClick={onClose}
                    className="p-3 bg-white/5 hover:bg-rose-500/20 border border-white/10 text-white hover:text-rose-500 rounded-full transition-all"
                >
                    <X size={20} />
                </button>
            </div>

            {files.length > 1 && (
                <>
                    <button
                        onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : files.length - 1))}
                        className="absolute left-6 p-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full transition-all z-10"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={() => setCurrentIndex((prev) => (prev < files.length - 1 ? prev + 1 : 0))}
                        className="absolute right-6 p-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full transition-all z-10"
                    >
                        <ChevronRight size={24} />
                    </button>
                </>
            )}

            <div className="w-full h-full flex flex-col items-center justify-center p-12">
                <div className="max-w-5xl w-full h-full flex flex-col items-center justify-center gap-6">
                    {isImage ? (
                        <div className="relative group w-full h-full flex items-center justify-center">
                            <img
                                src={currentFile.url || currentFile.data}
                                alt={currentFile.fileName}
                                className="max-w-full max-h-full object-contain shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 rounded-sm animate-in zoom-in-95 duration-500"
                            />
                        </div>
                    ) : isPdf ? (
                        <iframe
                            src={currentFile.url || currentFile.data}
                            className="w-full h-full border border-white/10 rounded-sm shadow-2xl"
                            title={currentFile.fileName}
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-8 p-12 glass-layer-2 border-white/10 rounded-sm max-w-lg text-center">
                            <div className="w-24 h-24 bg-neon-cyan/10 border border-neon-cyan/20 rounded-full flex items-center justify-center text-neon-cyan">
                                <ExternalLink size={40} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">{currentFile.fileName || 'Technical Asset'}</h3>
                                <p className="text-sm text-slate-400 font-medium mb-8">This file type ({currentFile.type.toUpperCase()}) cannot be previewed directly. Please download or open in a new tab.</p>
                                <div className="flex gap-4 justify-center">
                                    <button
                                        onClick={handleDownload}
                                        className="px-8 py-3 bg-neon-cyan text-obsidian-950 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                                    >
                                        Download Asset
                                    </button>
                                    {currentFile.url && (
                                        <a
                                            href={currentFile.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-8 py-3 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                                        >
                                            Open in New Tab
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col items-center gap-2 mt-4">
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">{currentFile.fileName || 'ASSET_NODE'}</span>
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                            {currentIndex + 1} OF {files.length} • {currentFile.type.toUpperCase()} • {new Date(currentFile.timestamp).toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilePreviewModal;
