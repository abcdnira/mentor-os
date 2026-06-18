"use client";

import React from "react";

interface Props {
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="my-2 p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">
            Render error: {this.state.error?.message || "Unknown error"}
          </div>
        )
      );
    }
    return this.props.children;
  }
}
