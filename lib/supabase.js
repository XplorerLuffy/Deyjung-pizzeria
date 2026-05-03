import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function fetchMenu() {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('is_available', true)
    .order('category', { ascending: true });
  if (error) throw error;
  return data;
}

export async function submitOrder({ orderType, tableNumber, customerName, customerNote, subtotal, items }) {
  const { data: orderData, error: orderError } = await supabase
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
  if (orderError) throw orderError;

  const orderItems = items.map((item) => ({
    order_id: orderData.id,
    menu_item_id: item.menuItemId,
    loyverse_item_id: item.loyverseItemId,
    item_name: item.name,
    item_price: item.price,
    quantity: item.quantity,
    item_note: item.note || null,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);
  if (itemsError) throw itemsError;

  return orderData;
}

export async function fetchOrders(limit = 50) {
  const { data, error } = await supabase
    .from('orders')
    .select(`*, order_items(*)`)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function updateOrderStatus(orderId, status) {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);
  if (error) throw error;
}

export async function triggerMenuSync() {
  const res = await fetch(`${supabaseUrl}/functions/v1/sync-loyverse-menu`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}
