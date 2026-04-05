import { Component, ErrorInfo, ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App error:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
          <div className="card max-w-md w-full text-center">
            <span className="text-5xl">🌸</span>
            <h1 className="text-ink-100 font-bold text-xl mt-4 mb-2">Something went wrong</h1>
            <p className="text-ink-400 text-sm mb-1">An unexpected error occurred.</p>
            <p className="text-ink-500 text-xs font-mono bg-bg-secondary rounded p-2 mb-5 text-left break-all">
              {this.state.error.message}
            </p>
            <button
              className="btn-primary"
              onClick={() => this.setState({ error: null })}
            >
              Try again
            </button>
            <button
              className="btn-secondary mt-2"
              onClick={() => { localStorage.clear(); window.location.reload() }}
            >
              Reset app data
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
