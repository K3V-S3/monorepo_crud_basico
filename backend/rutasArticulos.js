// Responsabilidad: Se tienen las rutas del CRUD de articulos (Recibe la petición -> viaja a SQL -> Responde)
import { Router } from "express";
import {baseDatos} from "./baseDatos.js"
import {subirImagen, borrarImagen} from "./subirImagen.js"

const rutas = Router()

// Si una función async falla, responde con error 500 en vez de dejar la petición colgada.
const conManejoDeErrores = funcion => (peticion, respuesta) => 
    funcion(peticion, respuesta).catch(error => {
        console.error(error)
        respuesta.status(500).json({error: "Error del servidor: " + error.message})
    })

// Convierte lo que llega del formulario (todo llega como texto) en números y los valida
function leerCampos(cuerpo){
    const articulo = {
        nombre: (cuerpo.nombre ?? "").trim(),
        descripcion: (cuerpo.descripcion ?? "").trim(),
        precio_compra: Number(cuerpo.precio_compra),
        precio_venta: Number(cuerpo.precio_venta),
        stock_minimo: Number(cuerpo.stock_minimo),
        stock_maximo: Number(cuerpo.stock_maximo),
    }
    let mensajeError = null
    if (!articulo.nombre) mensajeError = "El nombre es obligatorio"
    else if (!(articulo.precio_compra >= 0) || !(articulo.precio_venta >= 0)) mensajeError = "Los precios deben ser números positivos"
    else if (!(articulo.stock_minimo >= 0) || !(articulo.stock_maximo >= 0)) mensajeError = "El stock debe ser un número positivo"
    else if (articulo.stock_minimo > articulo.stock_maximo) mensajeError = "El stock mínimo no puede ser mayor que el stock máximo"
    return { articulo, mensajeError }
}

// Listar (Read) Todos los artículos
rutas.get("/", conManejoDeErrores(async(peticion, respuesta)=>{
    const[filas] = await baseDatos.query("SELECT * FROM articulos ORDER BY id DESC")
    respuesta.json(filas)
}))

// Listar UNO por su ID (Read ID)
rutas.get("/:id", conManejoDeErrores(async(peticion, respuesta)=>{
    const [filas] = await baseDatos.query("SELECT * FROm articulos WHERE id = ?", [peticion.params.id])
    if (!filas.length) return respuesta.status(404).json({ error: "Articulo no encontrado"})
        respuesta.json(filas[0])
}))

// Crear (Create) El formulario llega como multipart: los textos en peticion.body y el archivo en peticion.file.
rutas.post("/", subirImagen.single("imagen"), conManejoDeErrores(async(peticion, respuesta)=>{
    const {articulo, mensajeError}=leerCampos(peticion.body)
    if(mensajeError){
        if(peticion.file) borrarImagen("/uploads" + peticion.file.filename)
            return respuesta.status(400).json({ error: mensajeError})
    }
    const imagen = peticion.file ? "/uploads/" + peticion.file.filename : null
    const [resultado] = await baseDatos.query(
        `INSERT INTO ARTICULOS (nombre, descripcion, precio_compra, precio_venta, stock_minimo, stock_maximo, imagen)
        VALUES (?,?,?,?,?,?,?)`,
        [articulo.nombre, articulo.descripcion. articulo.precio_compra, articulo.precio_venta, articulo.stock_minimo. articulo.stock_maximo, imagen],
    )
    respuesta.status(201).json({id: resultado.insertId, ...articulo, imagen})
}))

// Editar (Update) Si no se envia una imagen nueva, se conserva la anterior.
// Actualizar (Update)
rutas.put("/:id", conManejoDeErrores(async (peticion, respuesta) => {
    const imagenNueva = peticion.file ? "/uploads/" + peticion.file.filename : null

    const [filas] = await baseDatos.query("SELECT imagen FROM articulos WHERE id = ?", [peticion.params.id])
    if (!filas.length) {
        if (imagenNueva) borrarImagen(imagenNueva)
        return respuesta.status(404).json({ error: "Artículo no encontrado" })
    }

    const { articulo, mensajeError } = leerCampos(peticion.body)
    if (mensajeError) {
        if (imagenNueva) borrarImagen(imagenNueva)
        return respuesta.status(400).json({ error: mensajeError })
    }

    const imagen = imagenNueva ?? filas[0].imagen
    await baseDatos.query(
        'UPDATE articulos SET nombre=?, descripcion=?, precio_compra=?, precio_venta=?, stock_minimo=?, stock_maximo=?, imagen=? WHERE id=?',
        [articulo.nombre, articulo.descripcion, articulo.precio_compra, articulo.precio_venta, articulo.stock_minimo, articulo.stock_maximo, imagen, peticion.params.id]
    )
    if (imagenNueva) borrarImagen(filas[0].imagen) // Reemplaza la foto y se borra la imagen vieja.
    respuesta.json({ id: Number(peticion.params.id), ...articulo, imagen })
}))

// Eliminar (Delete) Este método también borra la foto del disco.
rutas.delete("/:id", conManejoDeErrores(async (peticion, respuesta) => {
    const [filas] = await baseDatos.query("SELECT imagen FROM articulos WHERE id = ?", [peticion.params.id])
    if (!filas.length) return respuesta.status(404).json({ error: "Artículo no encontrado" })
    await baseDatos.query("DELETE FROM articulos WHERE id = ?", [peticion.params.id])
    borrarImagen(filas[0].imagen)
    respuesta.json({ ok: true })
}))

export default rutas