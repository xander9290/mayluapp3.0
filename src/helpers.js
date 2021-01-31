import axios from "axios";

// export const apiURI = "http://localhost:4000";
export const apiURI = "http://localhost:3001";
export const operadorSession = window.sessionStorage.getItem("operador");
export const operadorRol = window.sessionStorage.getItem("operadorRol");

export const fechaActual = () => {
  let d = new Date(Date.now()),
    ano = d.getFullYear(),
    mes = d.getMonth() + 1,
    dia = d.getDate(),
    str = "";
  str = `${ano}-${mes < 10 ? "0" + mes : mes}-${dia < 10 ? "0" + dia : dia}`;
  return str;
};

export const formatDate = (date) => {
  let d = new Date(date),
    dia = d.getDate(),
    mes = d.getMonth() + 1,
    ano = d.getFullYear(),
    hora = d.getHours(),
    min = d.getMinutes(),
    str = "";
  str = `${dia}/${mes}/${ano} ${hora > 12 ? hora - 12 : hora}:${min}`;
  if (!date) str = "";
  return str;
};

export const fechaISO = () => {
  return new Date(Date.now()).toISOString();
};

export const commit = async (commit, operador) => {
  return await axios.post(apiURI + "/logs", {
    createdAt: fechaISO(),
    fecha: fechaActual(),
    operador: operador,
    commit,
  });
};

export const clockTime = () => {
  let string = "";
  const date = new Date();
  const hora = date.getHours();
  const min = date.getMinutes();
  // const sec = date.getSeconds();

  string = `${hora > 12 ? hora - 12 : hora}:${min < 10 ? "0" + min : min} ${
    hora > 12 ? "p.m." : "a.m."
  }`;
  return [string];
};

export const cuentaConstructor = {
  folio: null,
  orden: null,
  torreta: "",
  personas: 1,
  servicio: "",
  cliente: {
    name: "",
    tel: "",
    address: {
      calle: "",
      cruces: "",
      colonia: "",
      obs: "",
    },
    id: null,
  },
  estado: "abierto",
  impreso: false,
  items: [],
  importe: 0,
  dscto: 0,
  total: 0,
  efectivo: 0,
  tarjeta: 0,
  cambio: 0,
  createdAt: fechaISO(),
  createdBy: operadorSession,
  closedAt: "",
  fecha: fechaActual(Date.now()),
  id: null,
};

export const processImporte = {
  totalItems: function (list = [], dscto) {
    const listFilter = list.filter((item) => item.cancelado === false);
    let total = 0;
    listFilter.map((item) => {
      total += item.importe;
    });
    let totalCuenta = total - parseInt(dscto);
    return { importe: total, total: totalCuenta };
  },
};

export const numeroALetras = (function () {
  // Código basado en el comentario de @sapienman
  // Código basado en https://gist.github.com/alfchee/e563340276f89b22042a
  function Unidades(num) {
    switch (num) {
      case 1:
        return "UN";
      case 2:
        return "DOS";
      case 3:
        return "TRES";
      case 4:
        return "CUATRO";
      case 5:
        return "CINCO";
      case 6:
        return "SEIS";
      case 7:
        return "SIETE";
      case 8:
        return "OCHO";
      case 9:
        return "NUEVE";
    }

    return "";
  } //Unidades()

  function Decenas(num) {
    let decena = Math.floor(num / 10);
    let unidad = num - decena * 10;

    switch (decena) {
      case 1:
        switch (unidad) {
          case 0:
            return "DIEZ";
          case 1:
            return "ONCE";
          case 2:
            return "DOCE";
          case 3:
            return "TRECE";
          case 4:
            return "CATORCE";
          case 5:
            return "QUINCE";
          default:
            return "DIECI" + Unidades(unidad);
        }
      case 2:
        switch (unidad) {
          case 0:
            return "VEINTE";
          default:
            return "VEINTI" + Unidades(unidad);
        }
      case 3:
        return DecenasY("TREINTA", unidad);
      case 4:
        return DecenasY("CUARENTA", unidad);
      case 5:
        return DecenasY("CINCUENTA", unidad);
      case 6:
        return DecenasY("SESENTA", unidad);
      case 7:
        return DecenasY("SETENTA", unidad);
      case 8:
        return DecenasY("OCHENTA", unidad);
      case 9:
        return DecenasY("NOVENTA", unidad);
      case 0:
        return Unidades(unidad);
    }
  } //Unidades()

  function DecenasY(strSin, numUnidades) {
    if (numUnidades > 0) return strSin + " Y " + Unidades(numUnidades);

    return strSin;
  } //DecenasY()

  function Centenas(num) {
    let centenas = Math.floor(num / 100);
    let decenas = num - centenas * 100;

    switch (centenas) {
      case 1:
        if (decenas > 0) return "CIENTO " + Decenas(decenas);
        return "CIEN";
      case 2:
        return "DOSCIENTOS " + Decenas(decenas);
      case 3:
        return "TRESCIENTOS " + Decenas(decenas);
      case 4:
        return "CUATROCIENTOS " + Decenas(decenas);
      case 5:
        return "QUINIENTOS " + Decenas(decenas);
      case 6:
        return "SEISCIENTOS " + Decenas(decenas);
      case 7:
        return "SETECIENTOS " + Decenas(decenas);
      case 8:
        return "OCHOCIENTOS " + Decenas(decenas);
      case 9:
        return "NOVECIENTOS " + Decenas(decenas);
    }

    return Decenas(decenas);
  } //Centenas()

  function Seccion(num, divisor, strSingular, strPlural) {
    let cientos = Math.floor(num / divisor);
    let resto = num - cientos * divisor;

    let letras = "";

    if (cientos > 0)
      if (cientos > 1) letras = Centenas(cientos) + " " + strPlural;
      else letras = strSingular;

    if (resto > 0) letras += "";

    return letras;
  } //Seccion()

  function Miles(num) {
    let divisor = 1000;
    let cientos = Math.floor(num / divisor);
    let resto = num - cientos * divisor;

    let strMiles = Seccion(num, divisor, "UN MIL", "MIL");
    let strCentenas = Centenas(resto);

    if (strMiles === "") return strCentenas;

    return strMiles + " " + strCentenas;
  } //Miles()

  function Millones(num) {
    let divisor = 1000000;
    let cientos = Math.floor(num / divisor);
    let resto = num - cientos * divisor;

    let strMillones = Seccion(num, divisor, "UN MILLON DE", "MILLONES DE");
    let strMiles = Miles(resto);

    if (strMillones === "") return strMiles;

    return strMillones + " " + strMiles;
  } //Millones()

  return function NumeroALetras(num, currency) {
    currency = currency || {};
    let data = {
      numero: num,
      enteros: Math.floor(num),
      centavos: Math.round(num * 100) - Math.floor(num) * 100,
      letrasCentavos: "",
      letrasMonedaPlural: currency.plural || "PESO 00/100", //'PESOS', 'Dólares', 'Bolívares', 'etcs'
      letrasMonedaSingular: currency.singular || "PESOS 00/100", //'PESO', 'Dólar', 'Bolivar', 'etc'
      letrasMonedaCentavoPlural: currency.centPlural || "",
      letrasMonedaCentavoSingular: currency.centSingular || "",
    };

    if (data.centavos > 0) {
      data.letrasCentavos =
        "CON " +
        (function () {
          if (data.centavos === 1)
            return (
              Millones(data.centavos) + " " + data.letrasMonedaCentavoSingular
            );
          else
            return (
              Millones(data.centavos) + " " + data.letrasMonedaCentavoPlural
            );
        })();
    }

    if (data.enteros === 0)
      return "CERO " + data.letrasMonedaPlural + " " + data.letrasCentavos;
    if (data.enteros === 1)
      return (
        Millones(data.enteros) +
        " " +
        data.letrasMonedaSingular +
        " " +
        data.letrasCentavos
      );
    else
      return (
        Millones(data.enteros) +
        " " +
        data.letrasMonedaPlural +
        " " +
        data.letrasCentavos
      );
  };
})();
