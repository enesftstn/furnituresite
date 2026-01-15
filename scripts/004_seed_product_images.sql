-- Add product images
DO $$
DECLARE
  product_record RECORD;
BEGIN
  FOR product_record IN SELECT id, name, color FROM products LOOP
    -- Add primary image
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order)
    VALUES (
      product_record.id,
      '/placeholder.svg?height=600&width=600&query=' || REPLACE(product_record.name, ' ', '+') || '+' || COALESCE(product_record.color, 'furniture'),
      product_record.name || ' - Front view',
      true,
      1
    );
    
    -- Add 2-3 additional images
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order)
    VALUES (
      product_record.id,
      '/placeholder.svg?height=600&width=600&query=' || REPLACE(product_record.name, ' ', '+') || '+side+view',
      product_record.name || ' - Side view',
      false,
      2
    );
    
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order)
    VALUES (
      product_record.id,
      '/placeholder.svg?height=600&width=600&query=' || REPLACE(product_record.name, ' ', '+') || '+detail',
      product_record.name || ' - Detail',
      false,
      3
    );
  END LOOP;
END $$;
