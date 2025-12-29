-- Create restricted user for the web application
CREATE USER IF NOT EXISTS 'web_user'@'localhost'
IDENTIFIED BY 'web_password';

-- Grant read-only access
GRANT SELECT ON croatian_tourism.* TO 'web_user'@'localhost';

FLUSH PRIVILEGES;
