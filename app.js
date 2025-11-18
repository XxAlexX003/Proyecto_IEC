// ==========================
//  UTILIDADES GENERALES
// ==========================
function tiempoDesglosadoAnios(anios, meses, dias) {
    var a = Number(anios);
    var m = Number(meses);
    var d = Number(dias);

    if (isNaN(a)) a = 0;
    if (isNaN(m)) m = 0;
    if (isNaN(d)) d = 0;

    // Usamos año comercial de 360 días
    return a + (m / 12) + (d / 360);
}

function tasaAPeriodoAnual(valorPorciento, periodo) {
    var r = Number(valorPorciento);
    if (isNaN(r) || r < 0) return NaN;

    var dec = r / 100;

    switch (periodo) {
        case "anual":      return dec;
        case "semestral":  return dec * 2;     // 2 semestres por año
        case "trimestral": return dec * 4;     // 4 trimestres
        case "mensual":    return dec * 12;    // 12 meses
        case "diaria360":  return dec * 360;   // 360 días
        case "diaria365":  return dec * 365;   // 365 días
        default:           return dec;
    }
}

function toYears(valor, unidad) {
    var t = Number(valor);
    if (isNaN(t) || t < 0) return NaN;

    switch (unidad) {
        case "anios":   return t;
        case "meses":   return t / 12;
        case "dias360": return t / 360;
        case "dias365": return t / 365;
        default:        return t;
    }
}

function formatMoney(x) {
    return "$" + x.toFixed(2);
}

function formatPercent(i) {
    return (i * 100).toFixed(4) + " %";
}

// ----- Tasa anual y equivalencias -----
var ultimaTasaAnual = null; // siempre en decimal

function tasaDesdeAnual(iAnual, periodo) {
    if (iAnual == null || isNaN(iAnual)) return NaN;

    switch (periodo) {
        case "anual":      return iAnual;
        case "semestral":  return iAnual / 2;
        case "trimestral": return iAnual / 4;
        case "mensual":    return iAnual / 12;
        case "diaria360":  return iAnual / 360;
        case "diaria365":  return iAnual / 365;
        default:           return iAnual;
    }
}

function actualizarTasaEquivalenteResultado() {
    var span = document.getElementById("resTasa");
    var sel = document.getElementById("resTasaPeriodo");
    if (!span || !sel) return;

    if (ultimaTasaAnual == null || isNaN(ultimaTasaAnual)) {
        span.innerText = "";
        return;
    }

    var iMostrar = tasaDesdeAnual(ultimaTasaAnual, sel.value);
    if (isNaN(iMostrar)) {
        span.innerText = "";
    } else {
        span.innerText = formatPercent(iMostrar);
    }
}

// ----- Resaltado del resultado calculado -----
function limpiarResaltado() {
    document.querySelectorAll(".result-highlight").forEach(function (el) {
        el.classList.remove("result-highlight");
    });
}

function marcarResultado(tipo) {
    limpiarResaltado();

    var id = null;
    switch (tipo) {
        case "monto":   id = "resMonto";        break;
        case "capital": id = "resCapital";      break;
        case "interes": id = "resInteres";      break;
        case "tasa":    id = "resTasa";         break;
        case "tiempo":  id = "resTiempoAnios";  break;
    }
    if (id) {
        var el = document.getElementById(id);
        if (el) el.classList.add("result-highlight");
    }
}

// Helper para habilitar / deshabilitar inputs
function setDisabled(id, disabled) {
    var el = document.getElementById(id);
    if (!el) return;
    el.disabled = disabled;
    if (disabled) {
        el.value = ""; // limpiamos si se deshabilita
    }
}

function setDisabledTiempo(disabled) {
    ["tAnos", "tMeses", "tDias"].forEach(function (id) {
        setDisabled(id, disabled);
    });
}

// ==========================
//  LÓGICA AL CARGAR LA PÁGINA
// ==========================
document.addEventListener("DOMContentLoaded", function () {

    // ----- función para bloquear/activar tiempo manual vs fechas -----
    function actualizarModoTiempo() {
        var tipoSelect = document.getElementById("tipoCalculo");
        var tipo = tipoSelect ? tipoSelect.value : "monto";

        var modoRadio = document.querySelector('input[name="modoTiempo"]:checked');
        var modo = modoRadio ? modoRadio.value : "manual";

        // Si estoy calculando t, no debe poder meter tiempo de ninguna forma
        if (tipo === "tiempo") {
            setDisabledTiempo(true);
            setDisabled("fechaInicio", true);
            setDisabled("fechaFin", true);
            return;
        }

        if (modo === "manual") {
            // Manual habilitado, fechas deshabilitadas
            setDisabledTiempo(false);
            setDisabled("fechaInicio", true);
            setDisabled("fechaFin", true);
        } else {
            // Fechas habilitadas, manual deshabilitado
            setDisabledTiempo(true);
            setDisabled("fechaInicio", false);
            setDisabled("fechaFin", false);
        }
    }

    // ==========================
    //   CONFIGURAR CAMPOS (M,C,I,i,t)
    // ==========================
    var selectTipo = document.getElementById("tipoCalculo");
    if (selectTipo) {

        function actualizarCamposPorTipo() {
            var tipo = selectTipo.value;

            // Primero habilitamos todo (luego modoTiempo ajusta)
            setDisabled("capitalInput", false);
            setDisabled("montoInput", false);
            setDisabled("interesInput", false);
            setDisabled("tasaValor", false);
            var selPeriodo = document.getElementById("tasaPeriodo");
            if (selPeriodo) selPeriodo.disabled = false;
            setDisabledTiempo(false);
            setDisabled("fechaInicio", false);
            setDisabled("fechaFin", false);

            // Luego deshabilitamos según el tipo a calcular
            switch (tipo) {
                case "monto":
                    // Calcular M => NO escribo M ni I
                    setDisabled("montoInput", true);
                    setDisabled("interesInput", true);
                    break;

                case "capital":
                    // Calcular C => NO escribo C ni I
                    setDisabled("capitalInput", true);
                    setDisabled("interesInput", true);
                    break;

                case "interes":
                    // Calcular I => NO escribo M ni I
                    setDisabled("montoInput", true);
                    setDisabled("interesInput", true);
                    break;

                case "tasa":
                    // Calcular i => NO escribo tasa ni monto.
                    setDisabled("tasaValor", true);
                    if (selPeriodo) selPeriodo.disabled = true;
                    setDisabled("montoInput", true);
                    // interesInput queda habilitado
                    break;

                case "tiempo":
                    // Calcular t => NO escribo t ni I
                    setDisabledTiempo(true);
                    setDisabled("interesInput", true);
                    // también bloqueamos fechas
                    setDisabled("fechaInicio", true);
                    setDisabled("fechaFin", true);
                    break;
            }

            // actualizar bloqueo manual/fechas
            actualizarModoTiempo();

            // al cambiar tipo, quito resaltado
            limpiarResaltado();
        }

        // Ejecutar al cargar
        actualizarCamposPorTipo();

        // Ejecutar cada vez que cambia la opción
        selectTipo.addEventListener("change", actualizarCamposPorTipo);
    }

    // Listener del selector de periodo en resultados
    var selResPeriodo = document.getElementById("resTasaPeriodo");
    if (selResPeriodo) {
        selResPeriodo.addEventListener("change", actualizarTasaEquivalenteResultado);
    }

    // Listeners para los radios de modo de tiempo
    var radioManual = document.getElementById("modoTiempoManual");
    var radioFechas = document.getElementById("modoTiempoFechas");
    if (radioManual) {
        radioManual.addEventListener("change", actualizarModoTiempo);
    }
    if (radioFechas) {
        radioFechas.addEventListener("change", actualizarModoTiempo);
    }

    // Llamada inicial (por si la página carga con algo raro)
    actualizarModoTiempo();

    // ==========================
    //   INTERÉS SIMPLE
    // ==========================
    var btnCalcularInteres = document.getElementById("btnCalcularInteres");
    var btnLimpiarInteres = document.getElementById("btnLimpiarInteres");

    if (btnCalcularInteres && btnLimpiarInteres) {
        btnCalcularInteres.addEventListener("click", function () {
            var tipo = document.getElementById("tipoCalculo").value;

            var C = parseFloat(document.getElementById("capitalInput").value);
            var M = parseFloat(document.getElementById("montoInput").value);
            var I = parseFloat(document.getElementById("interesInput").value);

            var tasaValor = parseFloat(document.getElementById("tasaValor").value);
            var tasaPeriodo = document.getElementById("tasaPeriodo").value;
            var i = tasaAPeriodoAnual(tasaValor, tasaPeriodo); // decimal anual

            var tA = parseFloat(document.getElementById("tAnos").value);
            var tM = parseFloat(document.getElementById("tMeses").value);
            var tD = parseFloat(document.getElementById("tDias").value);

            // --- Tiempo: manual vs fechas ---
            var modoTiempoRadio = document.querySelector('input[name="modoTiempo"]:checked');
            var modoTiempo = modoTiempoRadio ? modoTiempoRadio.value : "manual";

            var t;                    // tiempo que se usará en las fórmulas (en años, base 360)
            var usoFechas = false;    // para saber si debemos mostrar tiempo real y aproximado
            var diasReal = NaN;
            var tReal365 = NaN;
            var tComercial360 = NaN;

            if (modoTiempo === "fechas" && tipo !== "tiempo") {
                var fechaIniStr = document.getElementById("fechaInicio").value;
                var fechaFinStr = document.getElementById("fechaFin").value;

                if (fechaIniStr && fechaFinStr) {
                    var ini = new Date(fechaIniStr + "T00:00:00");
                    var fin = new Date(fechaFinStr + "T00:00:00");

                    if (isNaN(ini.getTime()) || isNaN(fin.getTime())) {
                        throw "Las fechas ingresadas no son válidas.";
                    }

                    var diffMs = fin - ini;
                    if (diffMs <= 0) {
                        throw "La fecha final debe ser posterior a la fecha inicial.";
                    }

                    diasReal = diffMs / (1000 * 60 * 60 * 24);
                    usoFechas = true;
                    tReal365 = diasReal / 365;
                    tComercial360 = diasReal / 360;

                    // Para las fórmulas principales usamos el tiempo aproximado (360)
                    t = tComercial360;
                } else {
                    // Si no están las dos fechas, caemos al tiempo manual
                    t = tiempoDesglosadoAnios(tA, tM, tD);
                }
            } else {
                // Modo manual o tipo = tiempo (donde no se usa directamente fechas)
                t = tiempoDesglosadoAnios(tA, tM, tD);
            }

            var resultBox = document.getElementById("resultadoInteres");
            var detalleBox = document.getElementById("detalleFormulaInteres");

            resultBox.classList.add("d-none");
            if (detalleBox) detalleBox.innerText = "";

            try {
                // ==========================
                //   CÁLCULOS POR TIPO
                // ==========================
                switch (tipo) {
                    case "monto":
                        if (isNaN(C) || isNaN(i) || isNaN(t) || t <= 0) {
                            throw "Para calcular el monto (M) necesitas Capital (C), Tasa y Tiempo.";
                        }
                        I = C * i * t;
                        M = C + I;
                        detalleBox.innerText =
                            "M = C (1 + i · t)\n" +
                            "M = " + C.toFixed(2) + " · (1 + " + i.toFixed(6) + " · " + t.toFixed(6) + ")";
                        break;

                    case "capital":
                        if (isNaN(M) || isNaN(i) || isNaN(t) || t <= 0) {
                            throw "Para calcular el capital (C) necesitas Monto (M), Tasa y Tiempo.";
                        }
                        C = M / (1 + i * t);
                        I = M - C;
                        detalleBox.innerText =
                            "C = M / (1 + i · t)\n" +
                            "C = " + M.toFixed(2) + " / (1 + " + i.toFixed(6) + " · " + t.toFixed(6) + ")";
                        break;

                    case "interes":
                        if (isNaN(C) || isNaN(i) || isNaN(t) || t <= 0) {
                            throw "Para calcular el interés (I) necesitas Capital (C), Tasa y Tiempo.";
                        }
                        I = C * i * t;
                        M = C + I;
                        detalleBox.innerText =
                            "I = C · i · t\n" +
                            "I = " + C.toFixed(2) + " · " + i.toFixed(6) + " · " + t.toFixed(6);
                        break;

                    case "tasa":
                        // Calcular i con i = I / (C · t).
                        if (isNaN(C) || isNaN(t) || t <= 0) {
                            throw "Para calcular la tasa (i) necesitas Capital (C), Tiempo (t) y el Interés (I).";
                        }
                        if (isNaN(I) || I <= 0) {
                            throw "Proporciona el Interés total (I) positivo para calcular la tasa.";
                        }

                        i = I / (C * t);
                        M = C + I;

                        detalleBox.innerText =
                            "i = I / (C · t)\n" +
                            "i = " + I.toFixed(2) + " / (" + C.toFixed(2) + " · " + t.toFixed(6) + ")";
                        break;

                    case "tiempo":
                        if (isNaN(C) || isNaN(M) || isNaN(i) || i <= 0) {
                            throw "Para calcular el tiempo (t) necesitas Capital (C), Monto (M) y Tasa (i).";
                        }
                        t = (M / C - 1) / i;
                        I = M - C;
                        detalleBox.innerText =
                            "t = (M / C − 1) / i\n" +
                            "t = (" + M.toFixed(2) + " / " + C.toFixed(2) + " − 1) / " + i.toFixed(6);
                        break;
                }

                // Desglose de tiempo en años/meses/días aproximados (año de 360 días)
                var tAniosParaDesglose = t;
                var totalDias = tAniosParaDesglose * 360;
                var anios = Math.floor(totalDias / 360);
                var diasRestantes = totalDias % 360;
                var meses = Math.floor(diasRestantes / 30);
                var dias = Math.round(diasRestantes % 30);
                var desglose = anios + " años, " + meses + " meses, " + dias + " días (aprox.)";

                // Guardar tasa anual y actualizar según periodo elegido
                ultimaTasaAnual = i;
                actualizarTasaEquivalenteResultado();

                // Mostrar resultados numéricos
                document.getElementById("resCapital").innerText = formatMoney(C);
                document.getElementById("resMonto").innerText = formatMoney(M);
                document.getElementById("resInteres").innerText = formatMoney(I);

                // Mostrar tiempos
                if (usoFechas && !isNaN(tReal365) && !isNaN(tComercial360) && !isNaN(diasReal)) {
                    document.getElementById("resTiempoAnios").innerText =
                        tReal365.toFixed(6) + " años (tiempo real, 365 días ≈ " +
                        diasReal.toFixed(0) + " días)";
                    document.getElementById("resTiempoDesglosado").innerText =
                        tComercial360.toFixed(6) + " años (tiempo aproximado, 360 días) ≈ " +
                        desglose;
                } else {
                    document.getElementById("resTiempoAnios").innerText =
                        tAniosParaDesglose.toFixed(6) + " años";
                    document.getElementById("resTiempoDesglosado").innerText = desglose;
                }

                resultBox.classList.remove("d-none");

                // marcar cuál fue calculado
                marcarResultado(tipo);

                Swal.fire({
                    icon: "success",
                    title: "Cálculo realizado",
                    showConfirmButton: false,
                    timer: 1100
                });

            } catch (error) {
                limpiarResaltado();
                Swal.fire({
                    icon: "error",
                    title: "Datos incompletos",
                    text: error
                });
            }
        });

        btnLimpiarInteres.addEventListener("click", function () {
            ["capitalInput", "montoInput", "interesInput", "tasaValor",
                "tAnos", "tMeses", "tDias",
                "fechaInicio", "fechaFin"].forEach(function (id) {
                var el = document.getElementById(id);
                if (el && !el.disabled) {
                    el.value = "";
                }
            });

            // Reset de tasa en resultados
            ultimaTasaAnual = null;
            var selResPeriodo2 = document.getElementById("resTasaPeriodo");
            if (selResPeriodo2) selResPeriodo2.value = "anual";
            var spanTasa = document.getElementById("resTasa");
            if (spanTasa) spanTasa.innerText = "";

            var resultBox = document.getElementById("resultadoInteres");
            if (resultBox) resultBox.classList.add("d-none");

            // Dejo el modo de tiempo en manual por defecto
            var radioManual2 = document.getElementById("modoTiempoManual");
            var radioFechas2 = document.getElementById("modoTiempoFechas");
            if (radioManual2) radioManual2.checked = true;
            if (radioFechas2) radioFechas2.checked = false;
            actualizarModoTiempo();

            limpiarResaltado();
        });
    }
});

