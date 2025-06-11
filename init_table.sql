CREATE DATABASE IF NOT EXISTS site_db;

CREATE TABLE IF NOT EXISTS `User` (
    `userId` INT NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(255),
    `prenom` VARCHAR(255),
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `isAdmin` BOOLEAN NOT NULL,
    PRIMARY KEY (`userId`),
    UNIQUE KEY `email_unique` (`email`)
)

