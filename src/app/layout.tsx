import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '../index.css';

export const metadata: Metadata = {
  title: 'JASASAJA Personal OS',
  applicationName: 'JASASAJA Personal OS',
  description:
    'Learning & Engineering Operating System untuk penggunaan pribadi — memadukan Learning Center, Engineering Handbook, dan Project Workspace.',
  openGraph: {
    locale: 'id_ID',
    siteName: 'JASASAJA Personal OS',
    title: 'JASASAJA Personal OS',
    description:
      'Learning & Engineering Operating System untuk penggunaan pribadi — memadukan Learning Center, Engineering Handbook, dan Project Workspace.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JASASAJA Personal OS',
    description:
      'Learning & Engineering Operating System untuk penggunaan pribadi — memadukan Learning Center, Engineering Handbook, dan Project Workspace.',
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400..700;1,9..40,400..700&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
