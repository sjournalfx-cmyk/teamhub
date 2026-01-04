import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component to catch and handle React errors gracefully
 * Prevents the entire app from crashing when a component throws an error
 */
class ErrorBoundary extends React.Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null
        };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('[ErrorBoundary] Caught error:', error);
        console.error('[ErrorBoundary] Error info:', errorInfo);

        this.setState({
            error,
            errorInfo
        });

        // You could send error to a logging service here
        // logErrorToService(error, errorInfo);
    }

    private handleReload = () => {
        window.location.reload();
    };

    private handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    public render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-slate-100 dark:bg-obsidian-950 flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-white dark:bg-obsidian-900 rounded-lg shadow-xl border border-black/10 dark:border-white/10 p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-rose-500/10 rounded-lg flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-rose-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Something went wrong
                                </h2>
                                <p className="text-sm text-slate-500">
                                    An unexpected error occurred
                                </p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                We're sorry for the inconvenience. The application encountered an error
                                that prevented it from working correctly.
                            </p>
                        </div>

                        {this.state.error && (
                            <div className="mb-6 p-3 bg-slate-100 dark:bg-obsidian-950 rounded border border-black/5 dark:border-white/5">
                                <p className="text-xs font-mono text-rose-500 break-all">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={this.handleReset}
                                className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-obsidian-800 rounded-lg hover:bg-slate-200 dark:hover:bg-obsidian-700 transition-colors"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={this.handleReload}
                                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-neon-green hover:bg-neon-green/90 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <RefreshCcw size={16} />
                                Reload Page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
