'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';

const CSV_TEMPLATE = `name,category,price,description,image_url
Margherita Pizza,Pizza,280,Fresh tomato and mozzarella,
BBQ Chicken Pizza,Pizza,320,Smoky BBQ sauce and grilled chicken,
Ema Datshi,Mains,150,Bhutan's national dish — chillies and cheese,
Coca-Cola,Drinks,40,330ml chilled,
`;

const CATEGORY_ICONS = {
  Pizza: '🍕', Mains: '🍛', Snacks: '🍟',
  Drinks: '🥤', Desserts: '🍨', Default: '🍽️',
};

export default function MenuAdminPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [csvText, setCsvText] = useState('');
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const fileRef = useRef();

  useEffect(() => { loadMenu(); }, []);

  async function loadMenu() {
    setLoadingMenu(true);
    try {
      const { data } = await supabase.from('menu_items').select('*').order('category').order('name');
      setMenuItems(data || []);
    } finally {
      setLoadingMenu(false);
    }
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      setCsvText(text);
      setUploadResult(null);
      parsePreview(text);
    };
    reader.readAsText(file);
  }

  function parsePreview(text) {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) { setPreview(null); return; }
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const rows = lines.slice(1).map((line) => {
      const cols = splitCSVLine(line);
      const row = {};
      headers.forEach((h, i) => { row[h] = cols[i]?.trim() || ''; });
      return row;
    });
    setPreview({ headers, rows });
  }

  async function handleUpload() {
    if (!csvText) return;
    setUploading(true);
    setUploadResult(null);
    try {
      const res = await fetch('/api/menu/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv: csvText }),
      });
      const result = await res.json();
      setUploadResult(result);
      if (result.success) {
        setCsvText('');
        setPreview(null);
        if (fileRef.current) fileRef.current.value = '';
        await loadMenu();
      }
    } catch (e) {
      setUploadResult({ error: e.message });
    } finally {
      setUploading(false);
    }
  }

  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'deyjung-menu-template.csv';
    link.click();
  }

  async function toggleAvailability(item) {
    await supabase.from('menu_items').update({ is_available: !item.is_available }).eq('id', item.id);
    setMenuItems((prev) => prev.map((m) => m.id === item.id ? { ...m, is_available: !m.is_available } : m));
  }

  const categories = [...new Set(menuItems.map((i) => i.category).filter(Boolean))];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', background: '#f5f0eb', paddingBottom: '60px' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>

      {/* Header */}
      <div style={{ background: '#2c1a0e', padding: '20px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <Link href="/admin" style={{ color: '#c9a97a', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>← Back to Orders</Link>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 800, color: '#fff', marginTop: '8px' }}>Menu Management</div>
          <div style={{ fontSize: '12px', color: '#c9a97a', letterSpacing: '0.1em' }}>UPLOAD & MANAGE ITEMS</div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* CSV Upload Card */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 700, color: '#2c1a0e' }}>Upload Menu (CSV)</div>
            <button onClick={downloadTemplate} style={{ background: 'transparent', color: '#c0392b', border: '2px solid #c0392b', borderRadius: '8px', padding: '6px 14px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>
              ⬇ Template
            </button>
          </div>

          <div style={{ fontSize: '13px', color: '#9e8a75', marginBottom: '14px' }}>
            CSV columns: <code style={{ background: '#f0e8df', padding: '2px 6px', borderRadius: '4px' }}>name, category, price, description, image_url</code>
          </div>

          <label style={{ display: 'block', border: '2px dashed #d4c4b0', borderRadius: '12px', padding: '24px', textAlign: 'center', cursor: 'pointer', background: '#fdf8f3' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📂</div>
            <div style={{ fontWeight: 600, color: '#2c1a0e', marginBottom: '4px' }}>Click to choose CSV file</div>
            <div style={{ fontSize: '12px', color: '#9e8a75' }}>or drag and drop</div>
            <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={handleFileChange} style={{ display: 'none' }} />
          </label>

          {/* Preview */}
          {preview && (
            <div style={{ marginTop: '20px' }}>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#2c1a0e', marginBottom: '10px' }}>
                Preview — {preview.rows.length} row{preview.rows.length !== 1 ? 's' : ''} detected
              </div>
              <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1.5px solid #e0d5c5' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f5f0eb' }}>
                      {preview.headers.map((h) => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#6b5c4a', borderBottom: '1px solid #e0d5c5' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.slice(0, 8).map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f0e8df' }}>
                        {preview.headers.map((h) => (
                          <td key={h} style={{ padding: '8px 12px', color: '#2c1a0e' }}>{row[h] || '—'}</td>
                        ))}
                      </tr>
                    ))}
                    {preview.rows.length > 8 && (
                      <tr><td colSpan={preview.headers.length} style={{ padding: '8px 12px', color: '#9e8a75', fontSize: '12px' }}>…and {preview.rows.length - 8} more rows</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <button
                onClick={handleUpload}
                disabled={uploading}
                style={{ marginTop: '14px', width: '100%', padding: '14px', background: uploading ? '#ccc' : '#c0392b', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '15px', cursor: uploading ? 'not-allowed' : 'pointer' }}>
                {uploading ? 'Uploading...' : `Upload ${preview.rows.length} item${preview.rows.length !== 1 ? 's' : ''} to Menu`}
              </button>
            </div>
          )}

          {/* Result */}
          {uploadResult && (
            <div style={{ marginTop: '14px', padding: '12px 16px', borderRadius: '10px', background: uploadResult.success ? '#e8f5e9' : '#ffebee', color: uploadResult.success ? '#2e7d32' : '#c62828', fontSize: '13px', fontWeight: 600 }}>
              {uploadResult.success
                ? `✅ ${uploadResult.upserted} item${uploadResult.upserted !== 1 ? 's' : ''} saved to menu`
                : `❌ ${uploadResult.error}`}
              {uploadResult.parseErrors?.length > 0 && (
                <div style={{ marginTop: '6px', fontWeight: 400, fontSize: '12px' }}>
                  Skipped rows: {uploadResult.parseErrors.join(', ')}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Current Menu */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 700, color: '#2c1a0e', marginBottom: '16px' }}>
            Current Menu ({menuItems.length} items)
          </div>
          {loadingMenu ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#9e8a75' }}>Loading...</div>
          ) : menuItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9e8a75' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>🍽️</div>
              <div style={{ fontWeight: 600 }}>No menu items yet — upload a CSV to get started</div>
            </div>
          ) : (
            categories.map((cat) => (
              <div key={cat} style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#6b5c4a', marginBottom: '8px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {CATEGORY_ICONS[cat] || CATEGORY_ICONS.Default} {cat}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {menuItems.filter((i) => i.category === cat).map((item) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: item.is_available ? '#fdf8f3' : '#f5f5f5', borderRadius: '10px', opacity: item.is_available ? 1 : 0.6 }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: '14px', color: '#2c1a0e' }}>{item.name}</span>
                        {item.description && <span style={{ fontSize: '12px', color: '#9e8a75', marginLeft: '8px' }}>{item.description}</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: 700, color: '#c0392b', fontSize: '14px' }}>Nu. {Number(item.price).toFixed(0)}</span>
                        <button
                          onClick={() => toggleAvailability(item)}
                          style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: item.is_available ? '#e8f5e9' : '#ffebee', color: item.is_available ? '#2e7d32' : '#c62828', fontWeight: 700, fontSize: '11px', cursor: 'pointer' }}>
                          {item.is_available ? 'Available' : 'Hidden'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function splitCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuotes = !inQuotes; }
    else if (ch === ',' && !inQuotes) { result.push(current); current = ''; }
    else { current += ch; }
  }
  result.push(current);
  return result;
}
