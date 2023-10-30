-- create the databases
CREATE DATABASE IF NOT EXISTS cookme-app;
-- create the users for each database
CREATE USER 'localtest'@'%' IDENTIFIED BY 'localtest';
GRANT CREATE, ALTER, INDEX, LOCK TABLES, REFERENCES, UPDATE, DELETE, DROP, SELECT, INSERT ON `cookme-app`.* TO 'localtest'@'%';
FLUSH PRIVILEGES;