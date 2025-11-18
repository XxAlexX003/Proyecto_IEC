// ==========================
//  UTILIDADES GENERALES
// ==========================
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
            setDisabled("tasaInput", false);
            setDisabled("tiempoInput", false);

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
                    // Calcular i => NO escribo i ni I
                    setDisabled("tasaInput", true);
                    setDisabled("interesInput", true);
                    break;

                case "tiempo":
                    // Calcular t => NO escribo t ni I
                    setDisabled("tiempoInput", true);
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
            var iPercent = parseFloat(document.getElementById("tasaInput").value);
            var tInput = parseFloat(document.getElementById("tiempoInput").value);
            var unidad = document.getElementById("unidadTiempo").value;

            var resultBox = document.getElementById("resultadoInteres");
            var detalleBox = document.getElementById("detalleFormulaInteres");

            resultBox.classList.add("d-none");
            if (detalleBox) detalleBox.innerText = "";

            // Convertimos tasa en decimal anual
            var i = isNaN(iPercent) ? NaN : iPercent / 100;
            // Convertimos tiempo a años según unidad
            var t = toYears(tInput, unidad);

            try {
                switch (tipo) {
                    case "monto":
                        if (isNaN(C) || isNaN(i) || isNaN(t)) {
                            throw "Para calcular el monto (M) necesitas Capital (C), Tasa (i) y Tiempo (t).";
                        }
                        I = C * i * t;
                        M = C + I;
                        detalleBox.innerText =
                            "M = C (1 + i · t)\n" +
                            "M = " + C.toFixed(2) + " · (1 + " + i.toFixed(6) + " · " + t.toFixed(6) + ")";
                        break;

                    case "capital":
                        if (isNaN(M) || isNaN(i) || isNaN(t)) {
                            throw "Para calcular el capital (C) necesitas Monto (M), Tasa (i) y Tiempo (t).";
                        }
                        C = M / (1 + i * t);
                        I = M - C;
                        detalleBox.innerText =
                            "C = M / (1 + i · t)\n" +
                            "C = " + M.toFixed(2) + " / (1 + " + i.toFixed(6) + " · " + t.toFixed(6) + ")";
                        break;

                    case "interes":
                        if (isNaN(C) || isNaN(i) || isNaN(t)) {
                            throw "Para calcular el interés (I) necesitas Capital (C), Tasa (i) y Tiempo (t).";
                        }
                        I = C * i * t;
                        M = C + I;
                        detalleBox.innerText =
                            "I = C · i · t\n" +
                            "I = " + C.toFixed(2) + " · " + i.toFixed(6) + " · " + t.toFixed(6);
                        break;

                    case "tasa":
                        if (isNaN(C) || isNaN(M) || isNaN(t)) {
                            throw "Para calcular la tasa (i) necesitas Capital (C), Monto (M) y Tiempo (t).";
                        }
                        i = (M / C - 1) / t;
                        iPercent = i * 100;
                        I = M - C;
                        detalleBox.innerText =
                            "i = (M / C − 1) / t\n" +
                            "i = (" + M.toFixed(2) + " / " + C.toFixed(2) + " − 1) / " + t.toFixed(6);
                        break;

                    case "tiempo":
                        if (isNaN(C) || isNaN(M) || isNaN(i)) {
                            throw "Para calcular el tiempo (t) necesitas Capital (C), Monto (M) y Tasa (i).";
                        }
                        t = (M / C - 1) / i;
                        tInput = t; // en años
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

                // Mensaje de éxito suave (opcional)
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
            ["capitalInput","montoInput","interesInput","tasaInput","tiempoInput"].forEach(function(id) {
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
            var dPercent = parseFloat(document.getElementById("dDesc").value);
            var tInput = parseFloat(document.getElementById("tDesc").value);
            var unidad = document.getElementById("unidadDesc").value;

            var resultBox = document.getElementById("resultadoDescuento");
            var detalleBox = document.getElementById("detalleFormulaDescuento");

            resultBox.classList.add("d-none");
            if (detalleBox) detalleBox.innerText = "";

            var d = isNaN(dPercent) ? NaN : dPercent / 100;
            var t = toYears(tInput, unidad);

            if (isNaN(M) || isNaN(d) || isNaN(t)) {
                Swal.fire({
                    icon: "warning",
                    title: "Faltan datos",
                    text: "Completa M, d y t para calcular el descuento."
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
            ["MDesc","dDesc","tDesc"].forEach(function(id) {
                var el = document.getElementById(id);
                if (el) el.value = "";
            });
            var resultBox = document.getElementById("resultadoDescuento");
            if (resultBox) resultBox.classList.add("d-none");
        });
    }
});
