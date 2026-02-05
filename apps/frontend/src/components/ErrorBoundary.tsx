import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f0e17] text-white p-4">
          <div className="bg-[#1a1625] border border-red-500/20 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-2xl font-bold mb-2">Terjadi Kesalahan</h1>
            <p className="text-gray-400 mb-6">
              Maaf, aplikasi mengalami kendala teknis. Silakan coba muat ulang halaman.
            </p>
            {this.state.error && (
              <div className="bg-black/30 p-4 rounded-lg text-left text-xs font-mono text-red-300 mb-6 overflow-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 rounded-xl font-semibold transition-colors flex items-center gap-2 mx-auto"
            >
              <RefreshCcw size={18} />
              Muat Ulang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
