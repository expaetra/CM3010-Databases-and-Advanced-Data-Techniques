-- #------------------ MY CODE --------------------#
-- Create a web user with appropriate privileges (read-only)

DROP USER IF EXISTS 'web_user'@'%';
CREATE USER 'web_user'@'%'
IDENTIFIED BY 'web_password';

GRANT SELECT ON croatian_tourism.* TO 'web_user'@'%';


FLUSH PRIVILEGES;
