'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const TABLE_COUNT = 5;

const TABLES = [
  ...Array.from({ length: TABLE_COUNT }, (_, i) => ({
    id: String(i + 1),
    label: `Table ${i + 1}`,
  })),
  { id: 'takeaway', label: 'Takeaway' },
];

export default function QRPage() {
  const [siteUrl, setSiteUrl] = useState('');
  const [generated, setGenerated] = useState(false);
  const canvasRefs = useRef({});

  // Default to the current origin so QR codes work without config
  useEffect(() => {
    const origin = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    setSiteUrl(origin);
  }, []);

  useEffect(() => {
    if (!siteUrl) return;
    generateAll();
  }, [siteUrl]);

  async function generateAll() {
    const QRCode = (await import('qrcode')).default;
    for (const table of TABLES) {
      const url = `${siteUrl}/table/${table.id}`;
      const canvas = canvasRefs.current[table.id];
      if (canvas) {
        await QRCode.toCanvas(canvas, url, {
          width: 240,
          margin: 2,
          color: { dark: '#2c1a0e', light: '#fdf8f3' },
        });
      }
    }
    setGenerated(true);
  }

  function downloadQR(tableId, label) {
    const canvas = canvasRefs.current[tableId];
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `deyjung-qr-${label.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  function downloadAll() {
    TABLES.forEach((t) => downloadQR(t.id, t.label));
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '10px',
    border: '1.5px solid #d4c4b0', fontFamily: "'DM Sans', sans-serif",
    fontSize: '14px', color: '#2c1a0e', boxSizing: 'border-box', outline: 'none',
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', background: '#f5f0eb', paddingBottom: '60px' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>

      {/* Header */}
      <div style={{ background: '#2c1a0e', padding: '20px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <Link href="/admin" style={{ color: '#c9a97a', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>← Back to Orders</Link>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 800, color: '#fff', marginTop: '8px' }}>QR Codes</div>
          <div style={{ fontSize: '12px', color: '#c9a97a', letterSpacing: '0.1em' }}>SCAN TO ORDER</div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>
        {/* Site URL config */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontWeight: 700, fontSize: '15px', color: '#2c1a0e', marginBottom: '10px' }}>Website URL</div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value.replace(/\/$/, ''))}
              placeholder="https://your-domain.com"
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              onClick={generateAll}
              style={{ padding: '10px 20px', background: '#c0392b', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Regenerate
            </button>
          </div>
          <div style={{ fontSize: '12px', color: '#9e8a75', marginTop: '8px' }}>
            QR codes point to: <code style={{ background: '#f0e8df', padding: '2px 6px', borderRadius: '4px' }}>{siteUrl}/table/[number]</code>
          </div>
        </div>

        {/* Download All */}
        {generated && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button onClick={downloadAll} style={{ padding: '10px 22px', background: '#2c1a0e', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
              ⬇ Download All
            </button>
          </div>
        )}

        {/* QR Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {TABLES.map((table) => (
            <div key={table.id} style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '16px', color: '#2c1a0e' }}>
                {table.label}
              </div>
              <div style={{ background: '#fdf8f3', borderRadius: '12px', padding: '8px' }}>
                <canvas ref={(el) => { canvasRefs.current[table.id] = el; }} />
              </div>
              <div style={{ fontSize: '11px', color: '#9e8a75', wordBreak: 'break-all', textAlign: 'center' }}>
                {siteUrl}/table/{table.id}
              </div>
              <button
                onClick={() => downloadQR(table.id, table.label)}
                style={{ width: '100%', padding: '9px', background: 'transparent', color: '#c0392b', border: '2px solid #c0392b', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
                ⬇ Download PNG
              </button>
            </div>
          ))}
        </div>

        {/* Print tip */}
        <div style={{ marginTop: '28px', background: '#fff8f0', borderRadius: '12px', padding: '16px 20px', fontSize: '13px', color: '#8b6f4e' }}>
          <strong>Tip:</strong> Download each QR as PNG, then print and laminate for each table. For best results, print at 5×5 cm or larger.
        </div>
      </div>
    </div>
  );
}
