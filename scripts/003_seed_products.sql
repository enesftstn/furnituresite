-- Insert products (realistic IKEA-style furniture)
DO $$
DECLARE
  sofas_cat_id UUID;
  beds_cat_id UUID;
  tables_cat_id UUID;
  desks_cat_id UUID;
  office_chairs_cat_id UUID;
  lighting_cat_id UUID;
  storage_cat_id UUID;
BEGIN
  SELECT id INTO sofas_cat_id FROM categories WHERE slug = 'sofas-armchairs';
  SELECT id INTO beds_cat_id FROM categories WHERE slug = 'beds-mattresses';
  SELECT id INTO tables_cat_id FROM categories WHERE slug = 'dining-tables';
  SELECT id INTO desks_cat_id FROM categories WHERE slug = 'desks';
  SELECT id INTO office_chairs_cat_id FROM categories WHERE slug = 'office-chairs';
  SELECT id INTO lighting_cat_id FROM categories WHERE slug = 'lighting';
  SELECT id INTO storage_cat_id FROM categories WHERE slug = 'storage';

  -- Sofas & Living Room
  INSERT INTO products (name, slug, sku, description, price, original_price, category_id, dimensions, material, color, stock_quantity, is_featured, rating, review_count) VALUES
  ('KLIPPAN 2-seat sofa', 'klippan-2-seat-sofa-grey', 'SOF-001-GRY', 'Compact 2-seat sofa with removable, machine-washable cover. Perfect for small spaces.', 4999.00, NULL, sofas_cat_id, '180x88x66 cm', 'Fabric, Foam, Wood', 'Grey', 45, true, 4.5, 234),
  ('EKTORP 3-seat sofa', 'ektorp-3-seat-sofa-beige', 'SOF-002-BEG', 'Timeless design with generous seating. Removable covers available in various colors.', 8999.00, NULL, sofas_cat_id, '218x88x88 cm', 'Fabric, Polyester, Wood', 'Beige', 32, true, 4.7, 567),
  ('SÖDERHAMN sectional sofa', 'soderhamn-sectional-blue', 'SOF-003-BLU', 'Modular sofa system with low armrests and deep seats for ultimate comfort.', 15999.00, 17999.00, sofas_cat_id, '291x99x83 cm', 'Fabric, Foam, Wood', 'Blue', 18, true, 4.6, 189),
  ('VIMLE corner sofa', 'vimle-corner-sofa-anthracite', 'SOF-004-ANT', '5-seat corner sofa with generous dimensions and soft, supportive cushions.', 18999.00, NULL, sofas_cat_id, '252x98x82 cm', 'Fabric, Polyester, Wood', 'Anthracite', 12, false, 4.8, 423),
  
  -- Beds & Bedroom
  ('MALM bed frame', 'malm-bed-frame-white', 'BED-001-WHT', 'High bed frame with 4 storage boxes. Classic design that never goes out of style.', 5999.00, NULL, beds_cat_id, '209x105x38 cm', 'Particleboard, Foil', 'White', 56, true, 4.4, 892),
  ('HEMNES bed frame', 'hemnes-bed-frame-black', 'BED-002-BLK', 'Solid wood bed with traditional details. Coordinates with other HEMNES furniture.', 7999.00, NULL, beds_cat_id, '211x106x120 cm', 'Solid Pine, Stain', 'Black-brown', 28, false, 4.6, 456),
  ('BRIMNES bed frame with storage', 'brimnes-bed-storage-grey', 'BED-003-GRY', 'Bed frame with 4 large drawers for extra storage space under the bed.', 8499.00, 9999.00, beds_cat_id, '209x104x47 cm', 'Particleboard, Foil, Plastic', 'Grey', 34, true, 4.5, 678),
  ('TARVA bed frame', 'tarva-bed-frame-pine', 'BED-004-PIN', 'Untreated solid pine that you can personalize by staining, painting or waxing.', 2999.00, NULL, beds_cat_id, '206x96x92 cm', 'Solid Pine', 'Natural', 67, false, 4.3, 234),

  -- Dining Tables
  ('EKEDALEN extendable table', 'ekedalen-table-oak', 'TAB-001-OAK', 'Extendable dining table seats 4-6. Smooth gliding mechanism.', 6999.00, NULL, tables_cat_id, '120/180x80x75 cm', 'Oak Veneer, Solid Oak', 'Oak', 42, true, 4.7, 543),
  ('INGATORP extendable table', 'ingatorp-table-white', 'TAB-002-WHT', 'Traditional design with smooth gliding mechanism. Seats 4-6 people.', 5499.00, NULL, tables_cat_id, '110/155x78x74 cm', 'Particleboard, Foil', 'White', 38, false, 4.5, 367),
  ('MÖRBYLÅNGA table', 'morbylanga-table-oak', 'TAB-003-OAK', 'Veneer table top with characteristic wood pattern. Seats 6-8 people.', 9999.00, 11999.00, tables_cat_id, '220x100x74 cm', 'Oak Veneer, Solid Oak', 'Oak', 15, true, 4.8, 234),
  ('LISABO table', 'lisabo-table-ash', 'TAB-004-ASH', 'Ash veneer gives a warm natural feeling. Clean design inspired by Scandinavian craft.', 4999.00, NULL, tables_cat_id, '140x78x74 cm', 'Ash Veneer, Solid Ash', 'Ash', 52, false, 4.4, 189),

  -- Desks & Office
  ('MICKE desk', 'micke-desk-white', 'DSK-001-WHT', 'Compact desk with built-in cable management. Perfect for small spaces.', 1299.00, NULL, desks_cat_id, '142x50x75 cm', 'Particleboard, Foil, ABS plastic', 'White', 89, true, 4.3, 1234),
  ('BEKANT desk', 'bekant-desk-black', 'DSK-002-BLK', 'Spacious desk with T-legs. Cable management keeps cables organized.', 3499.00, NULL, desks_cat_id, '160x80x75 cm', 'Particleboard, Plastic, Steel', 'Black', 45, true, 4.6, 789),
  ('ALEX desk', 'alex-desk-grey', 'DSK-003-GRY', 'Desk with drawers for organizing papers and office supplies.', 2999.00, NULL, desks_cat_id, '131x60x76 cm', 'Particleboard, Foil, Plastic', 'Grey', 67, false, 4.5, 543),
  ('IDÅSEN desk', 'idasen-desk-brown', 'DSK-004-BRN', 'Desk with practical adjustable height. Can be used sitting or standing.', 7999.00, 8999.00, desks_cat_id, '160x80x65-85 cm', 'Particleboard, Veneer, Steel', 'Brown', 23, true, 4.7, 345),

  -- Office Chairs
  ('MARKUS office chair', 'markus-chair-black', 'CHR-001-BLK', 'High back provides great support for your neck. Adjustable seat height.', 1999.00, NULL, office_chairs_cat_id, '62x60x129-140 cm', 'Fabric, Foam, Aluminum', 'Black', 78, true, 4.5, 2341),
  ('JÄRVFJÄLLET office chair', 'jarvfjallet-chair-grey', 'CHR-002-GRY', 'Comfortable office chair with adjustable lumbar support and armrests.', 2499.00, NULL, office_chairs_cat_id, '68x68x110-120 cm', 'Fabric, Foam, Plastic', 'Grey', 56, true, 4.6, 876),
  ('HATTEFJÄLL office chair', 'hattefjall-chair-beige', 'CHR-003-BEG', 'Extra comfortable with soft curved shape and adjustable tilt tension.', 1799.00, NULL, office_chairs_cat_id, '68x68x110-120 cm', 'Fabric, Foam, Aluminum', 'Beige', 92, false, 4.4, 456),
  ('FLINTAN office chair', 'flintan-chair-black', 'CHR-004-BLK', 'Affordable office chair with adjustable seat height and swivel function.', 899.00, NULL, office_chairs_cat_id, '67x67x90-102 cm', 'Fabric, Foam, Steel', 'Black', 134, true, 4.2, 1678),

  -- Storage & Organization
  ('KALLAX shelving unit', 'kallax-shelf-white', 'STO-001-WHT', 'Square shelving unit that you can use horizontally or vertically. Add boxes for hidden storage.', 1299.00, NULL, storage_cat_id, '147x147x39 cm', 'Particleboard, Foil, Paper', 'White', 156, true, 4.6, 3456),
  ('BILLY bookcase', 'billy-bookcase-white', 'STO-002-WHT', 'Classic bookcase with adjustable shelves. Can be extended with height extension.', 999.00, NULL, storage_cat_id, '80x28x202 cm', 'Particleboard, Foil, Paper', 'White', 234, true, 4.5, 5678),
  ('IVAR storage unit', 'ivar-storage-pine', 'STO-003-PIN', 'Untreated solid pine that you can personalize. Combine with other IVAR products.', 2499.00, NULL, storage_cat_id, '89x50x179 cm', 'Solid Pine', 'Natural', 67, false, 4.4, 789),
  ('EKET cabinet combination', 'eket-cabinet-grey', 'STO-004-GRY', 'Asymmetrical storage solution with doors and open compartments.', 3999.00, 4499.00, storage_cat_id, '175x70x35 cm', 'Particleboard, Foil, Plastic', 'Grey', 43, true, 4.6, 567),

  -- Lighting
  ('TERTIAL work lamp', 'tertial-lamp-grey', 'LMP-001-GRY', 'Adjustable work lamp with flexible arm. Directed light perfect for reading.', 199.00, NULL, lighting_cat_id, '17x12x72 cm', 'Steel, Aluminum', 'Grey', 456, true, 4.3, 2345),
  ('RANARP pendant lamp', 'ranarp-pendant-black', 'LMP-002-BLK', 'Pendant lamp with industrial style. Provides good directed light over dining table.', 499.00, NULL, lighting_cat_id, 'Ø38 cm', 'Steel, Powder coating', 'Black', 123, false, 4.5, 678),
  ('HEKTAR floor lamp', 'hektar-floor-grey', 'LMP-003-GRY', 'Floor lamp with adjustable head. Provides good directed light for reading.', 899.00, NULL, lighting_cat_id, '155 cm', 'Steel, Powder coating', 'Grey', 89, true, 4.6, 456),
  ('NOT floor lamp', 'not-floor-white', 'LMP-004-WHT', 'Simple floor lamp with tripod base. Provides both ambient and reading light.', 299.00, NULL, lighting_cat_id, '175 cm', 'Steel, Plastic, Fabric', 'White', 267, true, 4.2, 1234);

END $$;
