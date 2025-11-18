// ==========================
//  DESCUENTO SIMPLE
// ==========================
document.addEventListener("DOMContentLoaded", function () {

    var btnCalcularDescuento = document.getElementById("btnCalcularDescuento");
    var btnLimpiarDescuento  = document.getElementById("btnLimpiarDescuento");
    var selectModoDesc       = document.getElementById("modoDesc");

    if (!btnCalcularDescuento || !btnLimpiarDescuento) return;

    // Habilitar / deshabilitar M o D según el modo
    function actualizarModoDesc() {
        if (!selectModoDesc) return;
        var modo = selectModoDesc.value;

        if (modo === "desdeM") {
            setDisabled("MDesc", false);
            setDisabled("DDesc", true);   // D se calcula
        } else {
            setDisabled("MDesc", true);   // M se calcula
            setDisabled("DDesc", false);  // D se ingresa
        }
    }

    if (selectModoDesc) {
        actualizarModoDesc();
        selectModoDesc.addEventListener("change", actualizarModoDesc);
    }

    btnCalcularDescuento.addEventListener("click", function () {
        var tipo = document.getElementById("tipoDescuento").value;
        var modo = document.getElementById("modoDesc").value;

        var M = parseFloat(document.getElementById("MDesc").value);
        var DInput = parseFloat(document.getElementById("DDesc").value);

        var dValor   = parseFloat(document.getElementById("dDescValor").value);
        var dPeriodo = document.getElementById("dDescPeriodo").value;
        var d        = tasaAPeriodoAnual(dValor, dPeriodo); // descuento anual (decimal)

        var tA = parseFloat(document.getElementById("tDescAnos").value);
        var tM = parseFloat(document.getElementById("tDescMeses").value);
        var tD = parseFloat(document.getElementById("tDescDias").value);
        var t  = tiempoDesglosadoAnios(tA, tM, tD);   // tiempo en años

        var resultBox  = document.getElementById("resultadoDescuento");
        var detalleBox = document.getElementById("detalleFormulaDescuento");

        resultBox.classList.add("d-none");
        if (detalleBox) detalleBox.innerText = "";

        if (isNaN(d) || d <= 0 || isNaN(t) || t <= 0) {
            Swal.fire({
                icon: "warning",
                title: "Datos inválidos",
                text: "Verifica la tasa de descuento y el tiempo; deben ser mayores que cero."
            });
            return;
        }

        var C, D;

        try {

            // ============================
            // MODO 1: desde M (como antes)
            // ============================
            if (modo === "desdeM") {
                if (isNaN(M) || M <= 0) {
                    throw "Ingresa un valor nominal futuro (M) válido.";
                }

                if (tipo === "comercial") {
                    // D = M d t, C = M − D
                    D = M * d * t;
                    C = M - D;

                    detalleBox.innerText =
                        "Descuento comercial (desde M):\n" +
                        "D = M · d · t\n" +
                        "D = " + M.toFixed(2) + " · " + d.toFixed(6) + " · " + t.toFixed(6) +
                        "\nD = " + D.toFixed(2) +
                        "\n\nC = M − D\n" +
                        "C = " + M.toFixed(2) + " − " + D.toFixed(2) +
                        "\nC = " + C.toFixed(2);

                } else {
                    // REAL: C = M/(1 + d t), D = M − C
                    C = M / (1 + d * t);
                    D = M - C;

                    detalleBox.innerText =
                        "Descuento real (justo) (desde M):\n" +
                        "C = M / (1 + d · t)\n" +
                        "C = " + M.toFixed(2) + " / (1 + " +
                        d.toFixed(6) + " · " + t.toFixed(6) + ")" +
                        "\nC = " + C.toFixed(2) +
                        "\n\nD = M − C\n" +
                        "D = " + M.toFixed(2) + " − " + C.toFixed(2) +
                        "\nD = " + D.toFixed(2);
                }

            // ============================
            // MODO 2: desde D (nuevo)
            // ============================
            } else if (modo === "desdeD") {

                if (isNaN(DInput) || DInput <= 0) {
                    throw "Ingresa un descuento conocido (D) válido.";
                }

                D = DInput;

                var dt = d * t;
                if (dt === 0) throw "El producto d · t no puede ser cero.";

                if (tipo === "comercial") {
                    // D = M d t  ⇒  M = D / (d t)
                    M = D / dt;
                    C = M - D;

                    detalleBox.innerText =
                        "Descuento comercial (desde D):\n" +
                        "D = M · d · t\n" +
                        "M = D / (d · t)\n" +
                        "M = " + D.toFixed(2) + " / (" +
                        d.toFixed(6) + " · " + t.toFixed(6) + ")\n" +
                        "M = " + M.toFixed(2) +
                        "\n\nC = M − D\n" +
                        "C = " + M.toFixed(2) + " − " + D.toFixed(2) +
                        "\nC = " + C.toFixed(2);

                } else {
                    // REAL: D = M − C,  C = M/(1 + d t)
                    //     ⇒ D = M [dt / (1 + dt)] ⇒ M = D (1 + dt) / (dt)
                    M = D * (1 + dt) / dt;
                    C = M - D;

                    detalleBox.innerText =
                        "Descuento real (justo) (desde D):\n" +
                        "D = M − C  con  C = M / (1 + d · t)\n" +
                        "D = M · [d·t / (1 + d·t)]\n" +
                        "M = D · (1 + d·t) / (d·t)\n" +
                        "M = " + D.toFixed(2) + " · (1 + " + dt.toFixed(6) +
                        ") / " + dt.toFixed(6) + "\n" +
                        "M = " + M.toFixed(2) +
                        "\n\nC = M − D\n" +
                        "C = " + M.toFixed(2) + " − " + D.toFixed(2) +
                        "\nC = " + C.toFixed(2);
                }
            }

            // Desglose del tiempo para mostrarlo bonito
            var desg = desglosarTiempo360(t);

            document.getElementById("resDM").innerText = formatMoney(M);
            document.getElementById("resDC").innerText = formatMoney(C);
            document.getElementById("resDD").innerText = formatMoney(D);
            document.getElementById("resDT").innerText = t.toFixed(6) + " años";
            document.getElementById("resDTDesglosado").innerText = desg.texto;

            resultBox.classList.remove("d-none");

            Swal.fire({
                icon: "success",
                title: "Descuento calculado",
                showConfirmButton: false,
                timer: 1100
            });

        } catch (e) {
            Swal.fire({
                icon: "error",
                title: "No se pudo calcular",
                text: e
            });
        }
    });

    btnLimpiarDescuento.addEventListener("click", function () {
        ["MDesc","DDesc","dDescValor",
         "tDescAnos","tDescMeses","tDescDias"].forEach(function(id) {
            var el = document.getElementById(id);
            if (el && !el.disabled) el.value = "";
        });
        var resultBox = document.getElementById("resultadoDescuento");
        if (resultBox) resultBox.classList.add("d-none");
    });
});
