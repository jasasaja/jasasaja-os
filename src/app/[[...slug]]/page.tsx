'use client';

import dynamic from 'next/dynamic';

// App memakai window.location / window.history saat render, jadi hanya di browser.
const App = dynamic(() => import('../../App'), { ssr: false });

export default function Page() {
  return <App />;
}
