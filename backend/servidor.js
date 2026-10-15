// Responsabilidad: Encender el servidor y conectar las piezas (CORS, JSON, imágenes y rutas).
import express from "express";
import cors from "cors";
import rutasArticulos from "./rutasArticulos.js"
import {CARPETA_IMAGENES}   from "./subirImagen.js"

const aplicacion = express();
const PUERTO = 3000

aplicacion.use(cors());
aplicacion.use(express.json());
aplicacion.use("/uploads", express.static(CARPETA_IMAGENES));
aplicacion.use("/api/articulos", rutasArticulos);

// Errores de multer (archivo demasiado grande, etc.)
aplicacion.use((error, peticion, respuesta, siguiente) =>{
    const mensaje = error.code === "LIMIT_FILE_SIZE"
    ? "La imagen es demasiado pesada (máximo 2 MB)"
    : error.message
    respuesta.status(400).json({error: mensaje})
    })

    aplicacion.listen(PUERTO, () => console.log(`Servidor corriendo en http://localhost:${PUERTO}`))
