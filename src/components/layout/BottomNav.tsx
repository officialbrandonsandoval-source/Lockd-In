'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

interface NavItem {
  label: string;
  href: string;
  icon: (active: boolean) => React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
          stroke={active ? '#C9A84C' : '#8A8578'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={active ? 'rgba(201, 168, 76, 0.15)' : 'none'}
        />
        <path
          d="M9 22V12H15V22"
          stroke={active ? '#C9A84C' : '#8A8578'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: 'Blueprint',
    href: '/blueprint',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
          stroke={active ? '#C9A84C' : '#8A8578'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={active ? 'rgba(201, 168, 76, 0.15)' : 'none'}
        />
        <path d="M14 2V8H20" stroke={active ? '#C9A84C' : '#8A8578'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 13H8" stroke={active ? '#C9A84C' : '#8A8578'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 17H8" stroke={active ? '#C9A84C' : '#8A8578'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 9H8" stroke={active ? '#C9A84C' : '#8A8578'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Check-in',
    href: '/checkin',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18457 2.99721 7.13633 4.39828 5.49707C5.79935 3.85782 7.69279 2.71538 9.79619 2.24015C11.8996 1.76491 14.1003 1.98234 16.07 2.86"
          stroke={active ? '#C9A84C' : '#8A8578'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M22 4L12 14.01L9 11.01"
          stroke={active ? '#C9A84C' : '#8A8578'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: 'Pulse',
    href: '/pulse',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M22 12H18L15 21L9 3L6 12H2"
          stroke={active ? '#C9A84C' : '#8A8578'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: 'Share',
    href: '/share',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle
          cx="18" cy="5" r="3"
          stroke={active ? '#C9A84C' : '#8A8578'}
          strokeWidth="1.5"
          fill={active ? 'rgba(201, 168, 76, 0.15)' : 'none'}
        />
        <circle
          cx="6" cy="12" r="3"
          stroke={active ? '#C9A84C' : '#8A8578'}
          strokeWidth="1.5"
          fill={active ? 'rgba(201, 168, 76, 0.15)' : 'none'}
        />
        <circle
          cx="18" cy="19" r="3"
          stroke={active ? '#C9A84C' : '#8A8578'}
          strokeWidth="1.5"
          fill={active ? 'rgba(201, 168, 76, 0.15)' : 'none'}
        />
        <path d="M8.59 13.51L15.42 17.49" stroke={active ? '#C9A84C' : '#8A8578'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15.41 6.51L8.59 10.49" stroke={active ? '#C9A84C' : '#8A8578'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        backgroundColor: '#0A0A0A',
        borderTop: '1px solid #2A2A2A',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center justify-around px-2 py-1.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1.5"
            >
              {/* Active indicator dot */}
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -top-1.5 h-0.5 w-5 rounded-full"
                  style={{ backgroundColor: '#C9A84C' }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}

              {/* Icon */}
              <motion.div
                whileTap={{ scale: 0.85 }}
                transition={{ duration: 0.15 }}
              >
                {item.icon(!!isActive)}
              </motion.div>

              {/* Label */}
              <span
                className="text-[10px] font-sans font-medium"
                style={{
                  color: isActive ? '#C9A84C' : '#8A8578',
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
