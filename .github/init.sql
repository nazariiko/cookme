-- create the databases
CREATE DATABASE IF NOT EXISTS ${{ secrets.DBNAME }};
-- create the users for each database
CREATE USER '${{ secrets.DBUSER }}'@'%' IDENTIFIED BY '${{ secrets.DBPASSWORD }}';
GRANT CREATE, ALTER, INDEX, LOCK TABLES, REFERENCES, UPDATE, DELETE, DROP, SELECT, INSERT ON `cookme-app`.* TO 'localtest'@'%';
FLUSH PRIVILEGES;