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
    ["tAnos","tMeses","tDias"].forEach(function(id){
        setDisabled(id, disabled);
    });
}

// ==========================
//  LÓGICA AL CARGAR LA PÁGINA
// ==========================
document.addEventListener("DOMContentLoaded", function () {

    // ==========================
    //   CONFIGURAR CAMPOS (M,C,I,i,t)
    // ==========================
    var selectTipo = document.getElementById("tipoCalculo");
    if (selectTipo) {

        function actualizarCamposPorTipo() {
            var tipo = selectTipo.value;

            // Primero habilitamos todo
            setDisabled("capitalInput", false);
            setDisabled("montoInput", false);
            setDisabled("interesInput", false);
            setDisabled("tasaValor", false);
            setDisabledTiempo(false);

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
                    // Calcular i => NO escribo tasa ni I
                    setDisabled("tasaValor", true);
                    setDisabled("interesInput", true);
                    break;

                case "tiempo":
                    // Calcular t => NO escribo t ni I
                    setDisabledTiempo(true);
                    setDisabled("interesInput", true);
                    break;
            }
        }

        // Ejecutar al cargar
        actualizarCamposPorTipo();

        // Ejecutar cada vez que cambia la opción
        selectTipo.addEventListener("change", actualizarCamposPorTipo);
    }

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
            var t = tiempoDesglosadoAnios(tA, tM, tD);

            var resultBox = document.getElementById("resultadoInteres");
            var detalleBox = document.getElementById("detalleFormulaInteres");

            resultBox.classList.add("d-none");
            if (detalleBox) detalleBox.innerText = "";

            try {
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
                        if (isNaN(C) || isNaN(M) || isNaN(t) || t <= 0) {
                            throw "Para calcular la tasa (i) necesitas Capital (C), Monto (M) y Tiempo (t).";
                        }
                        i = (M / C - 1) / t;
                        I = M - C;
                        detalleBox.innerText =
                            "i = (M / C − 1) / t\n" +
                            "i = (" + M.toFixed(2) + " / " + C.toFixed(2) + " − 1) / " + t.toFixed(6);
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
                var tAnios = t;
                var totalDias = tAnios * 360;
                var anios = Math.floor(totalDias / 360);
                var diasRestantes = totalDias % 360;
                var meses = Math.floor(diasRestantes / 30);
                var dias = Math.round(diasRestantes % 30);

                var desglose = anios + " años, " + meses + " meses, " + dias + " días (aprox.)";

                // Mostrar resultados
                document.getElementById("resCapital").innerText = formatMoney(C);
                document.getElementById("resMonto").innerText = formatMoney(M);
                document.getElementById("resInteres").innerText = formatMoney(I);
                document.getElementById("resTasa").innerText = formatPercent(i);
                document.getElementById("resTiempoAnios").innerText = tAnios.toFixed(6) + " años";
                document.getElementById("resTiempoDesglosado").innerText = desglose;

                resultBox.classList.remove("d-none");

                Swal.fire({
                    icon: "success",
                    title: "Cálculo realizado",
                    showConfirmButton: false,
                    timer: 1100
                });

            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Datos incompletos",
                    text: error
                });
            }
        });

        btnLimpiarInteres.addEventListener("click", function () {
            ["capitalInput","montoInput","interesInput","tasaValor",
             "tAnos","tMeses","tDias"].forEach(function(id) {
                var el = document.getElementById(id);
                if (el && !el.disabled) {
                    el.value = "";
                }
            });
            var resultBox = document.getElementById("resultadoInteres");
            if (resultBox) resultBox.classList.add("d-none");
        });
    }

    // ==========================
    //   DESCUENTO SIMPLE
    // ==========================
    var btnCalcularDescuento = document.getElementById("btnCalcularDescuento");
    var btnLimpiarDescuento = document.getElementById("btnLimpiarDescuento");

    if (btnCalcularDescuento && btnLimpiarDescuento) {
        btnCalcularDescuento.addEventListener("click", function () {
            var tipo = document.getElementById("tipoDescuento").value;

            var M = parseFloat(document.getElementById("MDesc").value);

            var dValor = parseFloat(document.getElementById("dDescValor").value);
            var dPeriodo = document.getElementById("dDescPeriodo").value;
            var d = tasaAPeriodoAnual(dValor, dPeriodo); // descuento anual (decimal)

            var tA = parseFloat(document.getElementById("tDescAnos").value);
            var tM = parseFloat(document.getElementById("tDescMeses").value);
            var tD = parseFloat(document.getElementById("tDescDias").value);
            var t = tiempoDesglosadoAnios(tA, tM, tD);   // tiempo en años

            var resultBox = document.getElementById("resultadoDescuento");
            var detalleBox = document.getElementById("detalleFormulaDescuento");

            resultBox.classList.add("d-none");
            if (detalleBox) detalleBox.innerText = "";

            if (isNaN(M) || isNaN(d) || isNaN(t) || t <= 0) {
                Swal.fire({
                    icon: "warning",
                    title: "Faltan datos",
                    text: "Completa M, d y t correctamente para calcular el descuento."
                });
                return;
            }

            var C, D;

            if (tipo === "comercial") {
                // Descuento comercial: D = M d t, C = M - D
                D = M * d * t;
                C = M - D;
                detalleBox.innerText =
                    "Descuento comercial:\n" +
                    "D = M · d · t\n" +
                    "D = " + M.toFixed(2) + " · " + d.toFixed(6) + " · " + t.toFixed(6) +
                    "\nC = M − D";
            } else {
                // Descuento real: M = C (1 + d t) → C = M / (1 + d t), D = M - C
                C = M / (1 + d * t);
                D = M - C;
                detalleBox.innerText =
                    "Descuento real (justo):\n" +
                    "M = C (1 + d · t)  ⇒  C = M / (1 + d · t)\n" +
                    "C = " + M.toFixed(2) + " / (1 + " + d.toFixed(6) + " · " + t.toFixed(6) + ")";
            }

            document.getElementById("resDM").innerText = formatMoney(M);
            document.getElementById("resDC").innerText = formatMoney(C);
            document.getElementById("resDD").innerText = formatMoney(D);
            document.getElementById("resDT").innerText = t.toFixed(6) + " años";

            resultBox.classList.remove("d-none");

            Swal.fire({
                icon: "success",
                title: "Descuento calculado",
                showConfirmButton: false,
                timer: 1100
            });
        });

        btnLimpiarDescuento.addEventListener("click", function () {
            ["MDesc","dDescValor","tDescAnos","tDescMeses","tDescDias"].forEach(function(id) {
                var el = document.getElementById(id);
                if (el) el.value = "";
            });
            var resultBox = document.getElementById("resultadoDescuento");
            if (resultBox) resultBox.classList.add("d-none");
        });
    }
});

