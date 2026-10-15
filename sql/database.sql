CREATE DATABASE IF NOT EXISTS tienda CHARACTER SET utf8mb4;
USE tienda;

CREATE TABLE IF NOT EXISTS articulos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    descripcion TEXT,
    precio_compra DECIMAL(10, 2),
    precio_venta DECIMAL(10, 2),
    stock minimo INT DEFAULT 0,
    stock maximo INT DEFAULT 0,
    imagen VARCHAR(255) -- Almacen sólo la ruta por ejemplo /uploads/010000008.png
);