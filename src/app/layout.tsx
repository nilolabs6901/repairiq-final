import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'RepairIQ - Smart Home Repair Diagnostics',
  description: 'AI-powered repair diagnostics for your home. Get expert guidance to fix broken appliances, plumbing, electrical, and more.',
  keywords: ['home repair', 'DIY', 'appliance repair', 'diagnostics', 'AI assistant'],
  authors: [{ name: 'RepairIQ' }],
  openGraph: {
    title: 'RepairIQ - Smart Home Repair Diagnostics',
    description: 'AI-powered repair diagnostics for your home',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen-dynamic bg-surface-50 antialiased">
        {children}
      </body>
    </html>
  );
}
