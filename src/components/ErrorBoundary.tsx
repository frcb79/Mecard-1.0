import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { logger } from '../lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('ui.error-boundary', 'ErrorBoundary caught', error, {
      componentStack: errorInfo.componentStack ?? 'unavailable',
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex-1 flex items-center justify-center min-h-[400px] p-8">
          <div className="max-w-md w-full text-center space-y-4">
            <div className="w-14 h-14 bg-danger-50 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7 text-danger-500" />
            </div>
            <h2 className="text-xl font-bold text-surface-800">Algo salió mal</h2>
            <p className="text-sm text-surface-500 leading-relaxed">
              Ocurrió un error inesperado. Puedes intentar recargar este módulo.
            </p>
            {this.state.error && (
              <pre className="text-xs text-surface-400 bg-surface-50 rounded-xl p-3 overflow-auto max-h-24 text-left border border-surface-100">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 transition-colors"
            >
              <RefreshCw size={16} /> Reintentar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
