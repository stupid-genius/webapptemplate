CREATE DATABASE IF NOT EXISTS WEBAPPTEMPLATE;

-- change to % if you want to allow remote access
CREATE USER IF NOT EXISTS 'admin'@'localhost' IDENTIFIED BY 'correcthorsebatterystaple';
GRANT ALL PRIVILEGES ON *.* TO 'admin'@'localhost' WITH GRANT OPTION;
