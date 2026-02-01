-- StyloFit Database Setup Script
CREATE DATABASE IF NOT EXISTS stylofit_db;

USE stylofit_db;

-- Create user (optional, you can use root)
-- CREATE USER 'stylofit_user'@'localhost' IDENTIFIED BY 'stylofit123';
-- GRANT ALL PRIVILEGES ON stylofit_db.* TO 'stylofit_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Tables will be auto-created by Spring Boot JPA
SELECT 'StyloFit Database Ready!' as Status;