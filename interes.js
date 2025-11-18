// ==========================
//  INTERÉS SIMPLE
// ==========================
document.addEventListener("DOMContentLoaded", function () {

    // Configurar qué campos se bloquean según lo que se va a calcular
    var selectTipo = document.getElementById("tipoCalculo");
    if (selectTipo) {
        function actualizarCamposPorTipo() {
            var tipo = selectTipo.value;

            setDisabled("capitalInput", false);
            setDisabled("montoInput", false);
            setDisabled("interesInput", false);
            setDisabled("tasaValor", false);
            setDisabledTiempoSimple(false);

            switch (tipo) {
                case "monto":
                    setDisabled("montoInput", true);
                    setDisabled("interesInput", true);
                    break;
                case "capital":
                    setDisabled("capitalInput", true);
                    setDisabled("interesInput", true);
                    break;
                case "interes":
                    setDisabled("montoInput", true);
                    setDisabled("interesInput", true);
                    break;
                case "tasa":
                    setDisabled("tasaValor", true);
                    setDisabled("interesInput", true);
                    break;
                case "tiempo":
                    setDisabledTiempoSimple(true);
                    setDisabled("interesInput", true);
                    break;
            }
        }

        actualizarCamposPorTipo();
        selectTipo.addEventListener("change", actualizarCamposPorTipo);
    }

    var btnCalcularInteres = document.getElementById("btnCalcularInteres");
    var btnLimpiarInteres = document.getElementById("btnLimpiarInteres");

    if (!btnCalcularInteres || !btnLimpiarInteres) return;

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
        var t = tiempoDesglosadoAnios(tA, tM, tD);   // años

        var resultBox = document.getElementById("resultadoInteres");
        var detalleBox = document.getElementById("detalleFormulaInteres");

        resultBox.classList.add("d-none");
        if (detalleBox) detalleBox.innerText = "";

        try {
            switch (tipo) {

                // ================== CALCULAR M ==================
                case "monto":
                    if (isNaN(C) || isNaN(i) || isNaN(t) || t <= 0) {
                        throw "Para calcular el monto (M) necesitas Capital (C), Tasa y Tiempo.";
                    }
                    I = C * i * t;
                    M = C + I;

                    detalleBox.innerText =
                        "Cálculo del monto (M):\n" +
                        "M = C (1 + i · t)\n" +
                        "M = " + C.toFixed(2) + " · (1 + " + i.toFixed(6) + " · " + t.toFixed(6) + ")\n" +
                        "M = " + M.toFixed(2) +
                        "\n\nI = M − C\n" +
                        "I = " + M.toFixed(2) + " − " + C.toFixed(2) + "\n" +
                        "I = " + I.toFixed(2);
                    break;

                // ================== CALCULAR C ==================
                case "capital":
                    if (isNaN(M) || isNaN(i) || isNaN(t) || t <= 0) {
                        throw "Para calcular el capital (C) necesitas Monto (M), Tasa y Tiempo.";
                    }
                    C = M / (1 + i * t);
                    I = M - C;

                    detalleBox.innerText =
                        "Cálculo del capital (C):\n" +
                        "C = M / (1 + i · t)\n" +
                        "C = " + M.toFixed(2) + " / (1 + " + i.toFixed(6) + " · " + t.toFixed(6) + ")\n" +
                        "C = " + C.toFixed(2) +
                        "\n\nI = M − C\n" +
                        "I = " + M.toFixed(2) + " − " + C.toFixed(2) + "\n" +
                        "I = " + I.toFixed(2);
                    break;

                // ================== CALCULAR I ==================
                case "interes":
                    if (isNaN(C) || isNaN(i) || isNaN(t) || t <= 0) {
                        throw "Para calcular el interés (I) necesitas Capital (C), Tasa y Tiempo.";
                    }
                    I = C * i * t;
                    M = C + I;

                    detalleBox.innerText =
                        "Cálculo del interés (I):\n" +
                        "I = C · i · t\n" +
                        "I = " + C.toFixed(2) + " · " + i.toFixed(6) + " · " + t.toFixed(6) + "\n" +
                        "I = " + I.toFixed(2) +
                        "\n\nM = C + I\n" +
                        "M = " + C.toFixed(2) + " + " + I.toFixed(2) + "\n" +
                        "M = " + M.toFixed(2);
                    break;

                // ================== CALCULAR i ==================
                case "tasa":
                    if (isNaN(C) || isNaN(M) || isNaN(t) || t <= 0) {
                        throw "Para calcular la tasa (i) necesitas Capital (C), Monto (M) y Tiempo (t).";
                    }
                    i = (M / C - 1) / t;
                    I = M - C;

                    detalleBox.innerText =
                        "Cálculo de la tasa simple (i):\n" +
                        "i = (M / C − 1) / t\n" +
                        "i = (" + M.toFixed(2) + " / " + C.toFixed(2) +
                        " − 1) / " + t.toFixed(6) + "\n" +
                        "i = " + i.toFixed(6) + " (decimal)\n" +
                        "i = " + formatPercent(i);
                    break;

                // ================== CALCULAR t ==================
                case "tiempo":
                    if (isNaN(C) || isNaN(M) || isNaN(i) || i <= 0) {
                        throw "Para calcular el tiempo (t) necesitas Capital (C), Monto (M) y Tasa (i).";
                    }
                    t = (M / C - 1) / i;
                    I = M - C;

                    var desg = desglosarTiempo360(t);

                    detalleBox.innerText =
                        "Cálculo del tiempo (t):\n" +
                        "t = (M / C − 1) / i\n" +
                        "t = (" + M.toFixed(2) + " / " + C.toFixed(2) +
                        " − 1) / " + i.toFixed(6) + "\n" +
                        "t = " + t.toFixed(6) + " años\n" +
                        "t ≈ " + desg.texto +
                        "\n\nI = M − C\n" +
                        "I = " + M.toFixed(2) + " − " + C.toFixed(2) +
                        "\nI = " + I.toFixed(2);
                    break;
            }

            // Desglose de tiempo en la parte de resultados
            var desglose = desglosarTiempo360(t);

            document.getElementById("resCapital").innerText = formatMoney(C);
            document.getElementById("resMonto").innerText = formatMoney(M);
            document.getElementById("resInteres").innerText = formatMoney(I);
            document.getElementById("resTasa").innerText = formatPercent(i);
            document.getElementById("resTiempoAnios").innerText = t.toFixed(6) + " años";
            document.getElementById("resTiempoDesglosado").innerText = desglose.texto;

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
            if (el && !el.disabled) el.value = "";
        });
        var resultBox = document.getElementById("resultadoInteres");
        if (resultBox) resultBox.classList.add("d-none");
    });
});
