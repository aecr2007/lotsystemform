// URLs y configuraciones
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxe6BapqzcK7HJwY2MKZa948VLIEQHu2c7YjOKnECtHdUsa1y8JtNHTGf-oq_FwudbK/exec';
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dh9szo3si/upload'; // Reemplaza con tu Cloud Name
const UPLOAD_PRESET = 'ml_default'; // Reemplaza con tu Upload Preset

// Función para enviar datos al Google Apps Script
async function enviarDatos(tipo, datos) {
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        });

        if (!response.ok) {
            throw new Error(`Error en el servidor: ${response.status}`);
        }

        const result = await response.json();
        console.log('Datos enviados correctamente:', result);
        return result;
    } catch (error) {
        console.error('Error al enviar datos:', error);
        throw error;
    }
}

// Función para cargar categorías dinámicamente
async function cargarCategorias() {
    try {
        const response = await fetch(SCRIPT_URL + '?accion=categorias', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

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
        const response = await fetch(SCRIPT_URL + '?accion=subcategorias&categoria=' + encodeURIComponent(categoria));
        if (!response.ok) {
            throw new Error(`Error al cargar subcategorías: ${response.status}`);
        }
        const subcategorias = await response.json();
        console.log('Subcategorías cargadas:', subcategorias); // Depuración

        const selectSubcategoria = document.getElementById('subcategoria');
        if (selectSubcategoria) {
            // Limpiar opciones anteriores
            selectSubcategoria.innerHTML = '';

            subcategorias.forEach(subcategoria => {
                const option = document.createElement('option');
                option.value = subcategoria;
                option.textContent = subcategoria;
                selectSubcategoria.appendChild(option);
            });
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