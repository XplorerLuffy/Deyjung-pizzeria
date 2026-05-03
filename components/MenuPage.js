'use client';

import { useState, useEffect } from 'react';
import { fetchMenu, submitOrder } from '../lib/supabase';

const CATEGORY_ICONS = {
  Pizza: '🍕', Mains: '🍛', Snacks: '🍟',
  Drinks: '🥤', Desserts: '🍨', Default: '🍽️',
};

const MOCK_MENU = [
  { id: '1', loyverse_item_id: 'mock-1', name: 'Margherita Pizza', description: 'Fresh tomato, mozzarella, basil', category: 'Pizza', price: 280, image_url: null, is_available: true },
  { id: '2', loyverse_item_id: 'mock-2', name: 'BBQ Chicken Pizza', description: 'Smoky BBQ sauce, grilled chicken, red onion', category: 'Pizza', price: 320, image_url: null, is_available: true },
  { id: '3', loyverse_item_id: 'mock-3', name: 'Pepperoni Pizza', description: 'Classic pepperoni with mozzarella', category: 'Pizza', price: 310, image_url: null, is_available: true },
  { id: '4', loyverse_item_id: 'mock-4', name: 'Veggie Supreme', description: 'Bell peppers, mushroom, olives, corn', category: 'Pizza', price: 290, image_url: null, is_available: true },
  { id: '5', loyverse_item_id: 'mock-5', name: 'Ema Datshi', description: "Bhutan's national dish — chillies & cheese", category: 'Mains', price: 150, image_url: null, is_available: true },
  { id: '6', loyverse_item_id: 'mock-6', name: 'Phaksha Paa', description: 'Pork with red chillies & spinach', category: 'Mains', price: 180, image_url: null, is_available: true },
  { id: '7', loyverse_item_id: 'mock-7', name: 'Butter Chicken', description: 'Creamy tomato curry with naan', category: 'Mains', price: 200, image_url: null, is_available: true },
  { id: '8', loyverse_item_id: 'mock-8', name: 'Chicken Burger', description: 'Crispy chicken, lettuce, house sauce', category: 'Snacks', price: 160, image_url: null, is_available: true },
  { id: '9', loyverse_item_id: 'mock-9', name: 'Loaded Fries', description: 'Cheese sauce, jalapeños, sour cream', category: 'Snacks', price: 120, image_url: null, is_available: true },
  { id: '10', loyverse_item_id: 'mock-10', name: 'Garlic Bread', description: 'Toasted with herb butter', category: 'Snacks', price: 80, image_url: null, is_available: true },
  { id: '11', loyverse_item_id: 'mock-11', name: 'Coca-Cola', description: '330ml chilled', category: 'Drinks', price: 40, image_url: null, is_available: true },
  { id: '12', loyverse_item_id: 'mock-12', name: 'Fresh Lime Soda', description: 'Homemade, sweet or salted', category: 'Drinks', price: 60, image_url: null, is_available: true },
  { id: '13', loyverse_item_id: 'mock-13', name: 'Mango Lassi', description: 'Thick yogurt mango shake', category: 'Drinks', price: 80, image_url: null, is_available: true },
];

const formatPrice = (p) => `Nu. ${Number(p).toFixed(0)}`;

function CategoryPill({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 18px', borderRadius: '100px',
      border: active ? 'none' : '1.5px solid #e0d5c5',
      background: active ? '#c0392b' : '#fff',
      color: active ? '#fff' : '#6b5c4a',
      fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
      fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s',
      whiteSpace: 'nowrap',
    }}>
      {CATEGORY_ICONS[label] || CATEGORY_ICONS.Default} {label}
    </button>
  );
}

function MenuCard({ item, cartQty, onAdd, onRemove }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff', borderRadius: '16px', overflow: 'hidden',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.12)' : '0 2px 12px rgba(0,0,0,0.07)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'all 0.2s', display: 'flex', flexDirection: 'column',
      }}>
      <div style={{
        height: '130px',
        background: item.image_url ? `url(${item.image_url}) center/cover` : 'linear-gradient(135deg, #f9f0e6 0%, #f0dfc8 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px',
      }}>
        {!item.image_url && (CATEGORY_ICONS[item.category] || '🍽️')}
      </div>
      <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '15px', color: '#2c1a0e', lineHeight: 1.3 }}>
          {item.name}
        </div>
        {item.description && (
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#9e8a75', lineHeight: 1.4 }}>
            {item.description}
          </div>
        )}
        <div style={{ marginTop: 'auto', paddingTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '15px', color: '#c0392b' }}>
            {formatPrice(item.price)}
          </span>
          {cartQty === 0 ? (
            <button onClick={() => onAdd(item)} style={{
              background: '#c0392b', color: '#fff', border: 'none',
              borderRadius: '100px', padding: '7px 16px',
              fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '13px', cursor: 'pointer',
            }}>+ Add</button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={() => onRemove(item)} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #c0392b', background: '#fff', color: '#c0392b', fontWeight: 700, fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '15px', minWidth: '16px', textAlign: 'center' }}>{cartQty}</span>
              <button onClick={() => onAdd(item)} style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: '#c0392b', color: '#fff', fontWeight: 700, fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CartSheet({ cart, menu, tableId, onClose, onOrderPlaced }) {
  const isDineIn = tableId !== 'takeaway';
  const [orderType, setOrderType] = useState(isDineIn ? 'dine_in' : 'takeaway');
  const [customerName, setCustomerName] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const items = Object.entries(cart)
    .map(([id, qty]) => ({ ...menu.find((m) => m.id === id), qty }))
    .filter((i) => i.qty > 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  async function placeOrder() {
    setLoading(true); setError('');
    try {
      const order = await submitOrder({
        orderType, tableNumber: isDineIn ? tableId : null,
        customerName, customerNote: note, subtotal,
        items: items.map((i) => ({
          menuItemId: i.id, loyverseItemId: i.loyverse_item_id,
          name: i.name, price: i.price, quantity: i.qty,
        })),
      });
      onOrderPlaced(order);
    } catch (e) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: '12px',
    border: '1.5px solid #e0d5c5', fontFamily: "'DM Sans', sans-serif",
    fontSize: '14px', color: '#2c1a0e', boxSizing: 'border-box', outline: 'none', marginBottom: '12px',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column' }}>
      <div onClick={onClose} style={{ flex: 1, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }} />
      <div style={{ background: '#fff', borderRadius: '24px 24px 0 0', maxHeight: '85vh', overflowY: 'auto', paddingBottom: '40px', animation: 'slideUp 0.3s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px' }}>
          <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: '#e0d5c5' }} />
        </div>
        <div style={{ padding: '0 20px' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 700, color: '#2c1a0e', marginBottom: '20px' }}>Your Order</div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            {['dine_in', 'takeaway'].map((t) => (
              <button key={t} onClick={() => setOrderType(t)} style={{ flex: 1, padding: '10px', borderRadius: '12px', border: orderType === t ? 'none' : '1.5px solid #e0d5c5', background: orderType === t ? '#2c1a0e' : '#fff', color: orderType === t ? '#fff' : '#6b5c4a', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                {t === 'dine_in' ? `🪑 Dine In${isDineIn ? ` (Table ${tableId})` : ''}` : '🥡 Takeaway'}
              </button>
            ))}
          </div>
          <input placeholder="Your name (optional)" value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={inputStyle} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            {items.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '14px', color: '#2c1a0e' }}>{item.qty}× {item.name}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: '#c0392b', fontSize: '14px' }}>{formatPrice(item.price * item.qty)}</div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1.5px dashed #e0d5c5', paddingTop: '14px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '16px' }}>Total</span>
              <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '18px', color: '#c0392b' }}>{formatPrice(subtotal)}</span>
            </div>
          </div>
          <textarea placeholder="Special instructions (optional)" value={note} onChange={(e) => setNote(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'none' }} />
          {error && <div style={{ background: '#fff0f0', color: '#c0392b', borderRadius: '10px', padding: '10px 14px', marginBottom: '12px', fontSize: '13px' }}>{error}</div>}
          <button onClick={placeOrder} disabled={loading || items.length === 0} style={{ width: '100%', padding: '16px', background: loading ? '#ccc' : '#c0392b', color: '#fff', border: 'none', borderRadius: '16px', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SuccessScreen({ order, tableId, onNewOrder }) {
  return (
    <div style={{ minHeight: '100vh', background: '#fdf8f3', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: '72px', marginBottom: '20px' }}>🎉</div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 700, color: '#2c1a0e', marginBottom: '12px' }}>Order Placed!</div>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '15px', color: '#9e8a75', marginBottom: '8px' }}>
        {tableId !== 'takeaway' ? `Table ${tableId}` : 'Takeaway'} · Order #{order?.order_number || '—'}
      </div>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '20px 28px', margin: '24px 0', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', maxWidth: '320px' }}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: '#6b5c4a', lineHeight: 1.7 }}>
          We've received your order and sent it to the kitchen. 🍕<br />Sit back and relax!
        </div>
      </div>
      <button onClick={onNewOrder} style={{ background: 'transparent', border: '2px solid #c0392b', color: '#c0392b', borderRadius: '100px', padding: '12px 28px', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
        Order More
      </button>
    </div>
  );
}

export default function MenuPage({ tableId }) {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState({});
  const [showCart, setShowCart] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  useEffect(() => {
    fetchMenu()
      .then((data) => setMenu(data?.length ? data : MOCK_MENU))
      .catch(() => setMenu(MOCK_MENU))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...Array.from(new Set(menu.map((i) => i.category).filter(Boolean)))];
  const filtered = activeCategory === 'All' ? menu : menu.filter((i) => i.category === activeCategory);
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = menu.find((m) => m.id === id);
    return sum + (item?.price || 0) * qty;
  }, 0);

  const addToCart = (item) => setCart((p) => ({ ...p, [item.id]: (p[item.id] || 0) + 1 }));
  const removeFromCart = (item) => setCart((p) => {
    const n = { ...p };
    if (n[item.id] > 1) n[item.id]--; else delete n[item.id];
    return n;
  });

  if (completedOrder) {
    return <SuccessScreen order={completedOrder} tableId={tableId} onNewOrder={() => { setCompletedOrder(null); setCart({}); }} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fdf8f3', paddingBottom: '120px' }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div style={{ background: '#2c1a0e', padding: '24px 20px 20px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>DEYJUNG</div>
              <div style={{ fontSize: '12px', color: '#c9a97a', fontWeight: 500, letterSpacing: '0.12em', marginTop: '2px' }}>RESTRO & PIZZERIA</div>
            </div>
            {tableId !== 'takeaway' ? (
              <div style={{ background: '#c0392b', borderRadius: '10px', padding: '6px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em', fontWeight: 600 }}>TABLE</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff', fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>{tableId}</div>
              </div>
            ) : (
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px 14px' }}>
                <div style={{ fontSize: '13px', color: '#c9a97a', fontWeight: 600 }}>🥡 Takeaway</div>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
            {categories.map((cat) => (
              <CategoryPill key={cat} label={cat} active={activeCategory === cat} onClick={() => setActiveCategory(cat)} />
            ))}
          </div>
        </div>
      </div>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px 16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9e8a75', fontFamily: "'DM Sans', sans-serif" }}>Loading menu...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px', animation: 'fadeIn 0.4s ease' }}>
            {filtered.map((item) => (
              <MenuCard key={item.id} item={item} cartQty={cart[item.id] || 0} onAdd={addToCart} onRemove={removeFromCart} />
            ))}
          </div>
        )}
      </div>
      {cartCount > 0 && (
        <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 60, width: 'calc(100% - 32px)', maxWidth: '560px' }}>
          <button onClick={() => setShowCart(true)} style={{ width: '100%', padding: '16px 24px', background: '#c0392b', color: '#fff', border: 'none', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxShadow: '0 8px 32px rgba(192,57,43,0.45)' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '4px 10px', fontWeight: 700, fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}>{cartCount} {cartCount === 1 ? 'item' : 'items'}</div>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '15px' }}>View Order</span>
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '16px' }}>{formatPrice(cartTotal)}</span>
          </button>
        </div>
      )}
      {showCart && (
        <CartSheet cart={cart} menu={menu} tableId={tableId} onClose={() => setShowCart(false)}
          onOrderPlaced={(order) => { setShowCart(false); setCompletedOrder(order); }} />
      )}
    </div>
  );
}
