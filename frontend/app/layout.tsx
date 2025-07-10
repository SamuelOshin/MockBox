import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from 'sonner';
import { LineLoader, NavigationProvider } from '@/components/ui/line-loader';
import { AuthProvider } from '@/lib/auth-context';
import { TwentyFirstToolbar } from '@21st-extension/toolbar-next';
import { ReactPlugin } from '@21st-extension/react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MockBox - API Mock Builder',
  description: 'Build, test, and deploy realistic API mocks in seconds',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/placeholder-logo.png', type: 'image/png', sizes: '32x32' }
    ],
    apple: '/placeholder-logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <NavigationProvider>
              <LineLoader />
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: 'white',
                    border: '1px solid #d1fae5',
                    color: '#065f46',
                  },
                  className: 'dark:bg-gray-900 dark:border-emerald-900 dark:text-emerald-200',
                }}
              />
              <TwentyFirstToolbar
                config={{
                  plugins: [ReactPlugin],
                }}
              />
            </NavigationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
