// Configuración de niveles
const NIVELES_CONFIG = {
    1: { porcentaje: 10, tope: 750 },
    2: { porcentaje: 15, tope: 2000 },
    3: { porcentaje: 20, tope: 3500 },
    4: { porcentaje: 25, tope: 7000 },
};

const VENTAS_QR_CONFIG = {
    porcentaje: 70,
    tope: 9000,
};

// Variables globales
let nivel = "";
let monto = "";
let aplicarVentasQR = false;
let pagoDividido = false;
let pago1 = "";
let mostrarCalculos = false;
let calculando = false;

// Elementos del DOM
const elementos = {
    nivel: document.getElementById('nivel'),
    monto: document.getElementById('monto'),
    ventasQR: document.getElementById('ventasQR'),
    pagoDividido: document.getElementById('pagoDividido'),
    pagoDivididoSection: document.getElementById('pagoDivididoSection'),
    pago1: document.getElementById('pago1'),
    pago1Error: document.getElementById('pago1Error'),
    pago2Info: document.getElementById('pago2Info'),
    optimizarPago: document.getElementById('optimizarPago'),
    calcularBtn: document.getElementById('calcularBtn'),
    resultados: document.getElementById('resultados'),
    resultadoCompleto: document.getElementById('resultadoCompleto'),
    resultadoDividido: document.getElementById('resultadoDividido'),
    descargarBtn: document.getElementById('descargarBtn'),
    
    // Elementos de resultados completos
    facturaPersonal: document.getElementById('facturaPersonal'),
    reintegroNivelLabel: document.getElementById('reintegroNivelLabel'),
    reintegroNivel: document.getElementById('reintegroNivel'),
    reintegroQR: document.getElementById('reintegroQR'),
    pagoFinal: document.getElementById('pagoFinal'),
    totalAhorrado: document.getElementById('totalAhorrado'),
    
    // Elementos de resultados divididos
    montoPago1: document.getElementById('montoPago1'),
    reintegroNivelPago1Label: document.getElementById('reintegroNivelPago1Label'),
    reintegroNivelPago1: document.getElementById('reintegroNivelPago1'),
    reintegroQRPago1: document.getElementById('reintegroQRPago1'),
    pagoParcial1: document.getElementById('pagoParcial1'),
    montoPago2: document.getElementById('montoPago2'),
    reintegroNivelPago2Label: document.getElementById('reintegroNivelPago2Label'),
    reintegroNivelPago2: document.getElementById('reintegroNivelPago2'),
    reintegroQRPago2: document.getElementById('reintegroQRPago2'),
    pagoParcial2: document.getElementById('pagoParcial2'),
    pagoFinalDividido: document.getElementById('pagoFinalDividido'),
    totalAhorradoDividido: document.getElementById('totalAhorradoDividido'),
};

// Funciones de utilidad
function formatearNumero(valor) {
    const numero = valor.replace(/[^\d,]/g, "");
    const partes = numero.split(",");
    const entero = partes[0];
    const decimal = partes[1];

    const enteroFormateado = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return decimal !== undefined ? `${enteroFormateado},${decimal.slice(0, 2)}` : enteroFormateado;
}

function stringANumero(str) {
    return Number.parseFloat(str.replace(/\./g, "").replace(",", ".")) || 0;
}

function numeroAString(num) {
    return num.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function validarFormulario() {
    const montoNumerico = stringANumero(monto);
    const pago1Numerico = stringANumero(pago1);
    
    const nivelValido = nivel !== "";
    const montoValido = montoNumerico > 0;
    const pagoDivididoValido = !pagoDividido || (pago1Numerico > 0 && pago1Numerico <= montoNumerico);
    
    return nivelValido && montoValido && pagoDivididoValido;
}

function actualizarBotonCalcular() {
    elementos.calcularBtn.disabled = !validarFormulario();
}

// Event listeners
elementos.nivel.addEventListener('change', (e) => {
    nivel = e.target.value;
    mostrarCalculos = false;
    elementos.resultados.style.display = 'none';
    actualizarBotonCalcular();
});

elementos.monto.addEventListener('input', (e) => {
    const valor = e.target.value;
    monto = formatearNumero(valor);
    e.target.value = monto;
    mostrarCalculos = false;
    elementos.resultados.style.display = 'none';
    actualizarBotonCalcular();
    actualizarPago2Info();
});

elementos.ventasQR.addEventListener('change', (e) => {
    aplicarVentasQR = e.target.checked;
    mostrarCalculos = false;
    elementos.resultados.style.display = 'none';
    actualizarBotonCalcular();
});

elementos.pagoDividido.addEventListener('change', (e) => {
    pagoDividido = e.target.checked;
    elementos.pagoDivididoSection.style.display = pagoDividido ? 'block' : 'none';
    mostrarCalculos = false;
    elementos.resultados.style.display = 'none';
    actualizarBotonCalcular();
});

elementos.pago1.addEventListener('input', (e) => {
    const valor = e.target.value;
    pago1 = formatearNumero(valor);
    e.target.value = pago1;
    mostrarCalculos = false;
    elementos.resultados.style.display = 'none';
    actualizarBotonCalcular();
    actualizarPago2Info();
    validarPago1();
});

elementos.optimizarPago.addEventListener('click', optimizarPago);
elementos.calcularBtn.addEventListener('click', calcular);
elementos.descargarBtn.addEventListener('click', descargarComprobante);

// Funciones principales
function optimizarPago() {
    if (!aplicarVentasQR || !stringANumero(monto)) return;

    const montoMaximoPago1 = VENTAS_QR_CONFIG.tope / (VENTAS_QR_CONFIG.porcentaje / 100);
    const pago1Optimo = Math.min(montoMaximoPago1, stringANumero(monto));

    pago1 = numeroAString(pago1Optimo);
    elementos.pago1.value = pago1;
    actualizarPago2Info();
    validarPago1();
    actualizarBotonCalcular();
}

function actualizarPago2Info() {
    const montoNumerico = stringANumero(monto);
    const pago1Numerico = stringANumero(pago1);
    
    if (pago1Numerico > 0 && montoNumerico > 0 && pago1Numerico <= montoNumerico) {
        const pago2Numerico = montoNumerico - pago1Numerico;
        elementos.pago2Info.textContent = `Pago 2 será: $${numeroAString(pago2Numerico)}`;
        elementos.pago2Info.style.display = 'block';
    } else {
        elementos.pago2Info.style.display = 'none';
    }
}

function validarPago1() {
    const montoNumerico = stringANumero(monto);
    const pago1Numerico = stringANumero(pago1);
    
    if (pago1Numerico > montoNumerico && montoNumerico > 0) {
        elementos.pago1Error.textContent = `⚠️ El Pago 1 no puede ser mayor al monto total de la factura ($${numeroAString(montoNumerico)})`;
        elementos.pago1Error.style.display = 'block';
    } else {
        elementos.pago1Error.style.display = 'none';
    }
}

async function calcular() {
    if (!validarFormulario()) return;
    
    calculando = true;
    elementos.calcularBtn.classList.add('loading');
    elementos.calcularBtn.disabled = true;
    
    // Simular delay de cálculo
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    mostrarCalculos = true;
    elementos.resultados.style.display = 'block';
    
    const montoNumerico = stringANumero(monto);
    const nivelSeleccionado = NIVELES_CONFIG[nivel];
    
    if (!pagoDividido) {
        calcularPagoCompleto(montoNumerico, nivelSeleccionado);
    } else {
        calcularPagoDividido(montoNumerico, nivelSeleccionado);
    }
    
    calculando = false;
    elementos.calcularBtn.classList.remove('loading');
    elementos.calcularBtn.disabled = false;
}

function calcularPagoCompleto(montoNumerico, nivelSeleccionado) {
    elementos.resultadoCompleto.style.display = 'block';
    elementos.resultadoDividido.style.display = 'none';
    
    const reintegroPorNivel = Math.min(montoNumerico * (nivelSeleccionado.porcentaje / 100), nivelSeleccionado.tope);
    const reintegroPorQR = aplicarVentasQR ? Math.min(montoNumerico * (VENTAS_QR_CONFIG.porcentaje / 100), VENTAS_QR_CONFIG.tope) : 0;
    const totalReintegro = reintegroPorNivel + reintegroPorQR;
    const pagoFinal = montoNumerico - totalReintegro;
    const porcentajeAhorro = (totalReintegro / montoNumerico) * 100;
    
    elementos.facturaPersonal.textContent = `-$${numeroAString(montoNumerico)}`;
    elementos.reintegroNivelLabel.textContent = `Reintegro por Nivel ${nivel}`;
    elementos.reintegroNivel.textContent = `+$${numeroAString(reintegroPorNivel)}`;
    elementos.reintegroQR.textContent = `+$${numeroAString(reintegroPorQR)}`;
    elementos.pagoFinal.textContent = `$${numeroAString(pagoFinal)}`;
    elementos.totalAhorrado.textContent = `$${numeroAString(totalReintegro)} (${porcentajeAhorro.toFixed(0)}%)`;
}

function calcularPagoDividido(montoNumerico, nivelSeleccionado) {
    elementos.resultadoCompleto.style.display = 'none';
    elementos.resultadoDividido.style.display = 'block';
    
    const pago1Numerico = stringANumero(pago1);
    const pago2Numerico = montoNumerico - pago1Numerico;
    
    // Cálculos para Pago 1
    const reintegroPorNivelPago1 = Math.min(pago1Numerico * (nivelSeleccionado.porcentaje / 100), nivelSeleccionado.tope);
    const reintegroPorQRPago1 = aplicarVentasQR ? Math.min(pago1Numerico * (VENTAS_QR_CONFIG.porcentaje / 100), VENTAS_QR_CONFIG.tope) : 0;
    const pagoFinalPago1 = pago1Numerico - reintegroPorNivelPago1 - reintegroPorQRPago1;
    
    // Cálculos para Pago 2
    const reintegroPorNivelPago2 = Math.min(pago2Numerico * (nivelSeleccionado.porcentaje / 100), nivelSeleccionado.tope);
    const reintegroPorQRPago2 = aplicarVentasQR ? Math.min(pago2Numerico * (VENTAS_QR_CONFIG.porcentaje / 100), VENTAS_QR_CONFIG.tope) : 0;
    const pagoFinalPago2 = pago2Numerico - reintegroPorNivelPago2 - reintegroPorQRPago2;
    
    // Totales
    const pagoFinalDividido = pagoFinalPago1 + pagoFinalPago2;
    const totalAhorradoDividido = reintegroPorNivelPago1 + reintegroPorQRPago1 + reintegroPorNivelPago2 + reintegroPorQRPago2;
    const porcentajeDividido = (totalAhorradoDividido / montoNumerico) * 100;
    
    // Actualizar elementos Pago 1
    elementos.montoPago1.textContent = `-$${numeroAString(pago1Numerico)}`;
    elementos.reintegroNivelPago1Label.textContent = `Reintegro por Nivel ${nivel}`;
    elementos.reintegroNivelPago1.textContent = `+$${numeroAString(reintegroPorNivelPago1)}`;
    elementos.reintegroQRPago1.textContent = `+$${numeroAString(reintegroPorQRPago1)}`;
    elementos.pagoParcial1.textContent = `$${numeroAString(pagoFinalPago1)}`;
    
    // Actualizar elementos Pago 2
    elementos.montoPago2.textContent = `-$${numeroAString(pago2Numerico)}`;
    elementos.reintegroNivelPago2Label.textContent = `Reintegro por Nivel ${nivel}`;
    elementos.reintegroNivelPago2.textContent = `+$${numeroAString(reintegroPorNivelPago2)}`;
    elementos.reintegroQRPago2.textContent = `+$${numeroAString(reintegroPorQRPago2)}`;
    elementos.pagoParcial2.textContent = `$${numeroAString(pagoFinalPago2)}`;
    
    // Totales
    elementos.pagoFinalDividido.textContent = `$${numeroAString(pagoFinalDividido)}`;
    elementos.totalAhorradoDividido.textContent = `$${numeroAString(totalAhorradoDividido)} (${porcentajeDividido.toFixed(0)}%)`;
}

function descargarComprobante() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Configurar fuente y tamaño
    doc.setFont("courier", "normal");
    doc.setFontSize(10);
    
    const fechaHora = new Date().toLocaleString("es-AR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
    
    let yPosition = 20;
    const lineHeight = 5;
    
    const formatearNumeroAlineado = (numero, ancho = 12) => {
        const numeroStr = numeroAString(numero);
        return numeroStr.padStart(ancho, " ");
    };
    
    const addCenteredText = (text, fontSize = 10) => {
        doc.setFontSize(fontSize);
        const textWidth = doc.getTextWidth(text);
        const pageWidth = doc.internal.pageSize.width;
        const x = (pageWidth - textWidth) / 2;
        doc.text(text, x, yPosition);
        yPosition += lineHeight;
    };
    
    const addLineWithAmount = (label, amount, prefix = "$") => {
        const formattedAmount = formatearNumeroAlineado(amount);
        const line = `${label.padEnd(22, ".")} ${prefix}${formattedAmount}`;
        doc.text(line, 20, yPosition);
        yPosition += lineHeight;
    };
    
    const addLine = (text) => {
        doc.text(text, 20, yPosition);
        yPosition += lineHeight;
    };
    
    // Encabezado del ticket
    addCenteredText("CALCULADORA FACTURA FLOW", 14);
    addCenteredText("========================", 12);
    addLine(`Fecha: ${fechaHora}`);
    yPosition += lineHeight;
    
    addLine("DATOS DE LA FACTURA:");
    addLine("--------------------");
    addLine(`Nivel Personal Pay: ${nivel}`);
    addLineWithAmount("Monto Factura", stringANumero(monto));
    addLine(`Ventas QR: ${aplicarVentasQR ? "Si" : "No"}`);
    addLine(`Pago Dividido: ${pagoDividido ? "Si" : "No"}`);
    yPosition += lineHeight;
    
    const montoNumerico = stringANumero(monto);
    const nivelSeleccionado = NIVELES_CONFIG[nivel];
    
    if (!pagoDividido) {
        const reintegroPorNivel = Math.min(montoNumerico * (nivelSeleccionado.porcentaje / 100), nivelSeleccionado.tope);
        const reintegroPorQR = aplicarVentasQR ? Math.min(montoNumerico * (VENTAS_QR_CONFIG.porcentaje / 100), VENTAS_QR_CONFIG.tope) : 0;
        const totalReintegro = reintegroPorNivel + reintegroPorQR;
        const pagoFinal = montoNumerico - totalReintegro;
        const porcentajeAhorro = (totalReintegro / montoNumerico) * 100;
        
        addLine("PAGO COMPLETO:");
        addLine("--------------");
        addLineWithAmount("Factura Personal", montoNumerico, "-$");
        addLineWithAmount(`Reintegro Nivel ${nivel}`, reintegroPorNivel, "+$");
        addLineWithAmount("Reintegro Ventas QR", reintegroPorQR, "+$");
        addLine("------------------------");
        addLineWithAmount("PAGO FINAL", pagoFinal);
        addLine(`TOTAL AHORRADO........ ${formatearNumeroAlineado(totalReintegro)} (${porcentajeAhorro.toFixed(0)}%)`);
    } else {
        const pago1Numerico = stringANumero(pago1);
        const pago2Numerico = montoNumerico - pago1Numerico;
        
        const reintegroPorNivelPago1 = Math.min(pago1Numerico * (nivelSeleccionado.porcentaje / 100), nivelSeleccionado.tope);
        const reintegroPorQRPago1 = aplicarVentasQR ? Math.min(pago1Numerico * (VENTAS_QR_CONFIG.porcentaje / 100), VENTAS_QR_CONFIG.tope) : 0;
        const pagoFinalPago1 = pago1Numerico - reintegroPorNivelPago1 - reintegroPorQRPago1;
        
        const reintegroPorNivelPago2 = Math.min(pago2Numerico * (nivelSeleccionado.porcentaje / 100), nivelSeleccionado.tope);
        const reintegroPorQRPago2 = aplicarVentasQR ? Math.min(pago2Numerico * (VENTAS_QR_CONFIG.porcentaje / 100), VENTAS_QR_CONFIG.tope) : 0;
        const pagoFinalPago2 = pago2Numerico - reintegroPorNivelPago2 - reintegroPorQRPago2;
        
        const pagoFinalDividido = pagoFinalPago1 + pagoFinalPago2;
        const totalAhorradoDividido = reintegroPorNivelPago1 + reintegroPorQRPago1 + reintegroPorNivelPago2 + reintegroPorQRPago2;
        const porcentajeDividido = (totalAhorradoDividido / montoNumerico) * 100;
        
        addLine("PAGO DIVIDIDO:");
        addLine("--------------");
        addLine("PAGO 1 (Personal Pay):");
        addLineWithAmount("Monto", pago1Numerico, "-$");
        addLineWithAmount(`Reintegro Nivel ${nivel}`, reintegroPorNivelPago1, "+$");
        addLineWithAmount("Reintegro Ventas QR", reintegroPorQRPago1, "+$");
        addLineWithAmount("Pago Parcial 1", pagoFinalPago1);
        yPosition += lineHeight;
        
        addLine("PAGO 2 (Personal Flow):");
        addLineWithAmount("Monto", pago2Numerico, "-$");
        addLineWithAmount(`Reintegro Nivel ${nivel}`, reintegroPorNivelPago2, "+$");
        addLineWithAmount("Reintegro Ventas QR", reintegroPorQRPago2, "+$");
        addLineWithAmount("Pago Parcial 2", pagoFinalPago2);
        yPosition += lineHeight;
        
        addLine("------------------------");
        addLineWithAmount("PAGO FINAL TOTAL", pagoFinalDividido);
        addLine(`TOTAL AHORRADO........ ${formatearNumeroAlineado(totalAhorradoDividido)} (${porcentajeDividido.toFixed(0)}%)`);
    }
    
    yPosition += lineHeight * 2;
    addCenteredText("========================");
    addCenteredText("Gracias por usar");
    addCenteredText("Calculadora Factura Flow");
    addCenteredText("========================");
    
    // Descargar el PDF
    doc.save(`comprobante-factura-flow-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    actualizarBotonCalcular();
});
