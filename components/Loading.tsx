import React from 'react';
import { Loader2, Cpu } from 'lucide-react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

/**
 * Simple loading spinner component
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className = '' }) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };

    return (
        <Loader2 className={`animate-spin text-neon-green ${sizes[size]} ${className}`} />
    );
};

interface LoadingOverlayProps {
    message?: string;
    fullScreen?: boolean;
}

/**
 * Full overlay loading component
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
    message = 'Loading...',
    fullScreen = false
}) => {
    const containerClasses = fullScreen
        ? 'fixed inset-0 z-[9999]'
        : 'absolute inset-0 z-50';

    return (
        <div className={`${containerClasses} bg-white/80 dark:bg-obsidian-950/80 backdrop-blur-sm flex items-center justify-center`}>
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-neon-green/20 border-t-neon-green rounded-full animate-spin"></div>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest animate-pulse">
                    {message}
                </p>
            </div>
        </div>
    );
};

interface LoadingCardProps {
    message?: string;
}

/**
 * Loading state for card/component areas
 */
export const LoadingCard: React.FC<LoadingCardProps> = ({ message = 'Loading...' }) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-6">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                {message}
            </p>
        </div>
    );
};

/**
 * Skeleton loader for content placeholders
 */
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
    return (
        <div className={`animate-pulse bg-slate-200 dark:bg-obsidian-800 rounded ${className}`} />
    );
};

/**
 * Task card skeleton loader
 */
export const TaskCardSkeleton: React.FC = () => {
    return (
        <div className="bg-white dark:bg-obsidian-900 border border-black/5 dark:border-white/5 rounded-lg p-4 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex gap-2 pt-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
            </div>
        </div>
    );
};

/**
 * List skeleton loader
 */
export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-obsidian-900 rounded-lg border border-black/5 dark:border-white/5">
                    <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-3 w-1/3" />
                    </div>
                </div>
            ))}
        </div>
    );
};

/**
 * Page loading state for full page content
 */
export const PageLoading: React.FC<{ message?: string }> = ({ message = 'Initializing System...' }) => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-obsidian-950 flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
                <div className="relative">
                    <div className="w-16 h-16 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg flex items-center justify-center">
                        <Cpu className="w-8 h-8 text-neon-green animate-pulse" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-neon-green rounded-full animate-ping" />
                </div>
                <div className="text-center">
                    <p className="text-xs font-black text-neon-green uppercase tracking-[0.2em] animate-pulse">
                        {message}
                    </p>
                </div>
            </div>
        </div>
    );
};

/**
 * Button loading state wrapper
 */
interface LoadingButtonProps {
    loading: boolean;
    children: React.ReactNode;
    loadingText?: string;
    className?: string;
    disabled?: boolean;
    onClick?: () => void;
    type?: 'button' | 'submit';
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
    loading,
    children,
    loadingText = 'Loading...',
    className = '',
    disabled = false,
    onClick,
    type = 'button'
}) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={loading || disabled}
            className={`relative ${className} ${(loading || disabled) ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
            {loading ? (
                <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span>{loadingText}</span>
                </span>
            ) : (
                children
            )}
        </button>
    );
};

export default LoadingSpinner;
