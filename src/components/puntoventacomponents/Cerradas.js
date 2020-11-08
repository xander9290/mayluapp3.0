import { useState, useEffect } from "react";
import axios from "axios";
import {
  fechaActual,
  formatDate,
  operadorRol,
  operadorSession,
  apiURI,
  commit,
  cuentaConstructor,
  fechaISO,
} from "../../helpers";
import ComandaModal from "../modals/Comanda";

export default function Cerradas(props) {
  const { changeservicio } = props;

  const [cuentas, setCuentas] = useState([]);
  const [cuenta, setCuenta] = useState(cuentaConstructor);
  const [modalComanda, setModalComanda] = useState(false);
  const [fechasearch, setFechasearch] = useState({
    fecha: fechaActual(Date.now()),
  });

  useEffect(() => {
    setFechasearch({ fecha: fechaActual(Date.now()) });
    loadcuentas();
    setCuenta(cuentaConstructor);
  }, [changeservicio]);

  const loadcuentas = async () => {
    const data = await axios.get(
      apiURI +
        "/cuentas?fecha=" +
        fechasearch.fecha +
        "&estado_ne=abierto&_sort=id&_order=desc"
    );
    setCuentas(data.data);
  };

  const onFecha = (e) => {
    setFechasearch({ ...fechasearch, [e.target.name]: e.target.value });
  };

  const handleFecha = (e) => {
    e.preventDefault();
    loadcuentas();
    commit("ha hecho una búsqueda de cuentas cerradas ", operadorSession);
  };

  const selectCuenta = (id) => {
    const _cuenta = cuentas.find((cuenta) => cuenta.id === id);
    if (_cuenta) {
      setCuenta(_cuenta);
    } else {
      alert("ERROR FATAL: CUENTA NO ENCONTRADA... OH, MY GOD!");
    }
  };

  const reimprimir = () => {
    if (cuenta.id) {
      setModalComanda(true);
      commit(
        "ha reimprimido la cuenta cerrada " + cuenta.orden,
        operadorSession
      );
    } else {
      alert("SELECCIONA UNA CUENTA PARA CONTINUAR");
    }
  };

  const reabrir = async () => {
    if (window.confirm("CONFIRMAR ACCIÓN")) {
      const data = {
        ...cuenta,
        estado: "abierto",
        impreso: false,
        efectivo: 0,
        tarjeta: 0,
        cambio: 0,
        createdAt: fechaISO(),
        createdBy: operadorSession,
        closedAt: "",
      };
      await axios.put(apiURI + "/cuentas/" + cuenta.id, data);
      loadcuentas();
      setCuenta(cuentaConstructor);
      commit("ha reabierto la cuenta cerrada " + cuenta.orden, operadorSession);
    }
  };

  return (
    <div className="row">
      <div className="col-md-4 p-0 mt-1">
        <div className="card bg-secondary puntoventa-container">
          <div className="card-header p-1">
            <form className="form-inline" onSubmit={handleFecha}>
              <div className="form-group">
                <input
                  className="form-control form-control-lg"
                  type="date"
                  name="fecha"
                  value={fechasearch.fecha}
                  onChange={onFecha}
                  required
                />
              </div>
              <button
                title="buscar cuentas"
                type="submit"
                className="btn btn-primary btn-lg"
              >
                &#x1F50D;
              </button>
            </form>
          </div>
          <div className="card-body p-1 contenedor-scroll-y">
            <div className="list-group">
              {cuentas.length > 0 ? (
                cuentas.map((cuenta) => (
                  <button
                    key={cuenta.id}
                    type="button"
                    onClick={() => selectCuenta(cuenta.id)}
                    className={
                      cuenta.estado === "cancelado"
                        ? "list-group-item list-group-item-action my-1 font-weight-bold bg-danger text-light border-light"
                        : "list-group-item list-group-item-action my-1 font-weight-bold bg-dark text-light border-light"
                    }
                  >
                    <small className="d-flex justify-content-between align-content-center text-uppercase font-weight-bold">
                      <span>{cuenta.torreta}</span>
                      <span>{cuenta.servicio}</span>
                      <span>orden: {cuenta.orden}</span>
                      <span>folio: {cuenta.folio}</span>
                    </small>
                  </button>
                ))
              ) : (
                <h5 className="text-light bg-danger text-center">
                  no hay cuentas
                </h5>
              )}
            </div>
          </div>
          <div className="card-footer p-1">
            <button
              onClick={reimprimir}
              type="button"
              className="btn btn-warning btn-lg font-weight-bold mr-1"
            >
              Reimprimir
            </button>
            <button
              onClick={reabrir}
              type="button"
              className="btn btn-warning btn-lg font-weight-bold"
            >
              Reabrir
            </button>
          </div>
        </div>
      </div>
      <div className="col-md-8 p-0 mt-1">
        <div className="card bg-secondary puntoventa-container">
          <div className="card-header p-1">
            <ul className="list-group list-group-horizontal text-uppercase">
              <li className="list-group-item p-1">
                cliente:{" "}
                <span className="font-weight-bolder">{cuenta.torreta}</span>
              </li>
              <li className="list-group-item p-1">
                orden:{" "}
                <span className="font-weight-bolder">{cuenta.orden}</span>
              </li>
              <li className="list-group-item p-1">
                folio:{" "}
                <span className="font-weight-bolder">{cuenta.folio}</span>
              </li>
              <li className="list-group-item p-1">
                apertura:{" "}
                <span className="font-weight-bolder">
                  {formatDate(cuenta.createdAt)}
                </span>
              </li>
              <li className="list-group-item p-1">
                cierre:{" "}
                <span className="font-weight-bolder">
                  {formatDate(cuenta.closedAt)}
                </span>
              </li>
              <li className="list-group-item p-1">
                operador:{" "}
                <span className="font-weight-bolder">{cuenta.createdBy}</span>
              </li>
            </ul>
          </div>
          <div className="card-body contenedor-scroll-y scroll-x p-1">
            <table className="table table-sm table-bordered bg-light">
              <thead>
                <tr className="text-center">
                  {/* <th scope="col">DEL</th> */}
                  <th scope="col">cant</th>
                  <th scope="col">Desc</th>
                  <th scope="col">importe</th>
                  <th scope="col">precio</th>
                  <th scope="col">Dscto</th>
                  <th scope="col">operador</th>
                  <th scope="col">fecha</th>
                </tr>
              </thead>
              <tbody>
                {!cuenta.items
                  ? null
                  : cuenta.items.map((item, i) => (
                      <tr key={i}>
                        {/* <th className="text-center">
                          <button
                            onClick={() => deleteItem(i, item.importe)}
                            type="button"
                            className="btn btn-danger btn-sm"
                            disabled={cuenta.impreso ? true : false}
                          >
                            &times;
                          </button>
                        </th> */}
                        <td className="text-center font-weight-bold lead">
                          {item.cant}
                        </td>
                        <td className="text-left font-weight-bold lead">
                          <p className="m-0 p-0">{item.name}</p>
                          <small>
                            {item.modificadores.map((m, i) => (
                              <p key={i} className="p-0 m-0">
                                {">>"}
                                {m.name} {m.price > 0 ? "$" + m.price : ""}
                              </p>
                            ))}
                          </small>
                        </td>
                        <td className="text-center font-weight-bold lead">
                          ${item.importe}
                        </td>
                        <td className="text-center font-weight-bold lead">
                          ${item.price}
                        </td>
                        <td className="text-center font-weight-bold lead">
                          -${item.dscto}
                        </td>
                        <td className="text-center font-weight-bold lead">
                          {item.createdBy}
                        </td>
                        <td className="text-center font-weight-bold lead">
                          {formatDate(item.createdAt)}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
          <div className="card-footer p-1 d-flex justify-content-end">
            <ul className="list-group list-group-horizontal font-weight-bold">
              <li className="list-group-item d-flex flex-column bg-light text-dark">
                importe: $
                <input
                  type="text"
                  value={cuenta.importe}
                  className="form-control form-control-lg font-weight-bold txtDscto text-center"
                  readOnly
                />
              </li>
              <li className="list-group-item d-flex flex-column bg-light text-dark">
                Dscto: -$
                <input
                  type="text"
                  value={cuenta.dscto}
                  className="form-control form-control-lg font-weight-bold txtDscto text-center"
                  readOnly
                />
              </li>
              <li className="list-group-item d-flex flex-column bg-light text-dark mr-1">
                total: $
                <input
                  type="text"
                  value={cuenta.total}
                  className="form-control form-control-lg font-weight-bold txtDscto text-center"
                  readOnly
                />
              </li>
              <li className="list-group-item d-flex flex-column bg-light text-dark">
                efectivo: $
                <input
                  type="text"
                  value={cuenta.efectivo}
                  className="form-control form-control-lg font-weight-bold txtDscto text-center"
                  readOnly
                />
              </li>
              <li className="list-group-item d-flex flex-column bg-light text-dark">
                tarjeta: $
                <input
                  type="text"
                  value={cuenta.tarjeta}
                  className="form-control form-control-lg font-weight-bold txtDscto text-center"
                  readOnly
                />
              </li>
              <li className="list-group-item d-flex flex-column bg-light text-dark">
                cambio: $
                <input
                  type="text"
                  value={cuenta.cambio}
                  className="form-control form-control-lg font-weight-bold txtDscto text-center"
                  readOnly
                />
              </li>
            </ul>
          </div>
        </div>
      </div>
      <ComandaModal
        show={modalComanda}
        onHide={() => setModalComanda(false)}
        cuenta={cuenta}
        comanda={false}
      />
    </div>
  );
}
