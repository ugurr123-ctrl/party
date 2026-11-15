import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0e18] p-4 text-center select-none font-body-md">
          <div className="w-full max-w-sm rounded-3xl bg-[#111827] border border-white/10 p-6 flex flex-col items-center gap-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Küçük Bir Aksilik Oluştu</h2>
              <p className="text-xs text-gray-400 mt-1">
                Oyun motoru geçici bir durumla karşılaştı. Tek bir dokunuşla oyuna kaldığın yerden devam edebilirsin.
              </p>
            </div>
            <button
              onClick={this.handleReset}
              className="w-full py-3.5 rounded-2xl bg-[#bef264] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Oyunu Yeniden Başlat</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
