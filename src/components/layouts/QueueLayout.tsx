import { ReactNode } from 'react';

interface QueueLayoutProps {
  children: ReactNode;
}

export function QueueLayout({ children }: QueueLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      {children}
    </div>
  );
} 