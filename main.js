const API_URL = "https://examenesutn.vercel.app/api/PersonaCiudadanoExtranjero";

let LISTAPERSONAS = [];

function $(id) { return document.getElementById(id); }

document.addEventListener("DOMContentLoaded", function () {
    mostrarListaPersonas();
    $("btnAgregar").addEventListener("click", () => {
        agregarPersona();
        mostrarEncabezado("Alta");
    });
    $("btnCancelar").addEventListener("click", () => {
        ocultarFormularioAbm();
    });
    $("btnAceptar").addEventListener("click", () => {
        manejarAceptar();
    });
    $("selectTipo").addEventListener("change", function() {
        actualizarVisibilidadCampos(this.value);
    });
});

function mostrarListaPersonas() {
    mostrarSpinner();
    const xhr = new XMLHttpRequest();
    xhr.open("GET", API_URL);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            LISTAPERSONAS = JSON.parse(xhr.responseText);
            renderizarTabla();
            ocultarSpinner();
        }
    };
    xhr.send();
}

function renderizarTabla() {
    const tbody = $("tablaPersonas").getElementsByTagName("tbody")[0];
    tbody.innerHTML = "";
    LISTAPERSONAS.forEach(persona => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${persona.id}</td>
            <td>${persona.nombre}</td>
            <td>${persona.apellido}</td>
            <td>${persona.fechaNacimiento}</td>
            <td>${persona.dni || 'N/A'}</td>
            <td>${persona.paisOrigen || 'N/A'}</td>
            <td>
                <button class="btnModify" onclick="modificarPersona(${persona.id})">Modificar</button>           
            </td>
            <td>
                <button class="btnDelete" onclick="mostrarFormularioBaja(${persona.id})">Eliminar</button>
            </td>
            `;
        tbody.appendChild(tr);
    });
}

function agregarPersona() {
    limpiarFormularioAbm();
    Array.from(document.querySelectorAll('#formularioAbm input, #formularioAbm select')).forEach(element => {
        element.readOnly = false;
        element.disabled = false;
    });
    $("abmId").setAttribute('readonly', true);
    $("abmId").setAttribute('disabled', true);
    $("formularioAbm").style.display = "block";
    $("formularioLista").style.display = "none";
}

function manejarAceptar() {
    const nuevaPersona = obtenerDatosFormulario();
    if (nuevaPersona) {
        if (!validarCampos(nuevaPersona)) {
            return;
        }
        if (nuevaPersona.id) {
            actualizarPersona(nuevaPersona);
        } else {
            guardarPersona(nuevaPersona);
        }
    }
}

async function guardarPersona(persona) {
	mostrarSpinner();

	try {
		const respuesta = await fetch(API_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json;charset=UTF-8'
		},
		body: JSON.stringify(persona)
		});

		if (!respuesta.ok) {
			const errorMessage = await respuesta.text();
			throw new Error(`Error al guardar persona: ${respuesta.status} ${errorMessage}`);
		}

		const data = await respuesta.json();
		persona.id = data.id;
		LISTAPERSONAS.push(persona);
		renderizarTabla();
		ocultarFormularioAbm();
	} catch (error) {
		console.error(error);
	} finally {
		ocultarSpinner();
	}
}

function actualizarPersona(persona) {
    mostrarSpinner();

    fetch(API_URL, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify(persona)
    })
    .then(respuesta => {
        if (respuesta.ok) {
            return respuesta.text();
        } else {
            throw new Error(`Error al actualizar persona: ${respuesta.status}`);
        }
    })
    .then(data => {
        console.log(data);
        const index = LISTAPERSONAS.findIndex(p => p.id.toString() == persona.id.toString());
        if (index !== -1) {
            LISTAPERSONAS[index] = persona;
        }
        renderizarTabla();
        ocultarFormularioAbm();
    })
    .catch(error => {
        alert(error.message);
        ocultarFormularioAbm();
    })
    .finally(() => {
        ocultarSpinner();
    });
}


function obtenerDatosFormulario() {
    const id = $("abmId").value;
    const nombre = $("abmNombre").value;
    const apellido = $("abmApellido").value;
    const fecha = $("abmFecha").value;
    const tipo = $("selectTipo").value;
    let persona;

    if (tipo === "Ciudadano") {
        const dni = $("abmDni").value;
        persona = id ? new Ciudadano(id, nombre, apellido, fecha, dni) : new Ciudadano(null, nombre, apellido, fecha, dni);
    } else {
        const paisOrigen = $("abmPaisOrigen").value;
        persona = id ? new Extranjero(id, nombre, apellido, fecha, paisOrigen) : new Extranjero(null, nombre, apellido, fecha, paisOrigen);
    }

    if (!persona.id) {
        delete persona.id;
    }
    return persona;
}

function mostrarSpinner() {
    $("spinner").style.display = "block";
    $("spinnerContainer").style.display = "flex";
}

function ocultarSpinner() {
    $("spinner").style.display = "none";
    $("spinnerContainer").style.display = "none";
}

function modificarPersona(id) {
    mostrarEncabezado("Modificación");
    const persona = LISTAPERSONAS.find(p => p.id.toString() == id.toString());
    if (!persona) return;

    $("abmId").value = persona.id;
    $("abmNombre").value = persona.nombre;
    $("abmApellido").value = persona.apellido;
    $("abmFecha").value = persona.fechaNacimiento;
    $("selectTipo").value = persona instanceof Ciudadano ? "Ciudadano" : "Extranjero";
	Array.from(document.querySelectorAll('#formularioAbm input, #formularioAbm select')).forEach(element => {
        element.readOnly = false;
        element.disabled = false;
    });
    $("abmId").setAttribute('readonly', true);
    $("abmId").setAttribute('disabled', true);

    actualizarVisibilidadCampos($("selectTipo").value);
    if (persona instanceof Ciudadano) {
        $("abmDni").value = persona.dni;
    } else {
        $("abmPaisOrigen").value = persona.paisOrigen;
    }
    $("formularioAbm").style.display = "block";
    $("formularioLista").style.display = "none";
}

function mostrarEncabezado(modo) {
    $("encabezadoAbm").innerHTML = `${modo} de persona`;
}

function ocultarFormularioAbm() {
    $("formularioAbm").style.display = "none";
    $("formularioLista").style.display = "block";
}

function limpiarFormularioAbm() {
    $("abmId").value = "";
    $("abmNombre").value = "";
    $("abmApellido").value = "";
    $("abmFecha").value = "";
    $("abmDni").value = "";
    $("abmPaisOrigen").value = "";
}

function actualizarVisibilidadCampos(tipo) {
    if (tipo === "Ciudadano") {
        $("ciudadano").style.display = "block";
        $("extranjero").style.display = "none";
    } else {
        $("ciudadano").style.display = "none";
        $("extranjero").style.display = "block";
    }
}

function eliminarPersona(id) {
    mostrarSpinner();
    const xhr = new XMLHttpRequest();
    xhr.open("DELETE", API_URL);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                LISTAPERSONAS = LISTAPERSONAS.filter(p => p.id.toString() !== id.toString());
                renderizarTabla();
            } else {
                alert("Error al eliminar persona.");
            }
            ocultarSpinner();
            ocultarFormularioAbm();
        }
    };
    xhr.send(JSON.stringify({ id: id }));
}

function mostrarFormularioBaja(id) {
    mostrarEncabezado("Baja");
    const persona = LISTAPERSONAS.find(p => p.id.toString() == id.toString());
    if (!persona) return;

    $("abmId").value = persona.id;
    $("abmNombre").value = persona.nombre;
    $("abmApellido").value = persona.apellido;
    $("abmFecha").value = persona.fechaNacimiento;

    // Hacer todos los campos readonly
    Array.from(document.querySelectorAll('#formularioAbm input, #formularioAbm select')).forEach(element => {
        element.readOnly = true;
        element.disabled = true;
    });

    if (persona.dni !== undefined) {
        $("selectTipo").value = "Ciudadano";
        $("abmDni").value = persona.dni;
        $("ciudadano").style.display = "block";
        $("extranjero").style.display = "none";
    } else {
        $("selectTipo").value = "Extranjero";
        $("abmPaisOrigen").value = persona.paisOrigen;
        $("ciudadano").style.display = "none";
        $("extranjero").style.display = "block";
    }

    $("formularioAbm").style.display = "block";
    $("formularioLista").style.display = "none";
    $("btnAceptar").onclick = function() {
        eliminarPersona(persona.id);
    };
}

function validarCampos(persona) {
    if (!persona.nombre || !persona.apellido || !persona.fechaNacimiento) {
        alert("Complete los campos Nombre, Apellido y Fecha correctamente.");
        return false;
    }

    if (persona.dni !== undefined) {
        if (!persona.dni || isNaN(persona.dni)) {
            alert("Ingrese un DNI numérico.");
            return false;
        }
    }

    if (persona.paisOrigen !== undefined) {
        if (!persona.paisOrigen || typeof persona.paisOrigen !== 'string') {
            alert("Ingrese un país de origen válido.");
            return false;
        }
    }

    return true;
}