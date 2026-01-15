-- Insert main categories
INSERT INTO categories (name, slug, description, image_url, display_order) VALUES
('Living Room', 'living-room', 'Sofas, armchairs, TV units and more', '/placeholder.svg?height=400&width=600', 1),
('Bedroom', 'bedroom', 'Beds, wardrobes, mattresses and bedroom furniture', '/placeholder.svg?height=400&width=600', 2),
('Kitchen & Dining', 'kitchen-dining', 'Tables, chairs, kitchen cabinets and dining essentials', '/placeholder.svg?height=400&width=600', 3),
('Office', 'office', 'Desks, office chairs, and storage solutions', '/placeholder.svg?height=400&width=600', 4),
('Outdoor', 'outdoor', 'Garden furniture and outdoor living', '/placeholder.svg?height=400&width=600', 5),
('Storage', 'storage', 'Shelving, cabinets and storage solutions', '/placeholder.svg?height=400&width=600', 6),
('Lighting', 'lighting', 'Lamps, ceiling lights and smart lighting', '/placeholder.svg?height=400&width=600', 7),
('Textiles', 'textiles', 'Curtains, rugs, cushions and bed linen', '/placeholder.svg?height=400&width=600', 8),
('Decoration', 'decoration', 'Vases, frames, mirrors and home accessories', '/placeholder.svg?height=400&width=600', 9),
('Children', 'children', 'Kids furniture, toys and accessories', '/placeholder.svg?height=400&width=600', 10);

-- Get category IDs for subcategories
DO $$
DECLARE
  living_room_id UUID;
  bedroom_id UUID;
  kitchen_id UUID;
  office_id UUID;
BEGIN
  SELECT id INTO living_room_id FROM categories WHERE slug = 'living-room';
  SELECT id INTO bedroom_id FROM categories WHERE slug = 'bedroom';
  SELECT id INTO kitchen_id FROM categories WHERE slug = 'kitchen-dining';
  SELECT id INTO office_id FROM categories WHERE slug = 'office';

  -- Living room subcategories
  INSERT INTO categories (name, slug, parent_id, display_order) VALUES
  ('Sofas & Armchairs', 'sofas-armchairs', living_room_id, 1),
  ('TV & Media Furniture', 'tv-media', living_room_id, 2),
  ('Coffee Tables', 'coffee-tables', living_room_id, 3),
  ('Bookcases & Shelving', 'bookcases-shelving', living_room_id, 4);

  -- Bedroom subcategories
  INSERT INTO categories (name, slug, parent_id, display_order) VALUES
  ('Beds & Mattresses', 'beds-mattresses', bedroom_id, 1),
  ('Wardrobes', 'wardrobes', bedroom_id, 2),
  ('Chest of Drawers', 'chest-drawers', bedroom_id, 3),
  ('Bedside Tables', 'bedside-tables', bedroom_id, 4);

  -- Kitchen subcategories
  INSERT INTO categories (name, slug, parent_id, display_order) VALUES
  ('Dining Tables', 'dining-tables', kitchen_id, 1),
  ('Dining Chairs', 'dining-chairs', kitchen_id, 2),
  ('Kitchen Cabinets', 'kitchen-cabinets', kitchen_id, 3),
  ('Bar Stools', 'bar-stools', kitchen_id, 4);

  -- Office subcategories
  INSERT INTO categories (name, slug, parent_id, display_order) VALUES
  ('Desks', 'desks', office_id, 1),
  ('Office Chairs', 'office-chairs', office_id, 2),
  ('Filing & Storage', 'filing-storage', office_id, 3);
END $$;
