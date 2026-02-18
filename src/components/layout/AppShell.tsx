'use client';

import { useRouter } from 'next/navigation';
import Header from './Header';
import BottomNav from './BottomNav';

interface AppShellProps {
  children: React.ReactNode;
  streakCount?: number;
}

export default function AppShell({ children, streakCount = 0 }: AppShellProps) {
  const router = useRouter();

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{
        backgroundColor: '#0A0A0A',
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      {/* Header */}
      <Header
        streakCount={streakCount}
        onSettingsClick={() => router.push('/settings')}
      />

      {/* Main Content */}
      <main className="flex-1 pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
