// 1. Módulo Principal de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";

// 2. Módulo de Realtime Database (CORRECTO)
import { getDatabase, onValue, ref as refS, set, child, get, update, remove } from
    "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

// Tu código de Firebase y lógica sigue aquí:
const firebaseConfig = {
    apiKey: "AIzaSyBfkBa3CkMhxPx4NKhmAR1DU4c6QuT9aj4",
    authDomain: "webfinalproyect-7dc33.firebaseapp.com",
    databaseURL: "https://webfinalproyect-7dc33-default-rtdb.firebaseio.com",
    projectId: "webfinalproyect-7dc33",
    storageBucket: "webfinalproyect-7dc33.firebasestorage.app",
    messagingSenderId: "240173234969",
    appId: "1:240173234969:web:f8f9337b271de388906388"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// declarar variables global (CORRECCIÓN 1: Se agrega 'precio')
var numSerie = 0;
var marca = "";
var modelo = "";
var descripcion = "";
var precio = 0; // 👈 Variable para el precio
var urlImg = "";

//funciones
function leerInputs() {
    numSerie = document.getElementById('txtNumSerie').value;
    marca = document.getElementById('txtMarca').value;
    modelo = document.getElementById('txtModelo').value;
    descripcion = document.getElementById('txtDescripcion').value;
    // CORRECCIÓN 2: Leer el precio como número (flotante)
    precio = parseFloat(document.getElementById('txtPrecio').value); 
    urlImg = document.getElementById('txtUrl').value;
}

function mostrarMensaje(mensaje) {
    var mensajeElement = document.getElementById('mensaje');
    mensajeElement.textContent = mensaje;
    mensajeElement.style.display = 'block';
    setTimeout(() => {
        mensajeElement.style.display = 'none'
    }, 1000);
}

//agregar productos
const btnAgregar = document.getElementById('btnAgregar');
btnAgregar.addEventListener('click', insertarProducto);

function insertarProducto() {
    leerInputs();
    //validar
    // CORRECCIÓN 3: Validar que el precio sea un número válido y mayor que cero
    if (numSerie === "" || marca === "" || modelo === "" || descripcion === "" || isNaN(precio) || precio <= 0) {
        mostrarMensaje("Faltaron datos por capturar o el precio no es válido.");
        return;
    }
    
    // funcion firebase para agregar registro
    set(
        refS(db, 'Automoviles/' + numSerie),
        {
            // CORRECCIÓN 4: Se agrega el campo 'precio' al objeto JSON de Firebase
            numSerie: numSerie,
            marca: marca,
            modelo: modelo,
            descripcion: descripcion,
            precio: precio, // 👈 ¡Precio incluido!
            urlImg: urlImg
        }
    ).then(() => {
        alert("Se agrego con exito");
        Listarproductos();
        limpiarInputs();
    }).catch((error) => {
        alert("Ocurrio un error: " + error);
    });
}

function limpiarInputs() {
    document.getElementById('txtNumSerie').value = '';
    document.getElementById('txtModelo').value = '';
    document.getElementById('txtMarca').value = '';
    document.getElementById('txtDescripcion').value = '';
    document.getElementById('txtPrecio').value = ''; // 👈 CORRECCIÓN 5: Limpiar campo Precio
    document.getElementById('txtUrl').value = '';
}

function escribirInputs() {
    document.getElementById('txtModelo').value = modelo;
    document.getElementById('txtMarca').value = marca;
    document.getElementById('txtDescripcion').value = descripcion;
    document.getElementById('txtPrecio').value = precio; // 👈 CORRECCIÓN 6: Escribir campo Precio
    document.getElementById('txtUrl').value = urlImg;
}

function buscarProducto() {
    let numSerie = document.getElementById('txtNumSerie').value.trim();
    if (numSerie === "") {
        mostrarMensaje("No se ingreso Num Serie");
        return;
    }

    const dbref = refS(db);
    get(child(dbref, 'Automoviles/' + numSerie)).then((snapshot) => {
        if (snapshot.exists()) {
            marca = snapshot.val().marca;
            modelo = snapshot.val().modelo;
            descripcion = snapshot.val().descripcion;
            precio = snapshot.val().precio; // 👈 CORRECCIÓN 7: Leer precio desde Firebase
            urlImg = snapshot.val().urlImg;
            escribirInputs();
        } else {
            limpiarInputs();
            mostrarMensaje("El producto con código " + numSerie + " no existe.");
        }
    })
}

const btnBuscar = document.getElementById('btnBuscar');
btnBuscar.addEventListener('click', buscarProducto);

function Listarproductos() {
    const dbRef = refS(db, 'Automoviles/');
    const tabla = document.getElementById('tablaProductos');
    const tbody = tabla.querySelector('tbody');
    tbody.innerHTML = '';
    onValue(dbRef, (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const childKey = childSnapshot.key;
            const data = childSnapshot.val();
            var fila = document.createElement('tr');

            var celdaCodigo = document.createElement('td');
            celdaCodigo.textContent = childKey;
            fila.appendChild(celdaCodigo);

            var celdaMarca = document.createElement('td'); // Se renombró para claridad
            celdaMarca.textContent = data.marca;
            fila.appendChild(celdaMarca);

            var celdaModelo = document.createElement('td'); // Se renombró para claridad
            celdaModelo.textContent = data.modelo;
            fila.appendChild(celdaModelo);

            var celdaDescripcion = document.createElement('td'); // Se renombró para claridad
            celdaDescripcion.textContent = data.descripcion;
            fila.appendChild(celdaDescripcion);

            // CORRECCIÓN 8: Se crea y añade la celda para el Precio
            var celdaPrecio = document.createElement('td');
            // Formatear el precio a moneda (opcional, pero recomendado)
            celdaPrecio.textContent = `$${data.precio ? parseFloat(data.precio).toFixed(2) : 'N/A'}`; 
            fila.appendChild(celdaPrecio); // 👈 ¡Celda de precio incluida!

            var celdaImagen = document.createElement('td');
            var imagen = document.createElement('img');
            imagen.src = data.urlImg;
            imagen.width = 100;
            celdaImagen.appendChild(imagen);
            fila.appendChild(celdaImagen);
            tbody.appendChild(fila);
        });
    }, { onlyOnce: true });
}

document.addEventListener("DOMContentLoaded", Listarproductos);

function actualizarAutomovil() {

    leerInputs();
    // CORRECCIÓN 3: Validar que el precio sea un número válido y mayor que cero
    if (numSerie === "" || marca === "" || modelo === "" || descripcion === "" || isNaN(precio) || precio <= 0) {
        mostrarMensaje("Favor de capturar toda la informacion o el precio no es válido.");
        return;
    }
    
    alert("Actualizar");
    update(refS(db, 'Automoviles/' + numSerie), {
        numSerie: numSerie,
        marca: marca,
        modelo: modelo,
        descripcion: descripcion,
        precio: precio, // 👈 ¡Precio incluido!
        urlImg: urlImg
    }).then(() => {
        mostrarMensaje("Se actualizo con exito.");
        limpiarInputs();
        Listarproductos();
    }).catch((error) => {
        mostrarMensaje("Ocurrio un error: " + error);
    });
}

const btnActualizar = document.getElementById('btnActualizar');
btnActualizar.addEventListener('click', actualizarAutomovil);

function eliminarAutomovil() {
    let numSerie = document.getElementById('txtNumSerie').value.trim();
    if (numSerie === "") {
        mostrarMensaje("No se ingresó un Código válido.");
        return;
    }
    const dbref = refS(db);
    get(child(dbref, 'Automoviles/' + numSerie)).then((snapshot) => {
        if (snapshot.exists()) {
            remove(refS(db, 'Automoviles/' + numSerie))
                .then(() => {
                    mostrarMensaje("Producto eliminado con éxito.");
                    limpiarInputs();
                    Listarproductos();
                })
                .catch((error) => {
                    mostrarMensaje("Ocurrió un error al eliminar el producto: " + error);
                });
        } else {
            limpiarInputs();
            mostrarMensaje("El producto con ID " + numSerie + " no existe.");
        }
    });
    // Se elimina la doble llamada a Listarproductos()
}

const btnBorrar = document.getElementById('btnBorrar');
btnBorrar.addEventListener('click', eliminarAutomovil);

// ------------------prueba de la imagen
// cuenta cloudinary
const cloudName = "df7ntia1k";
const uploadPreset = "kevincito";

//constantes
const imageInput = document.getElementById('imageInput');
const uploadButton = document.getElementById('uploadButton');

//evento
uploadButton.addEventListener('click', async (e) => {
    e.preventDefault(); // evita que el formulario se recargue
    e.stopPropagation();

    const file = imageInput.files[0];

    if (!file) {
        alert("Selecciona una imagen antes de subir.");
        return;
    }

    // subir archivo
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: "POST",
            body: formData
        });
        const data = await response.json();
        if (data.secure_url) {
            document.getElementById("txtUrl").value = data.secure_url;
            alert("Imagen subida correctamente");
        } else {
            alert("Error al subir la imagen");
            console.error(data);
        }
    } catch (error) {
        console.error("Error al subir a Cloudinary:", error);
        alert("Ocurrió un error al subir la imagen.");
    }
});