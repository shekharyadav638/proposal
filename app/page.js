'use client';

import dynamic from 'next/dynamic';

const Viewer = dynamic(() => import('../components/Viewer'), {
  ssr: false,
  loading: () => (
    <div className="boot">
      <div className="boot-spinner" />
      <p>Angebot wird geladen…</p>
    </div>
  ),
});

export default function Home() {
  return <Viewer />;
}
