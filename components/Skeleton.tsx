
import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'rect' | 'circle';
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rect' }) => {
    const baseClass = "animate-pulse bg-black/5 dark:bg-white/5";
    const variantClass = {
        text: "h-3 w-3/4 rounded-sm",
        rect: "h-24 w-full rounded-sm",
        circle: "h-12 w-12 rounded-full"
    }[variant];

    return (
        <div className={`${baseClass} ${variantClass} ${className}`} />
    );
};

export default Skeleton;
