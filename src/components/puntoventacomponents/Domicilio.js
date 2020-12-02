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
  processImporte,
} from "../../helpers";

import AbrirDomicilioModal from "../modals/AbrirDomicilio";
import CapturaModal from "../modals/Captura";
import ComandaModal from "../modals/Comanda";
import PagarCuentaModal from "../modals/PagarCuentaModal";
import InfoCliente from "../modals/Info";
import ReasignarClienteModal from "../modals/ReasignarModal";

export default function Domicilio(props) {
  const { changeservicio } = props;

  const [cuentas, setCuentas] = useState([]);
  const [cuenta, setCuenta] = useState(cuentaConstructor);
  const [dscto, setDscto] = useState({ dscto: 0 });
  const [abrircuentamodal, setAbrircuentamodal] = useState(false);
  const [modalcaptura, setModalcaptura] = useState(false);
  const [modalComanda, setModalComanda] = useState(false);
  const [modalPagar, setmodalPagar] = useState(false);
  const [modalinfo, setModalinfo] = useState(false);
  const [reasignarModal, setReasignarModal] = useState(false);

  useEffect(() => {
    loadcuentas();
  }, []);

  useEffect(() => {
    loadcuentas();
    setCuenta(cuentaConstructor);
  }, [changeservicio]);

  const loadcuentas = async () => {
    const data = await axios.get(
      apiURI + "/cuentas/abierto/" + fechaActual(Date.now())
    );
    //const cuentasAbiertas = data.data.filter(cuenta=>cuenta.estado==="abierto");
    const _cuentas = data.data.filter(
      (cuenta) => cuenta.servicio === "domicilio"
    );
    setCuentas(_cuentas);
  };

  const selectCuenta = async (id) => {
    // const result = cuentas.find((cuenta) => cuenta.id === id);
    const res = await axios.get(apiURI + "/cuentas/" + id);
    if (res.data) {
      setCuenta(res.data);
      document.title = `MAyLU - ${res.data.torreta} - $${res.data.total}.00`;
    }
  };

  const capturar = () => {
    if (cuenta.id) {
      setModalcaptura(true);
    } else {
      alert("SELECCIONA UNA CUENTA PARA CONTINUAR");
    }
  };

  const imprimir = async () => {
    if (cuenta.items.length > 0) {
      if (cuenta.id) {
        const data = {
          ...cuenta,
          impreso: true,
        };
        const res = await axios.put(apiURI + "/cuentas/" + cuenta.id, data);
        await commit("ha impreso la orden " + cuenta.orden, operadorSession);
        setCuenta(res.data);
        // loadcuentas();
        setModalComanda(true);
      } else {
        alert("SELECCIONA UNA CUENTA PARA CONTINUAR");
      }
    } else {
      alert("LA CUENTA ESTÁ VACÍA");
    }
  };

  const reabrir = async () => {
    if (operadorRol === "master") {
      if (window.confirm("CONFIRMAR ACCIÓN")) {
        const data = {
          ...cuenta,
          impreso: false,
          closedAt: "",
        };
        const res = await axios.put(apiURI + "/cuentas/" + cuenta.id, data);
        commit("ha reabierto la orden " + cuenta.orden, operadorSession);
        setCuenta(res.data);
        // loadcuentas();
      }
    } else {
      alert("!DENEGADO!\nEsta acción requiere supervisión");
    }
  };

  const deleteItem = async (idx, importe) => {
    if (window.confirm("CONFIRMAR ACCIÓN")) {
      let list = cuenta.items;
      // list.splice(idx, 1);
      list[idx].cancelado = true;
      list[idx].importe = 0;
      const data = {
        ...cuenta,
        items: list,
        importe: processImporte.totalItems(list, cuenta.dscto).importe,
        total: processImporte.totalItems(list, cuenta.dscto).total,
      };
      const res = await axios.put(apiURI + "/cuentas/" + cuenta.id, data);
      commit(
        "ha cancelado un producto de la cuenta " + cuenta.orden,
        operadorSession
      );
      setCuenta(res.data);
      // loadcuentas();
    }
  };

  const onDscto = (e) => {
    setDscto({ ...dscto, [e.target.name]: e.target.value });
  };

  const handleDscto = async (e) => {
    e.preventDefault();
    if (operadorRol === "master") {
      if (window.confirm("CONFIRMAR ACCIÓN") && cuenta.id) {
        const data = {
          ...cuenta,
          dscto: parseInt(dscto.dscto),
          total: processImporte.totalItems(cuenta.items, dscto.dscto).total,
        };
        const res = await axios.put(apiURI + "/cuentas/" + cuenta.id, data);
        await commit(
          "ha aplicado un descuento en la orden: " + cuenta.orden,
          operadorSession
        );
        setCuenta(res.data);
        // loadcuentas();
        setDscto({ dscto: 0 });
      } else {
        alert("Selecciona una cuenta para continuar");
        setDscto({ dscto: 0 });
      }
    } else {
      alert("!DENEGADO!\nEsta acción requiere supervisión");
    }
  };

  const cancelarCuenta = async () => {
    if (operadorRol === "master") {
      if (window.confirm("CONFIRMAR ACCIÓN")) {
        const data = {
          ...cuenta,
          estado: "cancelado",
        };
        await axios.put(apiURI + "/cuentas/" + cuenta.id, data);
        await commit("ha cancelado la orden: " + cuenta.orden, operadorSession);
        setCuenta(cuentaConstructor);
        loadcuentas();
      }
    } else {
      alert("!DENEGADO!\nEsta acción requiere supervisión");
    }
  };

  const reasignar = () => {
    if(cuenta.id) {
      setReasignarModal(true);
    } else {
      alert("Selecciona una cuenta para continuar");
    }
  }

  return (
    <div className="row">
      <div className="col-md-4 p-0 mt-1">
        <div className="card bg-secondary puntoventa-container">
          <div className="card-header p-1">
            <button
              onClick={() => setAbrircuentamodal(true)}
              type="button"
              className="btn btn-warning mr-1 font-weight-bold"
            >
              Abrir
            </button>
            <button
              type="button"
              onClick={capturar}
              className="btn btn-warning mr-1 font-weight-bold"
              disabled={cuenta.impreso ? true : false}
            >
              Capturar
            </button>
            <button
              onClick={imprimir}
              type="button"
              className="btn btn-warning mr-1 font-weight-bold"
            >
              Imprimir
            </button>
            <button
              onClick={() => setmodalPagar(true)}
              type="button"
              className="btn btn-warning mr-1 font-weight-bold"
              disabled={cuenta.impreso ? false : true}
            >
              Pagar
            </button>
            <button
              onClick={() => setModalinfo(true)}
              type="button"
              className="btn btn-warning mr-1 font-weight-bold"
              disabled={cuenta.id ? false : true}
            >
              Info
            </button>
          </div>
          <div className="card-body p-1 contenedor-scroll-y">
            <div className="list-group">
              {cuentas.map((cuenta) => (
                <CuentaItem
                  key={cuenta.id}
                  cuenta={cuenta}
                  selectCuenta={selectCuenta}
                />
              ))}
            </div>
          </div>
          <div className="card-footer">
            <button
              onClick={cancelarCuenta}
              type="button"
              className="btn btn-warning mr-1 font-weight-bold"
              disabled={cuenta.impreso ? false : true}
            >
              Cancelar
            </button>
            <button
              onClick={reabrir}
              type="button"
              className="btn btn-warning mr-1 font-weight-bold"
              disabled={cuenta.impreso ? false : true}
            >
              Reabrir
            </button>
            <button
              onClick={reasignar}
              type="button"
              className="btn btn-warning mr-1 font-weight-bold"
            >
              Reasignar
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
              {/* <li className="list-group-item p-1">
                cierre:{" "}
                <span className="font-weight-bolder">
                  {formatDate(cuenta.closedAt)}
                </span>
              </li> */}
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
                  <th scope="col">DEL</th>
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
                      <tr className={item.cancelado ? "bg-danger" : ""} key={i}>
                        <th className="text-center">
                          <button
                            onClick={() => deleteItem(i, item.importe)}
                            type="button"
                            className="btn btn-danger btn-sm"
                            disabled={cuenta.impreso ? true : false}
                            style={{
                              display: item.cancelado ? "none" : "block",
                            }}
                          >
                            &times;
                          </button>
                        </th>
                        <td className="text-center font-weight-bold lead">
                          {item.cant}
                        </td>
                        <td className="text-left font-weight-bold lead">
                          <p className="m-0 p-0">
                            {item.name} {item.cancelado ? "(X)" : ""}
                          </p>
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
          <div className="card-footer d-flex justify-content-between align-content-center">
            <form
              onSubmit={handleDscto}
              className="form-inline"
              disabled={cuenta.impreso ? true : false}
            >
              <div className="form-group">
                <input
                  type="number"
                  name="dscto"
                  value={dscto.dscto}
                  onChange={onDscto}
                  className="form-control form-control-lg font-weight-bold txtDscto"
                  min="0"
                  required
                />
                <button
                  type="submit"
                  title="Descontar"
                  className="btn btn-warning btn-lg font-weight-bold"
                >
                  - $
                </button>
              </div>
            </form>
            <ul className="list-group list-group-horizontal font-weight-bold">
              <li className="list-group-item d-flex align-items-center bg-light text-dark">
                importe: $
                <input
                  type="text"
                  value={cuenta.importe}
                  className="form-control form-control-lg font-weight-bold txtDscto"
                  readOnly
                />
              </li>
              <li className="list-group-item d-flex align-items-center bg-light text-dark">
                Dscto: -$
                <input
                  type="text"
                  value={cuenta.dscto}
                  className="form-control form-control-lg font-weight-bold txtDscto"
                  readOnly
                />
              </li>
              <li className="list-group-item d-flex align-items-center bg-light text-dark">
                total: $
                <input
                  type="text"
                  value={cuenta.total}
                  className="form-control form-control-lg font-weight-bold txtDscto"
                  readOnly
                />
              </li>
            </ul>
          </div>
        </div>
      </div>
      <AbrirDomicilioModal
        show={abrircuentamodal}
        onHide={() => setAbrircuentamodal(false)}
        cuentas={cuentas}
        setCuentas={setCuentas}
        setCuenta={setCuenta}
        setModalcaptura={setModalcaptura}
      />
      <CapturaModal
        show={modalcaptura}
        onHide={() => setModalcaptura(false)}
        cuenta={cuenta}
        setCuenta={setCuenta}
      />
      <ComandaModal
        show={modalComanda}
        onHide={() => setModalComanda(false)}
        cuenta={cuenta}
        comanda={true}
      />
      <PagarCuentaModal
        show={modalPagar}
        onHide={() => setmodalPagar(false)}
        cuenta={cuenta}
        setCuenta={setCuenta}
        loadcuentas={loadcuentas}
      />
      <InfoCliente
        show={modalinfo}
        onHide={() => setModalinfo(false)}
        cuenta={cuenta}
      />
      <ReasignarClienteModal
        show={reasignarModal}
        onHide={() => setReasignarModal(false)}
        cuenta={cuenta}
        cuentas={cuentas}
        setCuentas={setCuentas}
        setCuenta={setCuenta}
      />
    </div>
  );
}

function CuentaItem(props) {
  const { cuenta, selectCuenta } = props;

  const [bg, setBg] = useState(
    "list-group-item list-group-item-action my-1 font-weight-bold"
  );

  useEffect(() => {
    timeLapse();
  }, [cuenta]);

  const timeLapse = () => {
    setInterval(() => {
      const oldtime = new Date(cuenta.createdAt),
        currenttime = new Date(),
        diff = currenttime.getMinutes() - oldtime.getMinutes();
      if (diff < 15) {
        setBg("badge badge-success text-success");
      } else if (diff < 25) {
        setBg("badge badge-warning text-warning");
      } else if (diff < 35) {
        setBg("badge badge-danger text-danger");
      }
    }, 1000);
  };

  return (
    <button
      key={cuenta.id}
      type="button"
      onClick={() => selectCuenta(cuenta.id)}
      className="list-group-item list-group-item-action my-1 font-weight-bold border-light"
    >
      <small className="d-flex justify-content-between align-content-center text-uppercase font-weight-bold">
        <span>{cuenta.torreta}</span>
        <span>{cuenta.servicio}</span>
        <span>orden: {cuenta.orden}</span>
        {cuenta.impreso ? <span>&#128438;</span> : null}
        <span className={bg}>{"------"}</span>
      </small>
    </button>
  );
}
