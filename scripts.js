// URLs y configuraciones
const PROXY_URL = 'https://proxy-web-lwr4.onrender.com/api'; // Usar el proxy
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dh9szo3si/upload'; // Reemplaza con tu Cloud Name
const UPLOAD_PRESET = 'ml_default'; // Reemplaza con tu Upload Preset

// Función para enviar datos al Google Apps Script a través del proxy
async function enviarDatos(tipo, datos) {
    try {
        console.log('Enviando datos al proxy:', { tipo, datos }); // Depuración

        // Asegúrate de que fecha_real esté presente en los datos
        if (!datos.fecha_real) {
            throw new Error('El campo fecha_real no está definido.');
        }

        const response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ...datos, tipo }) // Incluir el tipo de datos en el cuerpo
        });

        console.log('Respuesta del proxy:', response.status, response.statusText); // Depuración

        if (!response.ok) {
            throw new Error(`Error en el servidor: ${response.status}`);
        }

        const result = await response.json();
        console.log('Datos enviados correctamente:', result); // Depuración
        return result;
    } catch (error) {
        console.error('Error al enviar datos:', error);
        throw error;
    }
}


// Función para cargar categorías dinámicamente
async function cargarCategorias() {
    try {
        console.log('Cargando categorías...'); // Depuración
        const response = await fetch(PROXY_URL + '?accion=categorias', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log('Respuesta del proxy:', response.status, response.statusText); // Depuración

        if (!response.ok) {
            throw new Error(`Error al cargar categorías: ${response.status}`);
        }

        const categorias = await response.json();
        console.log('Categorías cargadas:', categorias); // Depuración

        const selectCategoria = document.getElementById('categoria');
        if (selectCategoria) {
            categorias.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria;
                option.textContent = categoria;
                selectCategoria.appendChild(option);
            });
        } else {
            console.error('El elemento con ID "categoria" no existe en el DOM.');
        }
    } catch (error) {
        console.error('Error al cargar categorías:', error);
    }
}

// Función para cargar subcategorías dinámicamente
async function cargarSubcategorias(categoria) {
    try {
        const response = await fetch(PROXY_URL + '?accion=subcategorias&categoria=' + encodeURIComponent(categoria));
        if (!response.ok) {
            throw new Error(`Error al cargar subcategorías: ${response.status}`);
        }
        const subcategorias = await response.json();
        console.log('Subcategorías cargadas:', subcategorias); // Depuración

        const selectSubcategoria = document.getElementById('subcategoria');
        if (selectSubcategoria) {
            // Limpiar opciones anteriores
            selectSubcategoria.innerHTML = '';

            // Si no hay subcategorías, agregar una opción por defecto
            if (subcategorias.length === 0) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'No hay subcategorías';
                selectSubcategoria.appendChild(option);
                selectSubcategoria.disabled = true; // Deshabilitar el select si no hay subcategorías
            } else {
                // Si hay subcategorías, agregarlas al select
                subcategorias.forEach(subcategoria => {
                    const option = document.createElement('option');
                    option.value = subcategoria;
                    option.textContent = subcategoria;
                    selectSubcategoria.appendChild(option);
                });
                selectSubcategoria.disabled = false; // Habilitar el select si hay subcategorías
            }
        } else {
            console.error('El elemento con ID "subcategoria" no existe en el DOM.');
        }
    } catch (error) {
        console.error('Error al cargar subcategorías:', error);
    }
}

// Función para subir imágenes a Cloudinary
async function uploadImageToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
        const response = await fetch(CLOUDINARY_URL, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Error al subir la imagen a Cloudinary');
        }

        const data = await response.json();
        return data.secure_url; // Devuelve la URL de la imagen subida
    } catch (error) {
        console.error('Error al subir la imagen:', error);
        throw error;
    }
}



// Cargar categorías al cargar la página
document.addEventListener('DOMContentLoaded', function () {
    cargarCategorias();

    const selectCategoria = document.getElementById('categoria');
    if (selectCategoria) {
        // Cargar subcategorías cuando se selecciona una categoría
        selectCategoria.addEventListener('change', function () {
            cargarSubcategorias(this.value);
        });
    } else {
        console.error('El elemento con ID "categoria" no existe en el DOM.');
    }
});



document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const fechaSelect = document.getElementById("fecha");
    const fechaRealInput = document.getElementById("fecha_real");
    const fechaPersonalizadaContainer = document.getElementById("fecha_personalizada_container");
    const fechaPersonalizadaInput = document.getElementById("fecha_personalizada");

    // Función para formatear la fecha como dd/mm/aaaa
    function obtenerFechaFormateada(fecha) {
        return `${String(fecha.getDate()).padStart(2, '0')}/${String(fecha.getMonth() + 1).padStart(2, '0')}/${fecha.getFullYear()}`;
    }

    // Función para actualizar la fecha_real según la selección
    function actualizarFechaReal() {
        const hoy = new Date();
        let nuevaFecha = "";

        if (fechaSelect.value === "hoy") {
            nuevaFecha = obtenerFechaFormateada(hoy);
            fechaPersonalizadaContainer.style.display = "none";
        } else if (fechaSelect.value === "ayer") {
            const ayer = new Date(hoy);
            ayer.setDate(hoy.getDate() - 1);
            nuevaFecha = obtenerFechaFormateada(ayer);
            fechaPersonalizadaContainer.style.display = "none";
        } else if (fechaSelect.value === "personalizado") {
            fechaPersonalizadaContainer.style.display = "block";
            return; // No modificar fecha_real aún
        }

        fechaRealInput.value = nuevaFecha;
    }

    // Actualiza fecha_real cuando se cambia la opción de fecha
    fechaSelect.addEventListener("change", actualizarFechaReal);

    // Actualiza fecha_real con la fecha personalizada si se ingresa
    fechaPersonalizadaInput.addEventListener("input", function () {
        if (fechaSelect.value === "personalizado" && this.value) {
            const fecha = new Date(this.value + "T00:00:00"); // Evita desfase horario
            fechaRealInput.value = obtenerFechaFormateada(fecha);
        }
    });

    // Prevent default form submit if fecha_real is not set
    form.addEventListener("submit", function (e) {
        if (!fechaRealInput.value) {
            alert("Por favor, selecciona una fecha válida.");
            e.preventDefault();
        }
    });

    // Envío del formulario
    form.addEventListener("submit", function (e) {
        e.preventDefault(); // Evita el envío automático del formulario

        // Verifica si la fecha está correctamente definida
        console.log("Fecha a enviar:", fechaRealInput.value);

        const formData = new FormData(form);

        fetch(form.action, {
            method: "POST",
            body: formData,
        })
        .then(response => response.text())
        .then(data => console.log("Respuesta:", data))
        .catch(error => console.error("Error:", error));
    });
});

document.getElementById('egresosForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Crear un objeto con los datos del formulario
    const datos = {
        tipo: 'egresos',
        fecha_real: document.getElementById('fecha_real').value,
        descripcion: document.getElementById('descripcion').value,
        vendedor: document.getElementById('vendedor').value, // Aquí está el campo
        categoria: document.getElementById('categoria').value,
        subcategoria: document.getElementById('subcategoria').value,
        monto: document.getElementById('monto').value,
        metodo_pago: document.getElementById('metodo_pago').value,
        imagen: document.getElementById('imagen').files[0] ? await uploadImageToCloudinary(document.getElementById('imagen').files[0]) : 'Sin imagen'
    };

    console.log('Datos antes de enviar:', datos); // Verifica que "vendedor" esté presente

    try {
        const resultado = await enviarDatos('egresos', datos);
        alert('✅ Datos enviados correctamente.\n\n' + JSON.stringify(resultado));
        this.reset(); // Limpiar el formulario
        document.getElementById('fecha_personalizada_container').style.display = 'none'; // Ocultar campo personalizado
    } catch (error) {
        alert('❌ Hubo un problema al enviar los datos. Intenta de nuevo.');
    }
});

document.getElementById('ingresosForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Crear un objeto con los datos del formulario
    const datos = {
        tipo: 'ingresos',
        fecha_real: document.getElementById('fecha_real').value,
        descripcion: document.getElementById('descripcion').value,
        codigoVendedor: document.getElementById('codigoVendedor').value, // Aquí está el campo
        monto: document.getElementById('monto').value,
        metodo_pago: document.getElementById('metodo_pago').value,
        imagen: document.getElementById('imagen').files[0] ? await uploadImageToCloudinary(document.getElementById('imagen').files[0]) : 'Sin imagen'
    };

    console.log('Datos antes de enviar:', datos); // Verifica que "codigoVendedor" esté presente

    try {
        const resultado = await enviarDatos('ingresos', datos);
        alert('✅ Datos enviados correctamente.\n\n' + JSON.stringify(resultado));
        this.reset(); // Limpiar el formulario
        document.getElementById('fecha_personalizada_container').style.display = 'none'; // Ocultar campo personalizado
    } catch (error) {
        alert('❌ Hubo un problema al enviar los datos.');
    }
});