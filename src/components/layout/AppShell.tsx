'use client';

import { useRouter } from 'next/navigation';
import Header from './Header';
import BottomNav from './BottomNav';
import { useStreak } from '@/hooks/useStreak';

interface AppShellProps {
  children: React.ReactNode;
  streakCount?: number;
}

export default function AppShell({ children, streakCount }: AppShellProps) {
  const router = useRouter();
  // FIX 3: Fetch real streak count instead of using hardcoded 0
  const { streak } = useStreak();
  const resolvedStreakCount = streakCount ?? (streak?.current_streak ?? 0);

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
        streakCount={resolvedStreakCount}
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
