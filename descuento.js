// ==========================
//  DESCUENTO SIMPLE
// ==========================
document.addEventListener("DOMContentLoaded", function () {

    var btnCalcularDescuento = document.getElementById("btnCalcularDescuento");
    var btnLimpiarDescuento  = document.getElementById("btnLimpiarDescuento");
    var selectModoDesc       = document.getElementById("modoDesc");

    if (!btnCalcularDescuento || !btnLimpiarDescuento) return;

    // Habilitar / deshabilitar campos según el modo
    function actualizarModoDesc() {
        if (!selectModoDesc) return;
        var modo = selectModoDesc.value;

        // Primero habilitamos todo
        setDisabled("MDesc",   false);
        setDisabled("DDesc",   false);
        setDisabled("CDesc",   false);
        setDisabledTiempoDesc(false);

        if (modo === "desdeM") {
            // D y C se calculan
            setDisabled("DDesc", true);
            setDisabled("CDesc", true);
        } else if (modo === "desdeC") {
            // M se calcula, D se calcula, necesito C dado
            setDisabled("MDesc", true);
            setDisabled("DDesc", true);
        } else if (modo === "desdeD") {
            // M y C se calculan
            setDisabled("MDesc", true);
            setDisabled("CDesc", true);
        } else if (modo === "tiempo") {
            // t se calcula → bloqueo años/meses/días y D
            setDisabledTiempoDesc(true);
            setDisabled("DDesc", true);
        }
    }

    if (selectModoDesc) {
        actualizarModoDesc();
        selectModoDesc.addEventListener("change", actualizarModoDesc);
    }

    btnCalcularDescuento.addEventListener("click", function () {
        var tipo = document.getElementById("tipoDescuento").value;
        var modo = document.getElementById("modoDesc").value;

        var M      = parseFloat(document.getElementById("MDesc").value);
        var DInput = parseFloat(document.getElementById("DDesc").value);
        var CInput = parseFloat(document.getElementById("CDesc").value);

        var dValor   = parseFloat(document.getElementById("dDescValor").value);
        var dPeriodo = document.getElementById("dDescPeriodo").value;
        var d        = tasaAPeriodoAnual(dValor, dPeriodo); // descuento anual (decimal)

        var tA = parseFloat(document.getElementById("tDescAnos").value);
        var tM = parseFloat(document.getElementById("tDescMeses").value);
        var tD = parseFloat(document.getElementById("tDescDias").value);
        var t  = tiempoDesglosadoAnios(tA, tM, tD);   // tiempo en años (cuando t es dato)

        var resultBox  = document.getElementById("resultadoDescuento");
        var detalleBox = document.getElementById("detalleFormulaDescuento");

        resultBox.classList.add("d-none");
        if (detalleBox) detalleBox.innerText = "";

        if (isNaN(d) || d <= 0) {
            Swal.fire({
                icon: "warning",
                title: "Datos inválidos",
                text: "La tasa de descuento debe ser mayor que cero."
            });
            return;
        }

        var C, D;

        try {

            // =========================================
            // MODO 1: C y D a partir de M, d y t (desdeM)
            // =========================================
            if (modo === "desdeM") {

                if (isNaN(M) || M <= 0 || isNaN(t) || t <= 0) {
                    throw "Ingresa M, d y un tiempo t válido (años, meses o días).";
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

            // =========================================
            // MODO 2: M y D a partir de C, d y t (desdeC)
            //  (Ejemplo 2.8.2 de tu cuaderno)
            // =========================================
            } else if (modo === "desdeC") {

                var Ck = CInput;
                if (isNaN(Ck) || Ck <= 0 || isNaN(t) || t <= 0) {
                    throw "Ingresa C, d y un tiempo t válido.";
                }

                if (tipo === "comercial") {
                    // D = M d t  y  M = C + D
                    // D = (C + D)d t = C d t + D d t
                    // D − D d t = C d t
                    // D (1 − d t) = C d t
                    // D = C d t / (1 − d t)
                    var dt = d * t;
                    if (dt >= 1) {
                        throw "Para descuento comercial se requiere d·t < 1 (de lo contrario la fórmula D = C·d·t / (1 − d·t) no tiene sentido financiero).";
                    }

                    D = Ck * d * t / (1 - dt);
                    M = Ck + D;
                    C = Ck;

                    detalleBox.innerText =
                        "Descuento comercial (desde C):\n" +
                        "D = M · d · t   y   M = C + D\n" +
                        "D = (C + D) · d · t\n" +
                        "D = C · d · t + D · d · t\n" +
                        "D − D · d · t = C · d · t\n" +
                        "D (1 − d · t) = C · d · t\n" +
                        "D = C · d · t / (1 − d · t)\n\n" +
                        "Sustituyendo:\n" +
                        "D = " + Ck.toFixed(2) + " · " + d.toFixed(6) + " · " + t.toFixed(6) +
                        " / (1 − " + d.toFixed(6) + " · " + t.toFixed(6) + ")\n" +
                        "D = " + D.toFixed(2) + "\n\n" +
                        "M = C + D\n" +
                        "M = " + Ck.toFixed(2) + " + " + D.toFixed(2) +
                        "\nM = " + M.toFixed(2);

                } else {
                    // REAL: M = C(1 + d t), D = M − C = C d t
                    D = Ck * d * t;
                    M = Ck * (1 + d * t);
                    C = Ck;

                    detalleBox.innerText =
                        "Descuento real (justo) (desde C):\n" +
                        "M = C (1 + d · t)\n" +
                        "D = M − C = C (1 + d · t) − C = C · d · t\n\n" +
                        "M = " + Ck.toFixed(2) + " · (1 + " +
                        d.toFixed(6) + " · " + t.toFixed(6) + ")\n" +
                        "M = " + M.toFixed(2) +
                        "\n\nD = C · d · t\n" +
                        "D = " + Ck.toFixed(2) + " · " + d.toFixed(6) + " · " + t.toFixed(6) +
                        "\nD = " + D.toFixed(2);
                }

            // =========================================
            // MODO 3: M y C a partir de D, d y t (desdeD)
            // =========================================
            } else if (modo === "desdeD") {

                if (isNaN(DInput) || DInput <= 0 || isNaN(t) || t <= 0) {
                    throw "Ingresa un descuento D y un tiempo t válidos.";
                }

                D = DInput;
                var dt2 = d * t;
                if (dt2 === 0) throw "El producto d · t no puede ser cero.";

                if (tipo === "comercial") {
                    // D = M d t  ⇒  M = D / (d t)
                    M = D / dt2;
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
                    // REAL (desde D): partimos de fórmula D = M − C = M [d t / (1 + d t)]
                    M = D * (1 + dt2) / dt2;
                    C = M - D;

                    detalleBox.innerText =
                        "Descuento real (justo) (desde D):\n" +
                        "D = M − C  con  C = M / (1 + d · t)\n" +
                        "⇒ D = M · [d·t / (1 + d·t)]\n" +
                        "M = D · (1 + d·t) / (d·t)\n" +
                        "M = " + D.toFixed(2) + " · (1 + " + dt2.toFixed(6) +
                        ") / " + dt2.toFixed(6) + "\n" +
                        "M = " + M.toFixed(2) +
                        "\n\nC = M − D\n" +
                        "C = " + M.toFixed(2) + " − " + D.toFixed(2) +
                        "\nC = " + C.toFixed(2);
                }

            // =========================================
            // MODO 4: Tiempo t a partir de M, C y d
            // =========================================
            } else if (modo === "tiempo") {

                var Ck2 = CInput;
                if (isNaN(M) || M <= 0 || isNaN(Ck2) || Ck2 <= 0) {
                    throw "Ingresa M y C válidos.";
                }

                if (tipo === "comercial") {
                    // D = M − C  y  D = M d t  ⇒  t = D / (M d)
                    D = M - Ck2;
                    if (D < 0) {
                        throw "En descuento comercial el valor actual C no puede ser mayor que M.";
                    }
                    t = D / (M * d);

                    var desgT = desglosarTiempo360(t);

                    detalleBox.innerText =
                        "Descuento comercial (tiempo t desde M, C y d):\n" +
                        "M = " + M.toFixed(2) + "\n" +
                        "C = " + Ck2.toFixed(2) + "\n" +
                        "d = " + d.toFixed(6) + "\n\n" +
                        "D = M − C\n" +
                        "D = " + M.toFixed(2) + " − " + Ck2.toFixed(2) +
                        "\nD = " + D.toFixed(2) + "\n\n" +
                        "D = M · d · t  ⇒  t = D / (M · d)\n" +
                        "t = " + D.toFixed(2) + " / (" +
                        M.toFixed(2) + " · " + d.toFixed(6) + ")\n" +
                        "t = " + t.toFixed(6) + " años\n" +
                        "t ≈ " + desgT.texto;

                    C = Ck2;

                } else {
                    // REAL: C = M/(1 + d t) ⇒ t = (M/C − 1)/d
                    if (Ck2 >= M) {
                        throw "En descuento real (justo), el valor actual C debe ser menor que M.";
                    }
                    t = (M / Ck2 - 1) / d;
                    D = M - Ck2;

                    var desgT2 = desglosarTiempo360(t);

                    detalleBox.innerText =
                        "Descuento real (justo) (tiempo t desde M, C y d):\n" +
                        "C = M / (1 + d · t)\n" +
                        "M / C = 1 + d · t  ⇒  t = (M/C − 1)/d\n" +
                        "t = (" + M.toFixed(2) + " / " + Ck2.toFixed(2) +
                        " − 1) / " + d.toFixed(6) + "\n" +
                        "t = " + t.toFixed(6) + " años\n" +
                        "t ≈ " + desgT2.texto +
                        "\n\nD = M − C\n" +
                        "D = " + M.toFixed(2) + " − " + Ck2.toFixed(2) +
                        "\nD = " + D.toFixed(2);

                    C = Ck2;
                }
            }

            // Desglose del tiempo para mostrarlo en resultados
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
        ["MDesc","DDesc","CDesc","dDescValor",
         "tDescAnos","tDescMeses","tDescDias"].forEach(function(id) {
            var el = document.getElementById(id);
            if (el && !el.disabled) el.value = "";
        });
        var resultBox = document.getElementById("resultadoDescuento");
        if (resultBox) resultBox.classList.add("d-none");
    });
});
