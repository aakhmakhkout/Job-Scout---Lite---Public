import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import ToastProvider from '@/components/ui/ToastProvider';
import './globals.css';

const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
});

const body = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
});

export const metadata = {
  title: 'JobScout Lite — job intelligence, without the noise',
  description:
    'A free job dashboard that scores every listing for trust and flags scams before you apply.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        {/*
          Dark mode is class-based (Tailwind `darkMode: 'class'`).
          This inline script runs before paint to avoid a flash of the wrong theme,
          reading a saved preference or falling back to the OS setting.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const saved = localStorage.getItem('jobscout-theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (saved ? saved === 'dark' : prefersDark) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
