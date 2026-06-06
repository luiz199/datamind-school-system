"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface Props { children: React.ReactNode; }
interface State { hasError: boolean; error?: Error; }

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#faf6f1] dark:bg-[#12121e] p-8">
          <div className="paper-card p-8 max-w-md text-center">
            <AlertTriangle className="w-12 h-12 text-[#e8614a] mx-auto mb-4" />
            <h2 className="text-xl text-[#1a1a2e] dark:text-[#e8e4de] mb-2">Algo deu errado</h2>
            <p className="text-sm text-[#8a8a9e] mb-6">{this.state.error?.message || "Erro inesperado"}</p>
            <button onClick={() => { this.setState({ hasError: false }); window.location.reload(); }} className="btn-primary">
              Recarregar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
