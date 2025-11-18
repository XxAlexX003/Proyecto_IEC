// ==========================
//  UTILIDADES GENERALES
// ==========================

// Convierte años/meses/días a años (año comercial de 360 días)
function tiempoDesglosadoAnios(anios, meses, dias) {
    var a = Number(anios);
    var m = Number(meses);
    var d = Number(dias);

    if (isNaN(a)) a = 0;
    if (isNaN(m)) m = 0;
    if (isNaN(d)) d = 0;

    return a + (m / 12) + (d / 360);
}

// Convierte una tasa dada en cierto periodo a tasa anual simple (decimal)
function tasaAPeriodoAnual(valorPorciento, periodo) {
    var r = Number(valorPorciento);
    if (isNaN(r) || r < 0) return NaN;

    var dec = r / 100;

    switch (periodo) {
        case "anual":      return dec;
        case "semestral":  return dec * 2;
        case "trimestral": return dec * 4;
        case "mensual":    return dec * 12;
        case "diaria360":  return dec * 360;
        case "diaria365":  return dec * 365;
        default:           return dec;
    }
}

// Formateos
function formatMoney(x) {
    return "$" + x.toFixed(2);
}

function formatPercent(i) {
    return (i * 100).toFixed(4) + " %";
}

// Habilitar / deshabilitar un input
function setDisabled(id, disabled) {
    var el = document.getElementById(id);
    if (!el) return;
    el.disabled = disabled;
    if (disabled) {
        el.value = "";
    }
}

// Para tiempo de INTERÉS SIMPLE
function setDisabledTiempoSimple(disabled) {
    ["tAnos", "tMeses", "tDias"].forEach(function (id) {
        setDisabled(id, disabled);
    });
}

// Para tiempo de DESCUENTO SIMPLE
function setDisabledTiempoDesc(disabled) {
    ["tDescAnos", "tDescMeses", "tDescDias"].forEach(function (id) {
        setDisabled(id, disabled);
    });
}

// Desglosa t (años, base 360) en años / meses / días aprox.
function desglosarTiempo360(tAnios) {
    var totalDias = tAnios * 360;
    var anios = Math.floor(totalDias / 360);
    var diasRestantes = totalDias % 360;
    var meses = Math.floor(diasRestantes / 30);
    var dias = Math.round(diasRestantes % 30);

    return {
        anios: anios,
        meses: meses,
        dias: dias,
        texto: anios + " años, " + meses + " meses, " + dias + " días (aprox.)"
    };
}
