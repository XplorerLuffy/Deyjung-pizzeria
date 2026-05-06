import { createClient } from '@supabase/supabase-js';

// Use service role key so server-side inserts bypass RLS anon restrictions
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { orderType, tableNumber, customerName, customerNote, subtotal, items } = body;

  if (!orderType || !Array.isArray(items) || items.length === 0) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // 1. Insert the order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_type: orderType,
      table_number: orderType === 'dine_in' ? Number(tableNumber) : null,
      customer_name: customerName || null,
      customer_note: customerNote || null,
      subtotal,
      status: 'pending',
    })
    .select()
    .single();

  if (orderError) {
    console.error('Order insert error:', orderError);
    return Response.json({ error: orderError.message }, { status: 500 });
  }

  // 2. Insert line items
  const orderItems = items.map((item) => ({
    order_id: order.id,
    menu_item_id: item.menuItemId || null,
    loyverse_item_id: item.loyverseItemId || null,
    item_name: item.name,
    item_price: item.price,
    quantity: item.quantity,
    item_note: item.note || null,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) {
    console.error('Order items insert error:', itemsError);
    return Response.json({ error: itemsError.message }, { status: 500 });
  }

  // 3. Push receipt to Loyverse (fire-and-forget — order is already saved)
  if (process.env.LOYVERSE_API_TOKEN && process.env.LOYVERSE_STORE_ID) {
    pushToLoyverse(order, items).catch((err) =>
      console.error('Loyverse receipt push failed:', err.message)
    );
  }

  return Response.json(order);
}

async function pushToLoyverse(order, items) {
  // Only send items that have a real Loyverse item ID (skip mock data)
  const lineItems = items
    .filter((i) => i.loyverseItemId && !String(i.loyverseItemId).startsWith('mock-'))
    .map((i) => ({
      item_id: i.loyverseItemId,
      quantity: i.quantity,
      price: i.price,
      total_money: i.price * i.quantity,
    }));

  if (lineItems.length === 0) return;

  const noteParts = [
    order.order_type === 'dine_in' ? `Table ${order.table_number}` : 'Takeaway',
    order.customer_name ? `Customer: ${order.customer_name}` : null,
    order.customer_note ? `Note: ${order.customer_note}` : null,
  ].filter(Boolean);

  const payload = {
    receipt_date: new Date().toISOString(),
    source: 'WEBSITE',
    store_id: process.env.LOYVERSE_STORE_ID,
    employee_id: process.env.LOYVERSE_EMPLOYEE_ID || undefined,
    note: noteParts.join(' | '),
    order: { line_items: lineItems },
  };

  const res = await fetch('https://api.loyverse.com/v1.0/receipts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.LOYVERSE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Loyverse API ${res.status}: ${text}`);
  }

  const receipt = await res.json();

  // Store Loyverse receipt ID on the order for reference
  await supabase
    .from('orders')
    .update({ loyverse_receipt_id: receipt.id })
    .eq('id', order.id);
}
