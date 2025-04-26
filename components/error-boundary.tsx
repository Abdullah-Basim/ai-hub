"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo)

    // Optional: Send to your error tracking service
    // reportError(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-6">
              We apologize for the inconvenience. Please try again or contact support if the problem persists.
            </p>
            <div className="flex gap-4">
              <Button onClick={() => window.location.reload()} variant="outline">
                Refresh Page
              </Button>
              <Button onClick={() => this.setState({ hasError: false, error: null })}>Try Again</Button>
            </div>
            {process.env.NODE_ENV !== "production" && this.state.error && (
              <div className="mt-6 p-4 bg-gray-100 rounded-md text-left overflow-auto max-w-full">
                <p className="font-mono text-sm text-red-600">{this.state.error.toString()}</p>
              </div>
            )}
          </div>
        )
      )
    }

    return this.props.children
  }
}
