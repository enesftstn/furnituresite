-- Add is_admin column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin) WHERE is_admin = TRUE;

-- Set yourself as admin (replace with your email)
UPDATE users SET is_admin = TRUE WHERE email = 'your-email@example.com';

-- Update RLS policies to check admin status
DROP POLICY IF EXISTS "Admins can view all users" ON users;
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (auth.uid() = id OR (SELECT is_admin FROM users WHERE id = auth.uid()));
