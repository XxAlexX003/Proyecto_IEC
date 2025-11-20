// =====================================
// ECUACIONES DE VALORES EQUIVALENTES
// (Interés simple)
// =====================================
document.addEventListener("DOMContentLoaded", function () {

    var tbodyEqv      = document.getElementById("tbodyEqv");
    var btnAgregarEqv = document.getElementById("btnAgregarEqv");
    var btnCalcularEqv = document.getElementById("btnCalcularEqv");
    var btnLimpiarEqv  = document.getElementById("btnLimpiarEqv");

    // Si no estamos en calculadora.html, no hacemos nada
    if (!tbodyEqv || !btnAgregarEqv || !btnCalcularEqv || !btnLimpiarEqv) {
        return;
    }

    var filaCounterEqv = 0;

    // ----------------------------
    // Crear fila de operación
    // ----------------------------
    function crearFilaOperacionEqv() {
        filaCounterEqv++;
        var rowId = filaCounterEqv;

        var tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                <select class="form-select form-select-sm tipoEqv">
                    <option value="deuda">Deuda</option>
                    <option value="pago">Pago</option>
                </select>
            </td>
            <td>
                <input type="number" min="0" step="0.01"
                       class="form-control form-control-sm montoEqv"
                       placeholder="Ej: 120000">
            </td>
            <td>
                <div class="input-group input-group-sm mb-1">
                    <input type="number" min="0" step="0.0001"
                           class="form-control tasaEqv"
                           placeholder="Ej: 25">
                    <span class="input-group-text">%</span>
                    <select class="form-select periodoEqv">
                        <option value="anual">% anual</option>
                        <option value="semestral">% semestral</option>
                        <option value="trimestral">% trimestral</option>
                        <option value="mensual">% mensual</option>
                        <option value="diaria360">% diaria (360)</option>
                        <option value="diaria365">% diaria (365)</option>
                    </select>
                </div>
                <div class="small-label">
                    Tasa simple para llevar el valor a la fecha focal.
                </div>
            </td>
            <td>
                <div class="d-flex gap-1 mb-1">
                    <input type="number" min="0" step="1"
                           class="form-control form-control-sm aniosEqv"
                           placeholder="Años">
                    <input type="number" min="0" step="1"
                           class="form-control form-control-sm mesesEqv"
                           placeholder="Meses">
                    <input type="number" min="0" step="1"
                           class="form-control form-control-sm diasEqv"
                           placeholder="Días (360)">
                </div>
                <div class="small-label">
                    Tiempo desde la operación hasta la fecha focal.
                </div>
            </td>
            <td>
                <div class="form-check">
                    <input class="form-check-input" type="radio"
                           name="posEqv_${rowId}" value="antes" checked>
                    <label class="form-check-label small">Antes</label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio"
                           name="posEqv_${rowId}" value="despues">
                    <label class="form-check-label small">Después</label>
                </div>
            </td>
            <td class="text-center">
                <input class="form-check-input esXEqv" type="radio" name="filaX">
                <div class="small-label">Marcar X</div>
            </td>
            <td class="text-center">
                <button type="button"
                        class="btn btn-sm btn-outline-danger btnEliminarEqv">&times;</button>
            </td>
        `;

        tbodyEqv.appendChild(tr);

        // Listener para eliminar la fila
        var btnEliminar = tr.querySelector(".btnEliminarEqv");
        if (btnEliminar) {
            btnEliminar.addEventListener("click", function () {
                tr.remove();
                if (tbodyEqv.querySelectorAll("tr").length === 0) {
                    crearFilaOperacionEqv();
                }
            });
        }
    }

    // Crear un par de filas iniciales
    crearFilaOperacionEqv();
    crearFilaOperacionEqv();

    btnAgregarEqv.addEventListener("click", function () {
        crearFilaOperacionEqv();
    });

    // ----------------------------
    // Obtener "antes / después"
    // ----------------------------
    function obtenerPosicionEqv(tr) {
        var radios = tr.querySelectorAll("input[type='radio'][name^='posEqv_']");
        var pos = "antes";
        radios.forEach(function (r) {
            if (r.checked) pos = r.value;
        });
        return pos;
    }

    // ----------------------------
    // Valor equivalente de una fila
    // ----------------------------
    function valorEquivalenteFila(C, tasaValor, periodo, anios, meses, dias, posicion) {
        var i = tasaAPeriodoAnual(tasaValor, periodo); // función global de app.js
        if (isNaN(i) || i < 0) return NaN;

        var t = tiempoDesglosadoAnios(anios, meses, dias); // función global de app.js
        if (isNaN(t) || t < 0) return NaN;

        // Si la operación está exactamente en la fecha focal (t=0), no cambia su valor
        if (t === 0) return C;

        // Antes de la fecha focal → capitalizamos hacia adelante
        if (posicion === "antes") {
            return C * (1 + i * t);
        }

        // Después de la fecha focal → descontamos hacia atrás
        if (posicion === "despues") {
            return C / (1 + i * t);
        }

        return NaN;
    }

    // ----------------------------
    // Cálculo de la ecuación
    // ----------------------------
    btnCalcularEqv.addEventListener("click", function () {
        // Verificación de autenticación antes de calcular
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

        var filas = tbodyEqv.querySelectorAll("tr");
        if (filas.length === 0) {
            Swal.fire({
                icon: "warning",
                title: "Sin operaciones",
                text: "Agrega al menos una deuda y un pago."
            });
            return;
        }

        var sumaDeudas = 0;
        var sumaPagos  = 0;

        var factorX = null;
        var tipoX   = null;  // "deuda" o "pago"
        var tieneX  = false;

        var errorDatos = false;

        filas.forEach(function (tr) {
            if (errorDatos) return;

            var selTipo    = tr.querySelector(".tipoEqv");
            var inpMonto   = tr.querySelector(".montoEqv");
            var inpTasa    = tr.querySelector(".tasaEqv");
            var selPeriodo = tr.querySelector(".periodoEqv");
            var inpAnios   = tr.querySelector(".aniosEqv");
            var inpMeses   = tr.querySelector(".mesesEqv");
            var inpDias    = tr.querySelector(".diasEqv");
            var chkX       = tr.querySelector(".esXEqv");

            var tipo    = selTipo ? selTipo.value : "deuda";
            var monto   = parseFloat(inpMonto.value);
            var tasaVal = parseFloat(inpTasa.value);
            var periodo = selPeriodo ? selPeriodo.value : "anual";
            var anios   = parseFloat(inpAnios.value);
            var meses   = parseFloat(inpMeses.value);
            var dias    = parseFloat(inpDias.value);
            var pos     = obtenerPosicionEqv(tr);

            if (chkX && chkX.checked) {
                tieneX = true;
                factorX = valorEquivalenteFila(1, tasaVal, periodo, anios, meses, dias, pos);
                tipoX   = tipo;

                if (isNaN(factorX) || factorX === 0) {
                    errorDatos = true;
                }
            } else {
                // Si el monto está vacío o 0, ignoramos la fila
                if (isNaN(monto) || monto === 0) return;

                var vEq = valorEquivalenteFila(monto, tasaVal, periodo, anios, meses, dias, pos);
                if (isNaN(vEq)) {
                    errorDatos = true;
                    return;
                }

                if (tipo === "deuda") {
                    sumaDeudas += vEq;
                } else {
                    sumaPagos += vEq;
                }
            }
        });

        if (errorDatos) {
            Swal.fire({
                icon: "error",
                title: "Datos incompletos",
                text: "Revisa tasa, tiempo y posición de cada operación. Usa 0% si es sin intereses."
            });
            return;
        }

        if (!tieneX || factorX === null || factorX === 0) {
            Swal.fire({
                icon: "warning",
                title: "Falta marcar X",
                text: "Debes marcar exactamente una operación como X y completar sus datos."
            });
            return;
        }

        var X;
        var detalle = "Valor total de las deudas = Valor total de los pagos\n\n";

        if (tipoX === "deuda") {
            // DeudasConocidas + X·F_X = Pagos
            X = (sumaPagos - sumaDeudas) / factorX;

            detalle += "Deudas (equivalentes en la fecha focal) = " +
                       sumaDeudas.toFixed(2) + "\n";
            detalle += "Pagos conocidos (equivalentes en la fecha focal) = " +
                       sumaPagos.toFixed(2) + "\n\n";

            detalle += "Deudas + X·F_X = Pagos\n";
            detalle += sumaDeudas.toFixed(2) + " + X · " +
                       factorX.toFixed(6) + " = " + sumaPagos.toFixed(2) + "\n\n";
            detalle += "X = (Pagos − Deudas) / F_X\n";
            detalle += "X = (" + sumaPagos.toFixed(2) + " − " +
                       sumaDeudas.toFixed(2) + ") / " +
                       factorX.toFixed(6) + "\n";

        } else {
            // Deudas = PagosConocidos + X·F_X
            X = (sumaDeudas - sumaPagos) / factorX;

            detalle += "Deudas (equivalentes en la fecha focal) = " +
                       sumaDeudas.toFixed(2) + "\n";
            detalle += "Pagos conocidos (equivalentes en la fecha focal) = " +
                       sumaPagos.toFixed(2) + "\n\n";

            detalle += "Deudas = PagosConocidos + X·F_X\n";
            detalle += sumaDeudas.toFixed(2) + " = " +
                       sumaPagos.toFixed(2) + " + X · " +
                       factorX.toFixed(6) + "\n\n";
            detalle += "X = (Deudas − PagosConocidos) / F_X\n";
            detalle += "X = (" + sumaDeudas.toFixed(2) + " − " +
                       sumaPagos.toFixed(2) + ") / " +
                       factorX.toFixed(6) + "\n";
        }

        if (isNaN(X)) {
            Swal.fire({
                icon: "error",
                title: "No se pudo calcular X",
                text: "Verifica los datos de las operaciones."
            });
            return;
        }

        detalle += "\nX = " + X.toFixed(2);

        var resBox      = document.getElementById("resultadoEqv");
        var spanDeudas  = document.getElementById("resDeudasEqv");
        var spanPagos   = document.getElementById("resPagosEqv");
        var spanX       = document.getElementById("resXEqv");
        var detalleBox  = document.getElementById("detalleFormulaEqv");

        if (spanDeudas) spanDeudas.textContent = formatMoney(sumaDeudas);
        if (spanPagos)  spanPagos.textContent  = formatMoney(sumaPagos);
        if (spanX)      spanX.textContent      = formatMoney(X);
        if (detalleBox) detalleBox.textContent = detalle;

        resBox.classList.remove("d-none");

        Swal.fire({
            icon: "success",
            title: "Ecuación resuelta",
            showConfirmButton: false,
            timer: 1100
        });
    });

    // ----------------------------
    // Limpiar
    // ----------------------------
    btnLimpiarEqv.addEventListener("click", function () {
        tbodyEqv.innerHTML = "";
        crearFilaOperacionEqv();
        crearFilaOperacionEqv();

        var resBox     = document.getElementById("resultadoEqv");
        var detalleBox = document.getElementById("detalleFormulaEqv");
        if (resBox)    resBox.classList.add("d-none");
        if (detalleBox) detalleBox.textContent = "";
    });
});
