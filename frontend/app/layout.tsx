import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { LineLoader, NavigationProvider } from '@/components/ui/line-loader';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MockBox - API Mock Builder',
  description: 'Build, test, and deploy realistic API mocks in seconds',
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
          <NavigationProvider>
            <LineLoader />
            {children}
            <Toaster />
          </NavigationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}