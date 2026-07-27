USE savor2004;

-- Add is_admin column (safe version)
ALTER TABLE users ADD COLUMN is_admin TINYINT(1) DEFAULT 0;

-- Create admin user
INSERT INTO users (username, email, password, is_admin)
VALUES (
  'admin',
  'admin@savorsphere.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaJOW05VSfKXWl6AK3E5b3lFa',
  1
) ON DUPLICATE KEY UPDATE is_admin = 1;

UPDATE users 
SET password = '$2b$12$UuzAYJ5ZDrkLY/zPN/BWfOe4yfXc5dSunu3YK.irZgSljeP6ucJNe'
WHERE email = 'admin@savorsphere.com';