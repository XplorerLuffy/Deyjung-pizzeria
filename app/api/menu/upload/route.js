import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Expected CSV columns (case-insensitive header matching):
//   name, category, price, description, image_url
// Example row:
//   Margherita Pizza,Pizza,280,Fresh tomato and mozzarella,

export async function POST(request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  let csvText;
  try {
    const body = await request.json();
    csvText = body.csv;
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!csvText || typeof csvText !== 'string') {
    return Response.json({ error: 'No CSV data provided' }, { status: 400 });
  }

  const lines = csvText.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) {
    return Response.json({ error: 'CSV must have a header row and at least one data row' }, { status: 400 });
  }

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const required = ['name', 'price'];
  for (const col of required) {
    if (!headers.includes(col)) {
      return Response.json({ error: `Missing required CSV column: "${col}"` }, { status: 400 });
    }
  }

  const idx = {
    name:        headers.indexOf('name'),
    category:    headers.indexOf('category'),
    price:       headers.indexOf('price'),
    description: headers.indexOf('description'),
    image_url:   headers.indexOf('image_url'),
  };

  const rows = [];
  const parseErrors = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCSVLine(lines[i]);
    const name = cols[idx.name]?.trim();
    const priceRaw = cols[idx.price]?.trim();
    const price = parseFloat(priceRaw);

    if (!name) { parseErrors.push(`Row ${i + 1}: missing name`); continue; }
    if (isNaN(price) || price < 0) { parseErrors.push(`Row ${i + 1}: invalid price "${priceRaw}"`); continue; }

    rows.push({
      name,
      category:    idx.category >= 0 ? (cols[idx.category]?.trim() || null) : null,
      price,
      description: idx.description >= 0 ? (cols[idx.description]?.trim() || null) : null,
      image_url:   idx.image_url >= 0 ? (cols[idx.image_url]?.trim() || null) : null,
      is_available: true,
    });
  }

  if (rows.length === 0) {
    return Response.json({ error: 'No valid rows found', parseErrors }, { status: 400 });
  }

  // Upsert by name (no loyverse_item_id when uploading via CSV)
  const { data, error } = await supabase
    .from('menu_items')
    .upsert(rows, { onConflict: 'name', ignoreDuplicates: false })
    .select();

  if (error) {
    console.error('Menu upsert error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    success: true,
    upserted: data.length,
    parseErrors,
  });
}

// Handle quoted fields with commas inside
function splitCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}
