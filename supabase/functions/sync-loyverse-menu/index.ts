import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const loyverseToken = Deno.env.get('LOYVERSE_API_TOKEN');
  if (!loyverseToken) {
    return new Response(
      JSON.stringify({ success: false, error: 'LOYVERSE_API_TOKEN not configured' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Fetch all items from Loyverse (max 250 per request)
  const loyverseRes = await fetch('https://api.loyverse.com/v1.0/items?limit=250', {
    headers: { Authorization: `Bearer ${loyverseToken}` },
  });

  if (!loyverseRes.ok) {
    const text = await loyverseRes.text();
    return new Response(
      JSON.stringify({ success: false, error: `Loyverse API error: ${text}` }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const { items } = await loyverseRes.json();

  if (!Array.isArray(items) || items.length === 0) {
    return new Response(
      JSON.stringify({ success: true, synced: 0, message: 'No items in Loyverse' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Map Loyverse item shape to our menu_items schema
  const menuItems = items
    .filter((item: any) => !item.deleted_at)
    .map((item: any) => ({
      loyverse_item_id: item.id,
      name: item.name,
      description: item.description || null,
      // Loyverse categories are IDs; we store the raw value and display it as-is
      category: item.category_id || 'Other',
      // Use the first variant's default price
      price: item.variants?.[0]?.default_price ?? 0,
      image_url: item.image_url || null,
      is_available: true,
    }));

  const { error } = await supabase
    .from('menu_items')
    .upsert(menuItems, { onConflict: 'loyverse_item_id' });

  if (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, synced: menuItems.length }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
