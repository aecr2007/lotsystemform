// URLs y configuraciones
const PROXY_URL = 'https://proxy-web-lwr4.onrender.com/api'; // Usar el proxy
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dh9szo3si/upload'; // Reemplaza con tu Cloud Name
const UPLOAD_PRESET = 'ml_default'; // Reemplaza con tu Upload Preset


// Función para enviar datos al Google Apps Script a través del proxy
async function enviarDatos(tipo, datos) {
    try {
        console.log('Enviando datos al proxy:', { tipo, datos }); // Depuración
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

// Evento para enviar el formulario de egresos
document.getElementById('egresosForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const datos = Object.fromEntries(formData.entries());

    try {
        const resultado = await enviarDatos('egresos', datos);
        alert('✅ Datos enviados correctamente.\n\n' + JSON.stringify(resultado));
    } catch (error) {
        alert('❌ Hubo un problema al enviar los datos. Intenta de nuevo.');
    }
});

// Evento para enviar el formulario de ingresos
document.getElementById('ingresosForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const imagenInput = document.getElementById('imagen');
    const datos = Object.fromEntries(formData.entries());

    try {
        if (imagenInput.files.length > 0) {
            const imagenUrl = await uploadImageToCloudinary(imagenInput.files[0]);
            datos.imagen_url = imagenUrl;
        }

        const resultado = await enviarDatos('ingresos', datos);
        alert('✅ Datos enviados correctamente.\n\n' + JSON.stringify(resultado));
        this.reset(); // Limpiar el formulario
    } catch (error) {
        alert('❌ Hubo un problema al enviar los datos. Intenta de nuevo.');
    }
});

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

document.addEventListener('DOMContentLoaded', function () {
    const fechaSelect = document.getElementById('fecha');
    const fechaRealInput = document.getElementById('fecha_real');
    const fechaPersonalizadaContainer = document.getElementById('fecha_personalizada_container');
    const fechaPersonalizadaInput = document.getElementById('fecha_personalizada');

    fechaSelect.addEventListener('change', function () {
        const fechaSeleccionada = this.value;

        if (fechaSeleccionada === 'hoy') {
            const hoy = new Date();
            const fechaFormateada = `${String(hoy.getDate()).padStart(2, '0')}/${String(hoy.getMonth() + 1).padStart(2, '0')}/${hoy.getFullYear()}`;
            fechaRealInput.value = fechaFormateada;
            fechaPersonalizadaContainer.style.display = 'none';
        } else if (fechaSeleccionada === 'ayer') {
            const ayer = new Date();
            ayer.setDate(ayer.getDate() - 1);
            const fechaFormateada = `${String(ayer.getDate()).padStart(2, '0')}/${String(ayer.getMonth() + 1).padStart(2, '0')}/${ayer.getFullYear()}`;
            fechaRealInput.value = fechaFormateada;
            fechaPersonalizadaContainer.style.display = 'none';
        } else if (fechaSeleccionada === 'personalizado') {
            fechaPersonalizadaContainer.style.display = 'block';
            fechaRealInput.value = ''; // Limpiar el valor hasta que el usuario ingrese la fecha
        }
    });

    fechaPersonalizadaInput.addEventListener('input', function () {
        fechaRealInput.value = this.value; // Actualizar el campo oculto con la fecha personalizada
    });
});