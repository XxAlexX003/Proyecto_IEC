// ==========================
//  INTERÉS SIMPLE
// ==========================
document.addEventListener("DOMContentLoaded", function () {

    var selectTipo   = document.getElementById("tipoCalculo");
    var radioManual  = document.getElementById("modoTiempoManual");
    var radioFechas  = document.getElementById("modoTiempoFechas");

    // ---------- Helpers para resaltar el resultado calculado ----------
    function limpiarResaltado() {
        ["resCapital", "resMonto", "resInteres", "resTasa", "resTiempoAnios"].forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.classList.remove("result-highlight");
        });
    }

    function resaltarSegunTipo(tipo) {
        limpiarResaltado();
        switch (tipo) {
            case "monto":
                document.getElementById("resMonto").classList.add("result-highlight");
                break;
            case "capital":
                document.getElementById("resCapital").classList.add("result-highlight");
                break;
            case "interes":
                document.getElementById("resInteres").classList.add("result-highlight");
                break;
            case "tasa":
                document.getElementById("resTasa").classList.add("result-highlight");
                break;
            case "tiempo":
                document.getElementById("resTiempoAnios").classList.add("result-highlight");
                break;
        }
    }

    // ---------- Habilitar / deshabilitar tiempo manual vs fechas ----------
    function actualizarModoTiempo() {
        var tipoActual = selectTipo ? selectTipo.value : "monto";

        // Si estoy calculando t, NO se debe ingresar tiempo ni manualmente ni con fechas
        if (tipoActual === "tiempo") {
            setDisabledTiempoSimple(true);
            setDisabled("fechaInicio", true);
            setDisabled("fechaFin", true);
            return;
        }

        // Modo elegido: manual o fechas
        var radioChecked = document.querySelector('input[name="modoTiempo"]:checked');
        var modo = radioChecked ? radioChecked.value : "manual";

        if (modo === "manual") {
            // habilita años/meses/días, bloquea fechas
            setDisabledTiempoSimple(false);
            setDisabled("fechaInicio", true);
            setDisabled("fechaFin", true);
        } else {
            // habilita fechas, bloquea años/meses/días
            setDisabledTiempoSimple(true);
            setDisabled("fechaInicio", false);
            setDisabled("fechaFin", false);
        }
    }

    // ---------- Configurar campos según lo que se va a calcular ----------
    function actualizarCamposPorTipo() {
        if (!selectTipo) return;
        var tipo = selectTipo.value;

        // Habilitamos todo
        setDisabled("capitalInput", false);
        setDisabled("montoInput", false);
        setDisabled("interesInput", false);
        setDisabled("tasaValor", false);
        setDisabledTiempoSimple(false);
        setDisabled("fechaInicio", false);
        setDisabled("fechaFin", false);

        // Luego deshabilitamos según el tipo a calcular
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
                setDisabled("tasaValor", true);   // la tasa se calcula
                setDisabled("interesInput", true);
                break;
            case "tiempo":
                // cuando calculo t, el tiempo NO se mete manual ni por fechas
                setDisabledTiempoSimple(true);
                setDisabled("interesInput", true);
                setDisabled("fechaInicio", true);
                setDisabled("fechaFin", true);
                break;
        }

        // Ajustar también según radio (manual/fechas)
        actualizarModoTiempo();
    }

    if (selectTipo) {
        actualizarCamposPorTipo();
        selectTipo.addEventListener("change", actualizarCamposPorTipo);
    }

    // Listeners de los radios
    if (radioManual) {
        radioManual.addEventListener("change", actualizarModoTiempo);
    }
    if (radioFechas) {
        radioFechas.addEventListener("change", actualizarModoTiempo);
    }

    // ================== LÓGICA DE CÁLCULO ==================
    var btnCalcularInteres = document.getElementById("btnCalcularInteres");
    var btnLimpiarInteres  = document.getElementById("btnLimpiarInteres");

    if (!btnCalcularInteres || !btnLimpiarInteres) return;

    btnCalcularInteres.addEventListener("click", function () {
        // VALIDACIÓN DE AUTENTICACIÓN
        if (!isUserAuthenticated()) {
            Swal.fire({
                icon: 'warning',
                title: 'Autenticación requerida',
                text: 'Debes iniciar sesión para realizar cálculos.',
                confirmButtonText: 'Ir a Login',
                showCancelButton: true,
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = 'login.html';
                }
            });
            return;
        }

        var tipo = document.getElementById("tipoCalculo").value;

        var C = parseFloat(document.getElementById("capitalInput").value);
        var M = parseFloat(document.getElementById("montoInput").value);
        var I = parseFloat(document.getElementById("interesInput").value);

        var tasaValor   = parseFloat(document.getElementById("tasaValor").value);
        var tasaPeriodo = document.getElementById("tasaPeriodo").value;
        var i           = tasaAPeriodoAnual(tasaValor, tasaPeriodo); // decimal anual

        // ---------- TIEMPO: manual o entre fechas ----------
        var radioChecked = document.querySelector('input[name="modoTiempo"]:checked');
        var modoTiempo   = radioChecked ? radioChecked.value : "manual";

        var t; // tiempo en años (base 360) que se usará en las fórmulas

        if (modoTiempo === "fechas" && tipo !== "tiempo") {
            var fIniStr = document.getElementById("fechaInicio").value;
            var fFinStr = document.getElementById("fechaFin").value;

            if (fIniStr && fFinStr) {
                var fIni = new Date(fIniStr + "T00:00:00");
                var fFin = new Date(fFinStr + "T00:00:00");

                if (isNaN(fIni.getTime()) || isNaN(fFin.getTime())) {
                    Swal.fire({
                        icon: "error",
                        title: "Fechas inválidas",
                        text: "Revisa la fecha inicial y la fecha final."
                    });
                    return;
                }

                var diffMs   = fFin - fIni;
                var diffDias = diffMs / (1000 * 60 * 60 * 24); // días reales

                if (diffDias <= 0) {
                    Swal.fire({
                        icon: "error",
                        title: "Fechas inválidas",
                        text: "La fecha final debe ser posterior a la inicial."
                    });
                    return;
                }

                // Para las fórmulas usamos año comercial de 360 días
                t = diffDias / 360;

            } else {
                // Si no están las dos fechas, usamos el tiempo manual
                var tA = parseFloat(document.getElementById("tAnos").value);
                var tM = parseFloat(document.getElementById("tMeses").value);
                var tD = parseFloat(document.getElementById("tDias").value);
                t      = tiempoDesglosadoAnios(tA, tM, tD);
            }
        } else {
            // Modo manual o tipo = "tiempo"
            var tA = parseFloat(document.getElementById("tAnos").value);
            var tM = parseFloat(document.getElementById("tMeses").value);
            var tD = parseFloat(document.getElementById("tDias").value);
            t      = tiempoDesglosadoAnios(tA, tM, tD);
        }
        // ---------- FIN BLOQUE TIEMPO ----------

        var resultBox  = document.getElementById("resultadoInteres");
        var detalleBox = document.getElementById("detalleFormulaInteres");

        resultBox.classList.add("d-none");
        if (detalleBox) detalleBox.innerText = "";

        try {
            switch (tipo) {

                // -------- Calcular M --------
                case "monto":
                    if (isNaN(C) || isNaN(i) || isNaN(t) || t <= 0) {
                        throw "Para calcular el monto (M) necesitas Capital (C), Tasa y Tiempo.";
                    }
                    I = C * i * t;
                    M = C + I;

                    detalleBox.innerText =
                        "Cálculo del monto (M):\n" +
                        "M = C (1 + i · t)\n" +
                        "M = " + C.toFixed(2) + " · (1 + " + i.toFixed(6) +
                        " · " + t.toFixed(6) + ")\n" +
                        "M = " + M.toFixed(2) +
                        "\n\nI = M − C\n" +
                        "I = " + M.toFixed(2) + " − " + C.toFixed(2) +
                        "\nI = " + I.toFixed(2);
                    break;

                // -------- Calcular C --------
                case "capital":
                    if (isNaN(M) || isNaN(i) || isNaN(t) || t <= 0) {
                        throw "Para calcular el capital (C) necesitas Monto (M), Tasa y Tiempo.";
                    }
                    C = M / (1 + i * t);
                    I = M - C;

                    detalleBox.innerText =
                        "Cálculo del capital (C):\n" +
                        "C = M / (1 + i · t)\n" +
                        "C = " + M.toFixed(2) + " / (1 + " + i.toFixed(6) +
                        " · " + t.toFixed(6) + ")\n" +
                        "C = " + C.toFixed(2) +
                        "\n\nI = M − C\n" +
                        "I = " + M.toFixed(2) + " − " + C.toFixed(2) +
                        "\nI = " + I.toFixed(2);
                    break;

                // -------- Calcular I --------
                case "interes":
                    if (isNaN(C) || isNaN(i) || isNaN(t) || t <= 0) {
                        throw "Para calcular el interés (I) necesitas Capital (C), Tasa y Tiempo.";
                    }
                    I = C * i * t;
                    M = C + I;

                    detalleBox.innerText =
                        "Cálculo del interés (I):\n" +
                        "I = C · i · t\n" +
                        "I = " + C.toFixed(2) + " · " + i.toFixed(6) +
                        " · " + t.toFixed(6) + "\n" +
                        "I = " + I.toFixed(2) +
                        "\n\nM = C + I\n" +
                        "M = " + C.toFixed(2) + " + " + I.toFixed(2) +
                        "\nM = " + M.toFixed(2);
                    break;

                // -------- Calcular i --------
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

                // -------- Calcular t --------
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

            var desglose = desglosarTiempo360(t);

            document.getElementById("resCapital").innerText       = formatMoney(C);
            document.getElementById("resMonto").innerText         = formatMoney(M);
            document.getElementById("resInteres").innerText       = formatMoney(I);
            document.getElementById("resTasa").innerText          = formatPercent(i);
            document.getElementById("resTiempoAnios").innerText   = t.toFixed(6) + " años";
            document.getElementById("resTiempoDesglosado").innerText = desglose.texto;

            // Resaltar el valor principal según lo que se está calculando
            resaltarSegunTipo(tipo);

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
         "tAnos","tMeses","tDias","fechaInicio","fechaFin"].forEach(function(id) {
            var el = document.getElementById(id);
            if (el && !el.disabled) el.value = "";
        });

        // volver al modo manual por defecto
        if (radioManual)  radioManual.checked  = true;
        if (radioFechas)  radioFechas.checked  = false;
        actualizarModoTiempo();

        var resultBox = document.getElementById("resultadoInteres");
        if (resultBox) resultBox.classList.add("d-none");

        limpiarResaltado();
        mostrarToastLimpiar();
    });
});