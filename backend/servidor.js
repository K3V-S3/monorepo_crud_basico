// Responsabilidad: encender el servidor y conectar las piezas (CORS, JSON, imágenes y rutas).
import express from "express"
import cors from "cors"
import rutasArticulos from "./rutasArticulos.js"
import { CARPETA_IMAGENES } from "./subirImagen.js"

const aplicacion = express()
const PUERTO = 3000

aplicacion.use(cors())                                       // permite que React (puerto 5173) llame a este servidor
aplicacion.use(express.json())                               // entiende peticiones con cuerpo JSON
aplicacion.use("/uploads", express.static(CARPETA_IMAGENES)) // http://localhost:3000/uploads/foto.jpg muestra la imagen
aplicacion.use("/api/articulos", rutasArticulos)             // todas las rutas del CRUD

// Errores de multer (archivo demasiado grande, etc.)
aplicacion.use((error, peticion, respuesta, siguiente) => {
    const mensaje = error.code === "LIMIT_FILE_SIZE"
        ? "La imagen es demasiado pesada (máximo 2 MB)"
        : error.message
    respuesta.status(400).json({ error: mensaje })
})

aplicacion.listen(PUERTO, () => console.log(`Servidor listo en http://localhost:${PUERTO}`))