'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { fetchOrders, updateOrderStatus, triggerMenuSync, supabase } from '../../lib/supabase';

const STATUS_COLORS = {
  pending: { bg: '#fff3e0', color: '#e65100', label: '⏳ Pending' },
  preparing: { bg: '#e3f2fd', color: '#1565c0', label: '👨‍🍳 Preparing' },
  ready: { bg: '#e8f5e9', color: '#2e7d32', label: '✅ Ready' },
  completed: { bg: '#f5f5f5', color: '#757575', label: '✔ Completed' },
  cancelled: { bg: '#ffebee', color: '#c62828', label: '✖ Cancelled' },
};
const NEXT_STATUS = { pending: 'preparing', preparing: 'ready', ready: 'completed' };

export default function AdminPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [filter, setFilter] = useState('active');

  async function loadOrders() {
    try { const data = await fetchOrders(100); setOrders(data || []); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    loadOrders();
    const channel = supabase.channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, loadOrders)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  async function handleStatusChange(orderId, newStatus) {
    await updateOrderStatus(orderId, newStatus);
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
  }

  async function handleSync() {
    setSyncing(true); setSyncResult(null);
    try { const result = await triggerMenuSync(); setSyncResult(result); }
    catch (e) { setSyncResult({ success: false, error: e.message }); }
    finally { setSyncing(false); }
  }

  const filtered = orders.filter((o) => {
    if (filter === 'active') return ['pending', 'preparing', 'ready'].includes(o.status);
    if (filter === 'completed') return o.status === 'completed';
    return true;
  });

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', background: '#f5f0eb', paddingBottom: '60px' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
      <div style={{ background: '#2c1a0e', padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 800, color: '#fff' }}>DEYJUNG Admin</div>
            <div style={{ fontSize: '12px', color: '#c9a97a', letterSpacing: '0.1em' }}>ORDER DASHBOARD</div>
          </div>
          <button onClick={handleSync} disabled={syncing} style={{ background: syncing ? '#555' : '#c0392b', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 18px', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '13px', cursor: syncing ? 'not-allowed' : 'pointer' }}>
            {syncing ? 'Syncing...' : '🔄 Sync Menu'}
          </button>
        </div>
        {/* Nav */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { href: '/admin', label: '🧾 Orders', active: true },
            { href: '/admin/menu', label: '🍽️ Menu', active: false },
            { href: '/admin/qr', label: '📱 QR Codes', active: false },
          ].map(({ href, label, active }) => (
            <a key={href} href={href} style={{ padding: '7px 16px', borderRadius: '100px', background: active ? '#c0392b' : 'rgba(255,255,255,0.12)', color: '#fff', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
              {label}
            </a>
          ))}
        </div>
      </div>
      {syncResult && (
        <div style={{ margin: '12px 16px 0', padding: '12px 16px', borderRadius: '10px', background: syncResult.success ? '#e8f5e9' : '#ffebee', color: syncResult.success ? '#2e7d32' : '#c62828', fontSize: '13px', fontWeight: 600 }}>
          {syncResult.success ? `✅ Synced ${syncResult.synced} items from Loyverse` : `❌ Sync failed: ${syncResult.error}`}
        </div>
      )}
      <div style={{ display: 'flex', gap: '8px', padding: '16px 16px 0', flexWrap: 'wrap' }}>
        {[['active', '🔥 Active'], ['completed', '✔ Completed'], ['all', 'All']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)} style={{ padding: '8px 16px', borderRadius: '100px', border: filter === val ? 'none' : '1.5px solid #d4c4b0', background: filter === val ? '#2c1a0e' : '#fff', color: filter === val ? '#fff' : '#6b5c4a', fontWeight: 600, fontSize: '13px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>{label}</button>
        ))}
      </div>
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? <div style={{ textAlign: 'center', padding: '40px', color: '#9e8a75' }}>Loading...</div>
          : filtered.length === 0 ? <div style={{ textAlign: 'center', padding: '60px', color: '#9e8a75' }}><div style={{ fontSize: '40px', marginBottom: '12px' }}>🍽️</div><div style={{ fontWeight: 600 }}>No orders yet</div></div>
          : filtered.map((order) => {
            const st = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
            const nextStatus = NEXT_STATUS[order.status];
            return (
              <div key={order.id} style={{ background: '#fff', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '16px', color: '#2c1a0e' }}>Order #{order.order_number}</div>
                    <div style={{ fontSize: '12px', color: '#9e8a75', marginTop: '2px' }}>{order.order_type === 'dine_in' ? `🪑 Table ${order.table_number}` : '🥡 Takeaway'}{order.customer_name ? ` · ${order.customer_name}` : ''}</div>
                    <div style={{ fontSize: '11px', color: '#bbb', marginTop: '2px' }}>{new Date(order.created_at).toLocaleTimeString()}</div>
                  </div>
                  <div style={{ background: st.bg, color: st.color, borderRadius: '8px', padding: '4px 10px', fontSize: '12px', fontWeight: 700 }}>{st.label}</div>
                </div>
                <div style={{ borderTop: '1px solid #f0e8df', paddingTop: '10px', marginBottom: '10px' }}>
                  {(order.order_items || []).map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '3px 0', color: '#4a3728' }}>
                      <span>{item.quantity}× {item.item_name}</span>
                      <span style={{ color: '#c0392b', fontWeight: 600 }}>Nu. {(item.item_price * item.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: '#2c1a0e' }}>Total: Nu. {Number(order.subtotal).toFixed(0)}</div>
                  {nextStatus && <button onClick={() => handleStatusChange(order.id, nextStatus)} style={{ background: '#2c1a0e', color: '#fff', border: 'none', borderRadius: '10px', padding: '8px 16px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Mark {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)} →</button>}
                </div>
                {order.customer_note && <div style={{ marginTop: '10px', background: '#fff8f0', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: '#8b6f4e' }}>📝 {order.customer_note}</div>}
              </div>
            );
          })}
      </div>
    </div>
  );
}
