import { useEffect, Component, ReactNode } from 'react';
import Logo from '../assets/jammin.gif';
import CustomLink from './CustomLink';

interface ErrorViewProps {
  channel: string;
}

const ErrorView = ({ channel }: ErrorViewProps) => {
  useEffect(() => {
    document.title = `Error - ${channel}`;
  }, [channel]);

  return (
    <div className="flex flex-col justify-center items-center h-full w-full">
      <img src={Logo} alt="" style={{ height: 'auto', maxWidth: '200px' }} />
      <div className="flex justify-center mt-4">
        <h5 className="text-red-400 text-xl font-semibold">Something went wrong</h5>
      </div>
      <div className="flex justify-center mt-4">
        <CustomLink
          href="/"
          className="border border-primary text-primary px-4 py-2 rounded hover:bg-primary/10 transition-colors inline-block"
        >
          Go Home
        </CustomLink>
      </div>
    </div>
  );
};

interface ErrorBoundaryProps {
  channel: string;
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error', { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorView channel={this.props.channel} />;
    }
    return this.props.children;
  }
}
