// Responsabilidad: recibir el archivo de la imagen y guardarlo en la carpeta uploads/.
// A MySQL solamente le llegará la RUTA (un texto), nunca el archivo.
import multer from "multer"
import path from "path"
import fs from "node:fs"
import { fileURLToPath } from "node:url"

const__dirname = path.dirname(fileURLToPath(import.meta.url))
export const CARPETA_IMAGENES = path.join(__dirname, "uploads")
fs.mkdirSync(CARPETA_IMAGENES, {recursive: true}) // Crea la carpeta en caso de que no exista

const almacenamiento = multer.diskStorage({
    destination: CARPETA_IMAGENES,
    // Nombre único: fecha + extensión original (Así las fotos no se pisan "foto.jpg")
    filename: (peticion, archivo, devolver) => 
        devolver(null, Date.now() + path.extname(archivo.originalname).toLowerCase()),
})

const LIMITE_MB = 2 // Máximo 2 MB

export const subirimagen = multer({
    storage: almacenamiento,
    limits: { fileSize: LIMITE_MB * 1024 * 1024 },
    fileFilter: (peticion, archivo, devolver) => devolver(null, archivo.mimetype.startswith("image/")), // Sólo imágenes
})

// Borra una imagen del disco a partir de la ruta guardada en la base (ej. /uploads/123.jpg).
export function borrarImagen(ruta){
    if (!ruta)return
    fs.unlink(path.join(__dirname, ruta),()=>{}) // Si el archivo no existe, no pasa nada.
}