import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { logger } from '../../services/loggerService';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('ErrorBoundary', 'Uncaught React runtime error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#0B0D10] text-[#F7F6F2] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#14171E] border border-red-500/30 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-bold text-white">Terjadi Kendala Tampilan</h2>
              <p className="text-xs text-[#9CA3AF]">
                LUXFIN AI mengalami kesalahan sistem kecil pada modul ini. Data Anda aman.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-[#0B0D10] text-[10px] text-red-400 font-mono text-left overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full py-2.5 rounded-xl bg-[#E2B963] text-black font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Coba Muat Ulang Tampilan
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
