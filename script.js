/**
 * ------------------------------------------------------------------------
 * SISTEMA DE GESTIÓN Y FACTURACIÓN - SMARTORDER
 * Módulo de Control de Pedidos y Facturación Dinámica (Frontend)
 * Autor: Miguel José Cogollo Jiménez
 * Programa: ADSO - SENA
 * ------------------------------------------------------------------------
 */

console.log("¡El script está conectado correctamente!");

// --- 1. VARIABLES GLOBALES ---
// Almacena el listado de pedidos recuperados del almacenamiento local o un arreglo vacío.
let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
let filtro = "todos"; // Controla el estado actual del filtro visual de la lista.

// --- 2. INICIALIZACIÓN AL CARGAR EL DOM ---
document.addEventListener("DOMContentLoaded", function() {
    // Inicializa la base de datos local de facturas si no existe previamente
    if (!localStorage.getItem("facturas")) {
        localStorage.setItem("facturas", JSON.stringify([]));
    }
    mostrarPedidos();
    cambiarFiltro("todos");
    mostrarHistorial();
});

// --- 3. FUNCIÓN AUXILIAR DE GUARDADO ---
/**
 * Sincroniza el arreglo actual de pedidos con el almacenamiento local del navegador.
 */
function guardar() {
    localStorage.setItem("pedidos", JSON.stringify(pedidos));
}

// --- 4. GESTIÓN DE PEDIDOS ---
/**
 * Captura los datos del formulario de pedidos, valida los campos y los añade al arreglo global.
 */
function agregarPedido() {
    let producto = document.getElementById("producto").value;
    let cantidad = document.getElementById("cantidad").value;
    let precio = document.getElementById("precio").value;

    if (producto === "" || cantidad === "" || precio === "") return;

    pedidos.push({
        nombre: producto,
        cantidad: parseInt(cantidad),
        precio: parseFloat(precio),
        completado: false
    });

    guardar();
    mostrarPedidos();

    // Limpiar campos del formulario tras la inserción exitosa
    document.getElementById("producto").value = "";
    document.getElementById("cantidad").value = "";
    document.getElementById("precio").value = "";
}

/**
 * Modifica el tipo de filtro activo y actualiza los estilos visuales de los botones correspondientes.
 * @param {string} tipo - Criterio de filtrado ("todos", "pendientes", "completados").
 */
function cambiarFiltro(tipo) {
    filtro = tipo;
    
    let btnTodos = document.getElementById("btnTodos");
    let btnPendientes = document.getElementById("btnPendientes");
    let btnCompletados = document.getElementById("btnCompletados");

    if (btnTodos) btnTodos.classList.remove("activo");
    if (btnPendientes) btnPendientes.classList.remove("activo");
    if (btnCompletados) btnCompletados.classList.remove("activo");

    if (tipo === "todos" && btnTodos) btnTodos.classList.add("activo");
    else if (tipo === "pendientes" && btnPendientes) btnPendientes.classList.add("activo");
    else if (tipo === "completados" && btnCompletados) btnCompletados.classList.add("activo");

    mostrarPedidos();
}

/**
 * Renderiza dinámicamente la lista de pedidos en la interfaz de usuario, 
 * calculando subtotales, totales generales y aplicando los estados de completado.
 */
function mostrarPedidos() {
    let lista = document.getElementById("lista");
    if (!lista) return;
    lista.innerHTML = "";

    let total = 0;

    let pedidosFiltrados = pedidos.filter(function(pedido) {
        if (filtro === "pendientes") return !pedido.completado;
        if (filtro === "completados") return pedido.completado;
        return true;
    });

    pedidosFiltrados.forEach(function(pedido) {
        let index = pedidos.indexOf(pedido);
        let li = document.createElement("li");

        let subtotal = pedido.cantidad * pedido.precio;
        total += subtotal;

        let texto = document.createElement("span");
        texto.textContent = pedido.nombre + " | Cant: " + pedido.cantidad + " | $" + pedido.precio + " | Subtotal: $" + subtotal;

        if (pedido.completado) {
            texto.style.textDecoration = "line-through";
            texto.style.color = "green";
        }

        // Evento para alternar el estado de completado de un pedido al hacer clic
        texto.onclick = function() {
            pedidos[index].completado = !pedidos[index].completado;
            guardar();
            mostrarPedidos();
        };

        let boton = document.createElement("span");
        boton.textContent = " ❌";
        boton.style.color = "red";
        boton.style.cursor = "pointer";

        // Evento para eliminar un elemento específico del arreglo de pedidos
        boton.onclick = function(e) {
            e.stopPropagation();
            pedidos.splice(index, 1);
            guardar();
            mostrarPedidos();
        };

        li.appendChild(texto);
        li.appendChild(boton);
        lista.appendChild(li);
    });

    // Actualizar Ticket Visual e indicadores en pantalla
    let detalle = document.getElementById("detalle");
    if (detalle) {
        detalle.innerHTML = `<div style="display:flex; border-bottom:1px solid black; font-weight:bold;">
            <span style="width:50%;">Producto</span>
            <span style="width:20%; text-align:center;">Cant</span>
            <span style="width:30%; text-align:right;">Total</span>
        </div>`;
        detalle.appendChild(document.createElement("hr"));

        pedidos.forEach(function(pedido) {
            detalle.innerHTML += `<div style="display:flex;">
                <span style="width:50%;">${pedido.nombre}</span>
                <span style="width:20%; text-align:center;">${pedido.cantidad}</span>
                <span style="width:30%; text-align:right;">$${(pedido.precio * pedido.cantidad).toLocaleString()}</span>
            </div>`;
        });
    }

    let contadorElem = document.getElementById("contador");
    if (contadorElem) contadorElem.textContent = "Total pedidos: " + pedidos.length;

    let totalElem = document.getElementById("total");
    if (totalElem) totalElem.textContent = "Total factura: $" + total;
}

// --- 5. FACTURACIÓN E HISTORIAL ---
/**
 * Genera un número de factura consecutivo, calcula totales, 
 * almacena la transacción en el historial y despliega la ventana de impresión del ticket.
 */
function imprimirFactura() {
    let historial = JSON.parse(localStorage.getItem("facturas")) || [];
    let ultimoNumero = historial.length > 0 ? parseInt(historial[historial.length - 1].numero) : 0;
    let siguienteNumero = (ultimoNumero + 1).toString().padStart(4, "0");
    
    let facturaElem = document.getElementById("factura");
    if (facturaElem) facturaElem.textContent = "Factura Nº: " + siguienteNumero;
    
    let totalFactura = pedidos.reduce((acc, p) => acc + (p.cantidad * p.precio), 0);
    
    let totalTicketElem = document.getElementById("totalTicket");
    if (totalTicketElem) {
        totalTicketElem.textContent = "Total a pagar: $" + totalFactura;
    }
    
    let factura = {
        fecha: new Date().toLocaleString(),
        numero: siguienteNumero,
        items: [...pedidos],
        total: totalFactura
    };

    historial.push(factura);
    localStorage.setItem("facturas", JSON.stringify(historial));
    mostrarHistorial();

    let ticketElem = document.getElementById("ticket");
    if (ticketElem) {
        let contenido = ticketElem.innerHTML;
        let ventana = window.open("", "", "width=300,height=600");
        ventana.document.write(`<html><body>${contenido}</body></html>`);
        ventana.document.close();
        ventana.print();
    }
}

/**
 * Muestra el listado histórico de facturas emitidas almacenadas en el navegador.
 */
function mostrarHistorial() {
    let historial = JSON.parse(localStorage.getItem("facturas")) || [];
    let listaHistorial = document.getElementById("historial");
    if (!listaHistorial) return;
    
    listaHistorial.innerHTML = "";

    historial.forEach(function(factura) {
        let li = document.createElement("li");
        li.textContent = "Factura #" + factura.numero + " | " + factura.fecha + " | Total: $" + factura.total;
        li.style.cursor = "pointer";
        li.onclick = function() {
            verDetalleFactura(factura);
        };
        listaHistorial.appendChild(li);
    });
}

/**
 * Limpia por completo el historial de facturación del almacenamiento local.
 */
function limpiarFacturas() {
    localStorage.removeItem("facturas");
    location.reload();
}

/**
 * Despliega una alerta emergente con el desglose detallado de una factura específica del historial.
 * @param {Object} factura - Objeto que contiene los datos de la factura seleccionada.
 */
function verDetalleFactura(factura) {
    let detalle = "FACTURA #" + factura.numero + "\n";
    detalle += "Fecha: " + factura.fecha + "\n\n";

    factura.items.forEach(function(item) {
        let subtotal = item.cantidad * item.precio;
        detalle += item.nombre + " x " + item.cantidad + " = $" + subtotal + "\n";
    });

    detalle += "\nTOTAL: $" + factura.total;
    alert(detalle);
}

// --- 6. MÓDULO DE CATÁLOGO Y VALIDACIONES ---
/**
 * Notifica al usuario la adición de un producto desde el catálogo general.
 * @param {string} producto - Nombre del producto seleccionado.
 */
function agregarAlPedido(producto) {
    alert("¡" + producto + " agregado a su orden!");
}

// Validación de formulario de registro de clientes o pedidos
document.getElementById('orderForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const cliente = document.getElementById('nombre').value;
    alert("¡Pedido registrado exitosamente para: " + cliente + "!");
});
