'use client';

import { useState, useEffect } from 'react';
import { fetchMenu, submitOrder } from '../lib/supabase';

const CATEGORY_ICONS = {
  'Veg Pizza': '🍕', 'Non-Veg Pizza': '🍕', 'Pizza Rolls': '🌯',
  'Bhutanese': '🍲', 'Fried Rice': '🍚', 'Chowmein': '🍜',
  'Thukpa': '🍜', 'Fried Chicken': '🍗', 'Momos': '🥟',
  'Milkshakes': '🥤', 'Boba Tea': '🧋', 'Mocktails': '🍹',
  'Drinks': '🥤', Default: '🍽️',
};

const MOCK_MENU = [
  // ── Veg Pizza ─────────────────────────────────────────────
  { id: 'margarita-pizza-s', loyverse_item_id: 'margarita-pizza(s)', name: 'Margarita Pizza (S)', description: 'Classic tomato base with mozzarella', category: 'Veg Pizza', price: 240, image_url: null, is_available: true },
  { id: 'margarita-pizza-m', loyverse_item_id: 'margarita-pizza(m)', name: 'Margarita Pizza (M)', description: 'Classic tomato base with mozzarella', category: 'Veg Pizza', price: 290, image_url: null, is_available: true },
  { id: 'margarita-pizza-l', loyverse_item_id: 'margarita-pizza(l)', name: 'Margarita Pizza (L)', description: 'Classic tomato base with mozzarella', category: 'Veg Pizza', price: 380, image_url: null, is_available: true },
  { id: 'garden-fresh-s', loyverse_item_id: 'farmhouse-pizza(s)', name: 'Garden Fresh Pizza (S)', description: 'Fresh garden vegetables on tomato base', category: 'Veg Pizza', price: 230, image_url: null, is_available: true },
  { id: 'garden-fresh-m', loyverse_item_id: 'farmhouse-pizza(m)', name: 'Garden Fresh Pizza (M)', description: 'Fresh garden vegetables on tomato base', category: 'Veg Pizza', price: 290, image_url: null, is_available: true },
  { id: 'garden-fresh-l', loyverse_item_id: 'farmhouse-pizza(l)', name: 'Garden Fresh Pizza (L)', description: 'Fresh garden vegetables on tomato base', category: 'Veg Pizza', price: 380, image_url: null, is_available: true },
  { id: 'fireball-s', loyverse_item_id: 'fireball-pizza(s)', name: 'Fireball Pizza (S)', description: 'Spicy tomato base with chilli kick', category: 'Veg Pizza', price: 240, image_url: null, is_available: true },
  { id: 'fireball-m', loyverse_item_id: 'fireball-pizza(m)', name: 'Fireball Pizza (M)', description: 'Spicy tomato base with chilli kick', category: 'Veg Pizza', price: 290, image_url: null, is_available: true },
  { id: 'fireball-l', loyverse_item_id: 'fireball-pizza-(l)', name: 'Fireball Pizza (L)', description: 'Spicy tomato base with chilli kick', category: 'Veg Pizza', price: 380, image_url: null, is_available: true },
  { id: 'garlic-pizza-s', loyverse_item_id: 'garlic-pizza(s)', name: 'Garlic Pizza (S)', description: 'Roasted garlic and herbs', category: 'Veg Pizza', price: 240, image_url: null, is_available: true },
  { id: 'garlic-pizza-m', loyverse_item_id: 'garlic-pizza', name: 'Garlic Pizza (M)', description: 'Roasted garlic and herbs', category: 'Veg Pizza', price: 290, image_url: null, is_available: true },
  { id: 'garlic-pizza-l', loyverse_item_id: 'garlic-pizza(l)', name: 'Garlic Pizza (L)', description: 'Roasted garlic and herbs', category: 'Veg Pizza', price: 380, image_url: null, is_available: true },
  { id: 'mushroom-s', loyverse_item_id: 'mushroom-pizza(s)', name: 'Mushroom Pizza (S)', description: 'Loaded with fresh mushrooms', category: 'Veg Pizza', price: 240, image_url: null, is_available: true },
  { id: 'mushroom-m', loyverse_item_id: 'mushroom(m)', name: 'Mushroom Pizza (M)', description: 'Loaded with fresh mushrooms', category: 'Veg Pizza', price: 290, image_url: null, is_available: true },
  { id: 'mushroom-l', loyverse_item_id: 'mushroom-pizza(l)', name: 'Mushroom Pizza (L)', description: 'Loaded with fresh mushrooms', category: 'Veg Pizza', price: 380, image_url: null, is_available: true },
  { id: 'paneer-s', loyverse_item_id: 'paneer-pizza(s)', name: 'Paneer Pizza (S)', description: 'Cottage cheese with peppers', category: 'Veg Pizza', price: 240, image_url: null, is_available: true },
  { id: 'paneer-m', loyverse_item_id: 'paneer-pizza(m)', name: 'Paneer Pizza (M)', description: 'Cottage cheese with peppers', category: 'Veg Pizza', price: 290, image_url: null, is_available: true },
  { id: 'paneer-l', loyverse_item_id: 'paneer-pizza(l)', name: 'Paneer Pizza (L)', description: 'Cottage cheese with peppers', category: 'Veg Pizza', price: 380, image_url: null, is_available: true },
  { id: 'plain-cheese-s', loyverse_item_id: 'plain-cheese-pizza(s)', name: 'Plain Cheese Pizza (S)', description: 'Simple and cheesy', category: 'Veg Pizza', price: 240, image_url: null, is_available: true },
  { id: 'plain-cheese-m', loyverse_item_id: 'plain-cheese-pizza', name: 'Plain Cheese Pizza (M)', description: 'Simple and cheesy', category: 'Veg Pizza', price: 290, image_url: null, is_available: true },
  { id: 'plain-cheese-l', loyverse_item_id: 'plain-cheese-pizza(l)', name: 'Plain Cheese Pizza (L)', description: 'Simple and cheesy', category: 'Veg Pizza', price: 380, image_url: null, is_available: true },
  { id: 'double-cheese-s', loyverse_item_id: 'double-cheese-pizza-(s)', name: 'Double Cheese Pizza (S)', description: 'Extra cheese for extra love', category: 'Veg Pizza', price: 270, image_url: null, is_available: true },
  { id: 'double-cheese-m', loyverse_item_id: 'double-cheese-pizza(m)', name: 'Double Cheese Pizza (M)', description: 'Extra cheese for extra love', category: 'Veg Pizza', price: 340, image_url: null, is_available: true },
  { id: 'double-cheese-l', loyverse_item_id: 'double-cheese-pizza(l)', name: 'Double Cheese Pizza (L)', description: 'Extra cheese for extra love', category: 'Veg Pizza', price: 430, image_url: null, is_available: true },

  // ── Non-Veg Pizza ─────────────────────────────────────────
  { id: 'beef-pizza-s', loyverse_item_id: 'shakam-pizza(s)', name: 'Beef Pizza (S)', description: 'Tender beef with mozzarella', category: 'Non-Veg Pizza', price: 250, image_url: null, is_available: true },
  { id: 'beef-pizza-m', loyverse_item_id: 'shakam-pizza(m)', name: 'Beef Pizza (M)', description: 'Tender beef with mozzarella', category: 'Non-Veg Pizza', price: 320, image_url: null, is_available: true },
  { id: 'beef-pizza-l', loyverse_item_id: 'shakam-pizza(l)', name: 'Beef Pizza (L)', description: 'Tender beef with mozzarella', category: 'Non-Veg Pizza', price: 400, image_url: null, is_available: true },
  { id: 'pork-pizza-s', loyverse_item_id: 'pork-pizza(s)', name: 'Pork Pizza (S)', description: 'Juicy pork with mozzarella', category: 'Non-Veg Pizza', price: 250, image_url: null, is_available: true },
  { id: 'pork-pizza-m', loyverse_item_id: 'pork-pizza(m)', name: 'Pork Pizza (M)', description: 'Juicy pork with mozzarella', category: 'Non-Veg Pizza', price: 320, image_url: null, is_available: true },
  { id: 'pork-pizza-l', loyverse_item_id: 'pork-pizza(l)', name: 'Pork Pizza (L)', description: 'Juicy pork with mozzarella', category: 'Non-Veg Pizza', price: 400, image_url: null, is_available: true },
  { id: 'chicken-pizza-s', loyverse_item_id: 'chicken-pizza-(s)', name: 'Chicken Pizza (S)', description: 'Grilled chicken with mozzarella', category: 'Non-Veg Pizza', price: 250, image_url: null, is_available: true },
  { id: 'chicken-pizza-m', loyverse_item_id: 'chicken-pizza-(m)', name: 'Chicken Pizza (M)', description: 'Grilled chicken with mozzarella', category: 'Non-Veg Pizza', price: 320, image_url: null, is_available: true },
  { id: 'chicken-pizza-l', loyverse_item_id: 'chicken-pizza(l)', name: 'Chicken Pizza (L)', description: 'Grilled chicken with mozzarella', category: 'Non-Veg Pizza', price: 400, image_url: null, is_available: true },
  { id: 'meat-lover-s', loyverse_item_id: 'meat-lover-pizza(s)', name: 'Meat Lover Pizza (S)', description: 'Loaded with mixed meats', category: 'Non-Veg Pizza', price: 250, image_url: null, is_available: true },
  { id: 'meat-lover-m', loyverse_item_id: 'meat-lover-pizza(m)', name: 'Meat Lover Pizza (M)', description: 'Loaded with mixed meats', category: 'Non-Veg Pizza', price: 320, image_url: null, is_available: true },
  { id: 'meat-lover-l', loyverse_item_id: 'meat-lover-pizza(l)', name: 'Meat Lover Pizza (L)', description: 'Loaded with mixed meats', category: 'Non-Veg Pizza', price: 400, image_url: null, is_available: true },
  { id: 'tuna-s', loyverse_item_id: 'tuna-pizza(s)', name: 'Tuna Pizza (S)', description: 'Tuna with sweet corn and mozzarella', category: 'Non-Veg Pizza', price: 250, image_url: null, is_available: true },
  { id: 'tuna-m', loyverse_item_id: 'tuna(m)', name: 'Tuna Pizza (M)', description: 'Tuna with sweet corn and mozzarella', category: 'Non-Veg Pizza', price: 320, image_url: null, is_available: true },
  { id: 'tuna-l', loyverse_item_id: 'tuna-pizza(l)', name: 'Tuna Pizza (L)', description: 'Tuna with sweet corn and mozzarella', category: 'Non-Veg Pizza', price: 400, image_url: null, is_available: true },

  // ── Pizza Rolls ───────────────────────────────────────────
  { id: 'beef-roll', loyverse_item_id: 'shakam-pizza-roll', name: 'Beef Pizza Roll', description: 'Rolled pizza filled with beef', category: 'Pizza Rolls', price: 450, image_url: null, is_available: true },
  { id: 'pork-roll', loyverse_item_id: 'pork-pizza-roll', name: 'Pork Pizza Roll', description: 'Rolled pizza filled with pork', category: 'Pizza Rolls', price: 450, image_url: null, is_available: true },
  { id: 'chicken-roll', loyverse_item_id: 'chicken-pizza-roll', name: 'Chicken Pizza Roll', description: 'Rolled pizza filled with chicken', category: 'Pizza Rolls', price: 450, image_url: null, is_available: true },
  { id: 'meat-lover-roll', loyverse_item_id: 'meat-lover-pizza-roll', name: 'Meat Lover Pizza Roll', description: 'Rolled pizza loaded with mixed meats', category: 'Pizza Rolls', price: 450, image_url: null, is_available: true },
  { id: 'egg-roll', loyverse_item_id: 'egg-pizza-roll', name: 'Egg Pizza Roll', description: 'Rolled pizza filled with egg', category: 'Pizza Rolls', price: 400, image_url: null, is_available: true },
  { id: 'farmhouse-roll', loyverse_item_id: 'farmhouse-pizza-roll', name: 'Farmhouse Pizza Roll', description: 'Rolled pizza with garden vegetables', category: 'Pizza Rolls', price: 400, image_url: null, is_available: true },
  { id: 'mushroom-roll', loyverse_item_id: 'mushroom-pizza-roll', name: 'Mushroom Pizza Roll', description: 'Rolled pizza filled with mushrooms', category: 'Pizza Rolls', price: 400, image_url: null, is_available: true },

  // ── Bhutanese ─────────────────────────────────────────────
  { id: 'ema-datshi-rice', loyverse_item_id: 'ema-datshi-with-rice-1', name: 'Ema Datshi with Rice', description: "Bhutan's iconic chilli & cheese dish with steamed rice", category: 'Bhutanese', price: 150, image_url: null, is_available: true },
  { id: 'shakam-datshi-rice', loyverse_item_id: 'shakam-datshi-with-rice', name: 'Shakam Datshi with Rice', description: 'Dried beef with chilli cheese and rice', category: 'Bhutanese', price: 220, image_url: null, is_available: true },
  { id: 'beef-datshi-rice', loyverse_item_id: 'beef-datshi-with-rice', name: 'Beef Datshi with Rice', description: 'Beef with chilli cheese and rice', category: 'Bhutanese', price: 250, image_url: null, is_available: true },
  { id: 'pork-datshi-rice', loyverse_item_id: 'pork-datshi-with-rice', name: 'Pork Datshi with Rice', description: 'Pork with chilli cheese and rice', category: 'Bhutanese', price: 250, image_url: null, is_available: true },
  { id: 'jasha-maru-rice', loyverse_item_id: 'jasha-maru-with-rice', name: 'Jasha Maru with Rice', description: 'Minced chicken curry with rice', category: 'Bhutanese', price: 200, image_url: null, is_available: true },
  { id: 'kewa-datshi-rice', loyverse_item_id: 'kewa-datshi-with-rice', name: 'Kewa Datshi with Rice', description: 'Potato with chilli cheese and rice', category: 'Bhutanese', price: 150, image_url: null, is_available: true },
  { id: 'shamu-datshi-rice', loyverse_item_id: 'shamu-datshi-with-rice', name: 'Shamu Datshi with Rice', description: 'Mushroom with chilli cheese and rice', category: 'Bhutanese', price: 150, image_url: null, is_available: true },
  { id: 'beef-paa-rice', loyverse_item_id: 'beef-paa-with-rice', name: 'Beef Paa with Rice', description: 'Stir-fried beef with chillies and rice', category: 'Bhutanese', price: 220, image_url: null, is_available: true },
  { id: 'shakam-paa-rice', loyverse_item_id: 'shakam-paa-with-rice', name: 'Shakam Paa with Rice', description: 'Dried beef stir-fry with rice', category: 'Bhutanese', price: 220, image_url: null, is_available: true },

  // ── Fried Rice ────────────────────────────────────────────
  { id: 'beef-fr', loyverse_item_id: 'beef-fried-rice', name: 'Beef Fried Rice', description: 'Wok-tossed rice with beef', category: 'Fried Rice', price: 150, image_url: null, is_available: true },
  { id: 'pork-fr', loyverse_item_id: 'pork-fried-rice', name: 'Pork Fried Rice', description: 'Wok-tossed rice with pork', category: 'Fried Rice', price: 150, image_url: null, is_available: true },
  { id: 'chicken-fr', loyverse_item_id: 'chicken-fried-rice', name: 'Chicken Fried Rice', description: 'Wok-tossed rice with chicken', category: 'Fried Rice', price: 120, image_url: null, is_available: true },
  { id: 'egg-fr', loyverse_item_id: 'egg-fried-rice', name: 'Egg Fried Rice', description: 'Wok-tossed rice with egg', category: 'Fried Rice', price: 120, image_url: null, is_available: true },
  { id: 'veg-fr', loyverse_item_id: 'veg-fried-rice', name: 'Veg Fried Rice', description: 'Wok-tossed rice with fresh vegetables', category: 'Fried Rice', price: 100, image_url: null, is_available: true },
  { id: 'mix-fr', loyverse_item_id: 'mix-meat-fried-rice', name: 'Mix Meat Fried Rice', description: 'Wok-tossed rice with mixed meats', category: 'Fried Rice', price: 180, image_url: null, is_available: true },

  // ── Chowmein ──────────────────────────────────────────────
  { id: 'beef-cm', loyverse_item_id: 'beef-chowmein', name: 'Beef Chowmein', description: 'Stir-fried noodles with beef', category: 'Chowmein', price: 150, image_url: null, is_available: true },
  { id: 'pork-cm', loyverse_item_id: 'pork-chowmein', name: 'Pork Chowmein', description: 'Stir-fried noodles with pork', category: 'Chowmein', price: 150, image_url: null, is_available: true },
  { id: 'chicken-cm', loyverse_item_id: 'chicken-chowmein', name: 'Chicken Chowmein', description: 'Stir-fried noodles with chicken', category: 'Chowmein', price: 120, image_url: null, is_available: true },
  { id: 'egg-cm', loyverse_item_id: 'egg-chowmein', name: 'Egg Chowmein', description: 'Stir-fried noodles with egg', category: 'Chowmein', price: 120, image_url: null, is_available: true },
  { id: 'veg-cm', loyverse_item_id: 'veg-chowmein', name: 'Veg Chowmein', description: 'Stir-fried noodles with vegetables', category: 'Chowmein', price: 100, image_url: null, is_available: true },

  // ── Thukpa ────────────────────────────────────────────────
  { id: 'beef-tk', loyverse_item_id: 'beef-thukpa', name: 'Beef Thukpa', description: 'Hearty noodle soup with beef', category: 'Thukpa', price: 150, image_url: null, is_available: true },
  { id: 'pork-tk', loyverse_item_id: 'pork-thukpa', name: 'Pork Thukpa', description: 'Hearty noodle soup with pork', category: 'Thukpa', price: 150, image_url: null, is_available: true },
  { id: 'chicken-tk', loyverse_item_id: 'chicken-thukpa', name: 'Chicken Thukpa', description: 'Hearty noodle soup with chicken', category: 'Thukpa', price: 120, image_url: null, is_available: true },
  { id: 'veg-tk', loyverse_item_id: 'veg-thukpa', name: 'Veg Thukpa', description: 'Hearty vegetable noodle soup', category: 'Thukpa', price: 120, image_url: null, is_available: true },

  // ── Fried Chicken ─────────────────────────────────────────
  { id: 'hc2', loyverse_item_id: 'chicken-drumstick', name: 'Hot & Crispy 2pcs', description: 'Crispy fried chicken, 2 pieces', category: 'Fried Chicken', price: 190, image_url: null, is_available: true },
  { id: 'hc4', loyverse_item_id: 'hot&crispy-4pcs', name: 'Hot & Crispy 4pcs', description: 'Crispy fried chicken, 4 pieces', category: 'Fried Chicken', price: 360, image_url: null, is_available: true },
  { id: 'hc6', loyverse_item_id: 'hot&crispy-6pcs', name: 'Hot & Crispy 6pcs', description: 'Crispy fried chicken, 6 pieces', category: 'Fried Chicken', price: 525, image_url: null, is_available: true },
  { id: 'kfc2', loyverse_item_id: 'korean-fried-chicken[2pc]', name: 'Korean Fried Chicken 2pc', description: 'Korean-style crispy chicken, 2 pieces', category: 'Fried Chicken', price: 190, image_url: null, is_available: true },
  { id: 'kfc3', loyverse_item_id: 'kfc(3pcs)', name: 'Korean Fried Chicken 3pcs', description: 'Korean-style crispy chicken, 3 pieces', category: 'Fried Chicken', price: 260, image_url: null, is_available: true },
  { id: 'sfc2', loyverse_item_id: 'spicy-fried-chicken-2pcs', name: 'Spicy Fried Chicken 2pcs', description: 'Extra-spicy crispy chicken, 2 pieces', category: 'Fried Chicken', price: 220, image_url: null, is_available: true },
  { id: 'sfc3', loyverse_item_id: 'spicy-fried-chicken-3pcs', name: 'Spicy Fried Chicken 3pcs', description: 'Extra-spicy crispy chicken, 3 pieces', category: 'Fried Chicken', price: 290, image_url: null, is_available: true },

  // ── Momos ─────────────────────────────────────────────────
  { id: 'beef-momo', loyverse_item_id: 'beef-momo', name: 'Beef Momo', description: 'Steamed dumplings filled with beef', category: 'Momos', price: 80, image_url: null, is_available: true },
  { id: 'pork-momo', loyverse_item_id: 'pork-momo', name: 'Pork Momo', description: 'Steamed dumplings filled with pork', category: 'Momos', price: 100, image_url: null, is_available: true },
  { id: 'cheese-momo', loyverse_item_id: 'cheese-momo', name: 'Cheese Momo', description: 'Steamed dumplings filled with cheese', category: 'Momos', price: 60, image_url: null, is_available: true },
  { id: 'veg-momo', loyverse_item_id: 'veg-momo', name: 'Veg Momo', description: 'Steamed dumplings filled with vegetables', category: 'Momos', price: 50, image_url: null, is_available: true },

  // ── Milkshakes ────────────────────────────────────────────
  { id: 'apple-shake', loyverse_item_id: 'apple', name: 'Apple Shake', description: 'Fresh blended apple milkshake', category: 'Milkshakes', price: 150, image_url: null, is_available: true },
  { id: 'blueberry-shake', loyverse_item_id: 'blueberry-shake', name: 'Blueberry Shake', description: 'Fresh blended blueberry milkshake', category: 'Milkshakes', price: 120, image_url: null, is_available: true },
  { id: 'chocolate-shake', loyverse_item_id: 'chocolate-shake', name: 'Chocolate Shake', description: 'Rich chocolate milkshake', category: 'Milkshakes', price: 150, image_url: null, is_available: true },
  { id: 'mango-shake', loyverse_item_id: 'mango-shake', name: 'Mango Shake', description: 'Fresh blended mango milkshake', category: 'Milkshakes', price: 150, image_url: null, is_available: true },
  { id: 'strawberry-shake', loyverse_item_id: 'strawberry', name: 'Strawberry Shake', description: 'Fresh blended strawberry milkshake', category: 'Milkshakes', price: 120, image_url: null, is_available: true },
  { id: 'kiwi-shake', loyverse_item_id: 'kiwi', name: 'Kiwi Shake', description: 'Fresh blended kiwi milkshake', category: 'Milkshakes', price: 150, image_url: null, is_available: true },

  // ── Boba Tea ─────────────────────────────────────────────
  { id: 'milktea-boba', loyverse_item_id: 'milk-tea-boba', name: 'Milk Tea Boba', description: 'Classic milk tea with tapioca pearls', category: 'Boba Tea', price: 150, image_url: null, is_available: true },
  { id: 'chocolate-boba', loyverse_item_id: 'chocolate-boba', name: 'Chocolate Boba', description: 'Chocolate drink with tapioca pearls', category: 'Boba Tea', price: 150, image_url: null, is_available: true },
  { id: 'strawberry-boba', loyverse_item_id: 'strawberry-boba', name: 'Strawberry Boba', description: 'Strawberry drink with tapioca pearls', category: 'Boba Tea', price: 150, image_url: null, is_available: true },
  { id: 'blueberry-boba', loyverse_item_id: 'blueberry-boba', name: 'Blueberry Boba', description: 'Blueberry drink with tapioca pearls', category: 'Boba Tea', price: 150, image_url: null, is_available: true },
  { id: 'butterscotch-boba', loyverse_item_id: 'butterscotch-boba', name: 'Butterscotch Boba', description: 'Butterscotch drink with tapioca pearls', category: 'Boba Tea', price: 150, image_url: null, is_available: true },

  // ── Mocktails ─────────────────────────────────────────────
  { id: 'virgin-mojito', loyverse_item_id: 'virgin-mojito', name: 'Virgin Mojito', description: 'Mint, lime and soda', category: 'Mocktails', price: 100, image_url: null, is_available: true },
  { id: 'blue-lagoon', loyverse_item_id: 'blue-lagoon', name: 'Blue Lagoon', description: 'Blue curacao syrup with lemonade', category: 'Mocktails', price: 120, image_url: null, is_available: true },
  { id: 'fruit-punch', loyverse_item_id: 'fruit-punch-mocktail', name: 'Fruit Punch', description: 'Mixed tropical fruit punch', category: 'Mocktails', price: 120, image_url: null, is_available: true },
  { id: 'cinderella', loyverse_item_id: 'cinderella-mocktail', name: 'Cinderella', description: 'Pineapple, orange and lemon blend', category: 'Mocktails', price: 120, image_url: null, is_available: true },
  { id: 'tropical', loyverse_item_id: 'tropical-mocktail', name: 'Tropical Mocktail', description: 'Refreshing tropical fruit blend', category: 'Mocktails', price: 120, image_url: null, is_available: true },
  { id: 'coconut-mocktail', loyverse_item_id: 'coconut-water-mocktail', name: 'Coconut Water Mocktail', description: 'Fresh coconut water blend', category: 'Mocktails', price: 100, image_url: null, is_available: true },

  // ── Drinks ────────────────────────────────────────────────
  { id: 'coke-300', loyverse_item_id: 'coke-300ml', name: 'Coke 300ml', description: 'Chilled Coca-Cola 300ml', category: 'Drinks', price: 25, image_url: null, is_available: true },
  { id: 'coke-500', loyverse_item_id: 'coke-500ml', name: 'Coke 500ml', description: 'Chilled Coca-Cola 500ml', category: 'Drinks', price: 35, image_url: null, is_available: true },
  { id: 'sprite-300', loyverse_item_id: 'sprite-300ml', name: 'Sprite 300ml', description: 'Chilled Sprite 300ml', category: 'Drinks', price: 25, image_url: null, is_available: true },
  { id: 'fanta-300', loyverse_item_id: 'fantastic-300ml', name: 'Fanta 300ml', description: 'Chilled Fanta 300ml', category: 'Drinks', price: 25, image_url: null, is_available: true },
  { id: 'water-500', loyverse_item_id: 'water-500ml', name: 'Water 500ml', description: 'Mineral water 500ml', category: 'Drinks', price: 10, image_url: null, is_available: true },
  { id: 'tea-s', loyverse_item_id: 'tea-s', name: 'Tea (Small)', description: 'Hot brewed tea', category: 'Drinks', price: 20, image_url: null, is_available: true },
  { id: 'tea-b', loyverse_item_id: 'tea-b', name: 'Tea (Big)', description: 'Hot brewed tea, large', category: 'Drinks', price: 40, image_url: null, is_available: true },
  { id: 'black-coffee-s', loyverse_item_id: 'black-coffee', name: 'Black Coffee (Small)', description: 'Hot black coffee', category: 'Drinks', price: 20, image_url: null, is_available: true },
  { id: 'black-coffee-b', loyverse_item_id: 'black-coffee-1', name: 'Black Coffee (Big)', description: 'Hot black coffee, large', category: 'Drinks', price: 40, image_url: null, is_available: true },
  { id: 'milk-coffee', loyverse_item_id: 'milk-coffee', name: 'Milk Coffee', description: 'Coffee with steamed milk', category: 'Drinks', price: 50, image_url: null, is_available: true },
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
