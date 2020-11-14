import { useState, useEffect, useRef } from "react";
import { Modal } from "react-bootstrap";
import axios from "axios";
import {
  fechaISO,
  formatDate,
  fechaActual,
  operadorRol,
  operadorSession,
  cuentaConstructor,
  apiURI,
  commit,
  processImporte,
} from "../../helpers";

export default function AbrirDomicilioModal(props) {
  const { setCuenta, loadcuentas, setModalcaptura } = props;

  const [clientedata, setClientedata] = useState({ id: null });
  const [onexited, setOnexited] = useState(false);
  const [onshow, setOnshow] = useState(false);

  const alcerrar = () => {
    setOnexited(true);
  };

  const alabrir = () => {
    setOnshow(true);
  };

  return (
    <Modal
      {...props}
      onExited={alcerrar}
      onShow={alabrir}
      size="lg"
      backdrop="static"
      keyboard="false"
      dialogClassName="modal-domicilio"
    >
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <ul className="nav nav-pills">
              <li className="nav-item">
                <a
                  href="#formulario"
                  className="nav-link border mr-1 active"
                  data-toggle="pill"
                  aria-selected="true"
                >
                  formulario
                </a>
              </li>
              <li className="nav-item">
                <a
                  href="#historial"
                  className="nav-link border mr-1"
                  data-toggle="pill"
                  aria-selected="false"
                >
                  historial
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="row">
          <div className="tab-content col-md-12">
            <div className="tab-pane fade show active" id="formulario">
              <Formulario
                onHide={props.onHide}
                onexited={onexited}
                onshow={onshow}
                setCuenta={setCuenta}
                loadcuentas={loadcuentas}
                setModalcaptura={setModalcaptura}
                setClientedata={setClientedata}
              />
            </div>
            <div className="tab-pane fade show" id="historial">
              <Historial
                clientedata={clientedata}
                setCuentax={setCuenta}
                loadcuentasx={loadcuentas}
                onHide={props.onHide}
                onexited={onexited}
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function Formulario(props) {
  const {
    setClientedata,
    setCuenta,
    loadcuentas,
    setModalcaptura,
    onexited,
    onshow,
  } = props;

  const inputName = useRef();
  const inputEntry = useRef();
  const [disabled, setDisabled] = useState(true);
  const [disabledBtn, setDisabledBtn] = useState(true);
  const [formaction, setFormaction] = useState("new");
  const [clientes, setClientes] = useState([]);
  const [listclientes, setListclientes] = useState([]);
  const [cliente, setCliente] = useState({
    namex: "",
    tel: "",
    calle: "",
    cruces: "",
    colonia: "",
    obs: "",
  });
  const [valuesearch, setValuesearch] = useState({ entry: "" });
  const [errorsearch, setErrorsearch] = useState(".");
  const [successmsj, setSuccessmsj] = useState(".");

  useEffect(() => {
    loadclientes();
  }, []);

  useEffect(() => {
    reset();
  }, [onexited]);

  useEffect(() => {
    inputEntry.current.focus();
  }, [onshow]);

  const loadclientes = async () => {
    const data = await axios.get(apiURI + "/clientes");
    setClientes(data.data);
  };

  const nuevo = () => {
    setCliente({
      namex: "",
      tel: valuesearch.entry,
      calle: "",
      cruces: "",
      colonia: "",
      obs: "",
    });
    setClientedata({});
    setFormaction("new");
    setDisabled(false);
    inputName.current.focus();
  };

  const editar = () => {
    setFormaction("edit");
    setDisabled(false);
    inputName.current.focus();
  };

  const reset = () => {
    setCliente({
      namex: "",
      tel: "",
      calle: "",
      cruces: "",
      colonia: "",
      obs: "",
      id: null,
    });
    setClientedata({});
    setDisabled(true);
    setListclientes([]);
    setValuesearch({ entry: "" });
  };

  const onCliente = (e) => {
    setCliente({ ...cliente, [e.target.name]: e.target.value });
  };

  const handlecliente = async (e) => {
    e.preventDefault();
    if (formaction === "new") {
      const data = {
        name: cliente.namex.trim(),
        tel: cliente.tel.trim(),
        address: {
          calle: cliente.calle,
          cruces: cliente.cruces,
          colonia: cliente.colonia,
          obs: cliente.obs,
        },
        createdAt: fechaISO(),
        createdBy: operadorSession,
        lastEdit: "",
      };
      const res = await axios.post(apiURI + "/clientes", data);
      setCliente({
        namex: res.data.name,
        tel: res.data.tel,
        calle: res.data.address.calle,
        cruces: res.data.address.cruces,
        colonia: res.data.address.colonia,
        obs: res.data.address.obs,
        id: res.data.id,
      });
      setClientedata(res.data);
      loadclientes();
      setDisabled(true);
      setDisabledBtn(false);
      setSuccessmsj("registrado con éxito");
      await commit(
        "ha registrado en domicilio a cliente " + res.data.name,
        operadorSession
      );
    } else if (formaction === "edit") {
      const data = {
        name: cliente.namex.trim(),
        tel: cliente.tel.trim(),
        address: {
          calle: cliente.calle,
          cruces: cliente.cruces,
          colonia: cliente.colonia,
          obs: cliente.obs,
        },
        createdAt: cliente.createdBy,
        createdBy: cliente.createdBy,
        lastEdit: fechaISO(),
      };
      const res = await axios.put(apiURI + "/clientes/" + cliente.id, data);
      loadclientes();
      setClientedata(res.data);
      setDisabled(true);
      setSuccessmsj("registrado con éxito");
      await commit(
        "ha editado al clinte en domicilio " + cliente.namex,
        operadorSession
      );
    }
  };

  const onSearch = (e) => {
    setValuesearch({ ...valuesearch, [e.target.name]: e.target.value });
    setErrorsearch(".");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const result = clientes.filter(
      (cliente) =>
        cliente.tel === valuesearch.entry.trim() ||
        cliente.name === valuesearch.entry.trim()
    );
    if (result.length > 0) {
      setListclientes(result);
    } else {
      setErrorsearch("Cliente no encontrado");
      setListclientes([]);
    }
  };

  const selectCliente = (id) => {
    const _cliente = clientes.find((cliente) => cliente.id === id);
    if (_cliente) {
      setClientedata(_cliente);
      setDisabledBtn(false);
      setCliente({
        namex: _cliente.name,
        tel: _cliente.tel,
        calle: _cliente.address.calle,
        cruces: _cliente.address.cruces,
        colonia: _cliente.address.colonia,
        obs: _cliente.address.obs,
        id: _cliente.id,
      });
      setValuesearch({ entry: "" });
    }
  };

  const aceptar = async () => {
    const _cuentas = await axios.get(apiURI + "/cuentas");
    let folio = 0,
      orden = 0,
      currentDate = fechaActual(Date.now());

    const lastFolio = _cuentas.data[_cuentas.data.length - 1];
    if (!lastFolio) {
      folio = 1;
      orden = 1;
    } else {
      let oldDAte = lastFolio.fecha;
      if (oldDAte === currentDate) {
        folio = lastFolio.folio + 1;
        orden = lastFolio.orden + 1;
      } else {
        orden = 1;
        folio = lastFolio.folio + 1;
      }
    }
    const data = {
      ...cuentaConstructor,
      torreta: cliente.namex,
      personas: 1,
      servicio: "domicilio",
      createdAt: fechaISO(),
      cliente: {
        name: cliente.namex,
        tel: cliente.tel,
        address: {
          calle: cliente.calle,
          cruces: cliente.cruces,
          colonia: cliente.colonia,
          obs: cliente.obs,
        },
        id: cliente.id,
      },
      folio,
      orden,
    };
    const newCuenta = await axios.post(apiURI + "/cuentas", data);
    await commit("ha creado la orden en domicilio " + orden, operadorSession);
    setCuenta(newCuenta.data);
    loadcuentas();
    props.onHide();
    setTimeout(() => {
      setModalcaptura(true);
    }, 500);
  };

  return (
    <div className="row">
      <div className="col-md-8 px-0">
        <div className="card">
          <div className="card-header p-2">
            <button
              onClick={nuevo}
              type="button"
              className="btn btn-warning btn-lg font-weight-bold"
            >
              Nuevo
            </button>
            <button
              onClick={editar}
              type="button"
              className="btn btn-warning btn-lg ml-1 font-weight-bold"
            >
              Editar
            </button>
            <button
              onClick={aceptar}
              type="button"
              className="btn btn-success btn-lg ml-1 font-weight-bold"
              disabled={disabledBtn}
            >
              Aceptar
            </button>
            <button
              onClick={() => props.onHide()}
              type="button"
              className="btn btn-danger btn-lg ml-1 font-weight-bold"
            >
              Cancelar
            </button>
          </div>
          <div className="card-body p-2">
            <form onSubmit={handlecliente} disabled={disabled}>
              <div className="form-group">
                <label>contacto</label>
                <input
                  className="form-control form-control-lg font-weight-bold"
                  type="text"
                  name="namex"
                  ref={inputName}
                  value={cliente.namex}
                  onChange={onCliente}
                  placeholder="Nombre"
                  required
                  autoComplete="new-password"
                />
                <input
                  className="form-control form-control-lg font-weight-bold"
                  type="text"
                  name="tel"
                  value={cliente.tel}
                  onChange={onCliente}
                  placeholder="Teléfono"
                  required
                  autoComplete="new-password"
                />
              </div>
              <div className="form-group">
                <label>Dirección</label>
                <input
                  className="form-control form-control-lg font-weight-bold"
                  type="text"
                  name="calle"
                  value={cliente.calle}
                  onChange={onCliente}
                  placeholder="Calle"
                  required
                  autoComplete="new-calle"
                />
                <input
                  className="form-control form-control-lg font-weight-bold"
                  type="text"
                  name="cruces"
                  value={cliente.cruces}
                  onChange={onCliente}
                  placeholder="Cruces"
                  required
                  autoComplete="off"
                />
                <input
                  className="form-control form-control-lg font-weight-bold"
                  type="text"
                  name="colonia"
                  value={cliente.colonia}
                  onChange={onCliente}
                  placeholder="Colonia"
                  required
                  autoComplete="off"
                />
                <textarea
                  className="form-control form-control-lg font-weight-bold"
                  name="obs"
                  value={cliente.obs}
                  onChange={onCliente}
                  rows="2"
                  placeholder="Observaciones"
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary btn-lg">
                Guardar &#128190;
              </button>
              <small className="form-text text-success">{successmsj}</small>
            </form>
          </div>
        </div>
      </div>
      <div className="col-md-4 px-0">
        <div className="card">
          <div className="card-header">
            <form className="form-inline" onSubmit={handleSearch}>
              <div className="form-group">
                <input
                  className="form-control"
                  type="text"
                  name="entry"
                  ref={inputEntry}
                  value={valuesearch.entry}
                  onChange={onSearch}
                  required
                  autoComplete="off"
                />
              </div>
              <button type="submit" className="btn btn-primary">
                &#x1F50D;
              </button>
            </form>
            <small className="form-text text-danger">{errorsearch}</small>
          </div>
          <div className="card-body p-1">
            <div className="list-group">
              {listclientes.map((cliente) => (
                <button
                  key={cliente.id}
                  onClick={() => selectCliente(cliente.id)}
                  type="button"
                  className="list-group-item list-group-item-action my-1 text-uppercase font-weight-bold"
                >
                  {cliente.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Historial(props) {
  const { clientedata, setCuentax, loadcuentasx, onHide, onexited } = props;

  const [cuentas, setCuentas] = useState([]);
  const [cuenta, setCuenta] = useState({});

  useEffect(() => {
    loadcuentas();
  }, [clientedata]);

  useEffect(() => {
    setCuentas([]);
    setCuenta({});
  }, [onexited]);

  const loadcuentas = async () => {
    const data = await axios.get(apiURI + "/cuentas?_sort=id&_order=desc");
    const _cuentas = data.data.filter(
      (cuenta) => cuenta.cliente.id === clientedata.id
    );
    if (_cuentas.length > 0) {
      setCuentas(_cuentas);
    } else {
      setCuentas([]);
    }
  };

  const selectCuenta = (id) => {
    const _cuenta = cuentas.find((cuenta) => cuenta.id === id);
    if (_cuenta) {
      setCuenta(_cuenta);
    } else {
      alert("ERROR FATAL: no se enconro la cuenta seleccionada");
    }
  };

  const repedir = async () => {
    if (
      window.confirm(
        "ESTA ACCIÓN ABRIRÁ UNA NUEVA CUENTA EN DOMICILIO\nCONFIRMAR ACCIÓN"
      )
    ) {
      const _cuentas = await axios.get(apiURI + "/cuentas");
      let folio = 0,
        orden = 0,
        currentDate = fechaActual(Date.now());

      const lastFolio = _cuentas.data[_cuentas.data.length - 1];
      if (!lastFolio) {
        folio = 1;
        orden = 1;
      } else {
        let oldDAte = lastFolio.fecha;
        if (oldDAte === currentDate) {
          folio = lastFolio.folio + 1;
          orden = lastFolio.orden + 1;
        } else {
          orden = 1;
          folio = lastFolio.folio + 1;
        }
      }

      const data = {
        ...cuentaConstructor,
        torreta: cuenta.torreta,
        personas: cuenta.personas,
        servicio: "domicilio",
        cliente: clientedata,
        createdAt: fechaISO(),
        items: cuenta.items,
        importe: processImporte.totalItems(cuenta.items, cuenta.dscto).importe,
        total: processImporte.totalItems(cuenta.items, cuenta.dscto).total,
        folio,
        orden,
      };
      const newCuenta = await axios.post(apiURI + "/cuentas", data);
      setCuentax(newCuenta.data);
      loadcuentasx();
      loadcuentas();
      commit(
        "ha creado la orden en domicilio por historial " + orden,
        operadorSession
      );
      onHide();
    }
  };

  return (
    <div className="row">
      <div className="col-md-4">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title">historial de pedidos</h5>
            <p className="card-text lead font-weight-bold">
              {clientedata.name}
            </p>
            <p className="card-text">
              {" "}
              pedidos{" "}
              <span className="badge badge-primary">{cuentas.length}</span>
            </p>
          </div>
          <div className="card-body p-1">
            <div className="list-group contenedor-scroll-y list-items">
              {cuentas.length > 0 ? (
                cuentas.map((cuenta) => (
                  <button
                    onClick={() => selectCuenta(cuenta.id)}
                    type="button"
                    className="list-group-item list-group-item-action my-1 text-uppercase font-weight-bold"
                  >
                    {formatDate(cuenta.createdAt)} ${cuenta.total}
                  </button>
                ))
              ) : (
                <h5 className="text-danger text-center">sin historial aún</h5>
              )}
            </div>
          </div>
        </div>
        <div className="card-footer p-1">
          <button
            onClick={repedir}
            type="button"
            className="btn btn-success font-weight-bold"
            disabled={cuentas.length > 0 ? false : true}
          >
            volver a pedir
          </button>
        </div>
      </div>
      <div className="col-md-8 p-1">
        <div className="card">
          <div className="card-header p-1">
            <small>
              <ul className="list-group list-group-horizontal text-uppercase">
                <li className="list-group-item d-flex flex-column align-items-center p-1">
                  torreta:{" "}
                  <span className="font-weight-bolder">{cuenta.torreta}</span>
                </li>
                <li className="list-group-item d-flex flex-column align-items-center p-1">
                  orden:{" "}
                  <span className="font-weight-bolder">{cuenta.orden}</span>
                </li>
                <li className="list-group-item d-flex flex-column align-items-center p-1">
                  folio:{" "}
                  <span className="font-weight-bolder">{cuenta.folio}</span>
                </li>
                <li className="list-group-item d-flex flex-column align-items-center p-1">
                  apertura:{" "}
                  <span className="font-weight-bolder">
                    {formatDate(cuenta.createdAt)}
                  </span>
                </li>
                <li className="list-group-item d-flex flex-column align-items-center p-1">
                  cierre:{" "}
                  <span className="font-weight-bolder">
                    {formatDate(cuenta.closedAt)}
                  </span>
                </li>
                <li className="list-group-item d-flex flex-column align-items-center p-1">
                  operador:{" "}
                  <span className="font-weight-bolder">{cuenta.createdBy}</span>
                </li>
              </ul>
            </small>
          </div>
          <div className="card-body p-1 list-items">
            <table className="table table-sm table-bordered bg-light">
              <thead>
                <tr className="text-center">
                  <th scope="col">cant</th>
                  <th scope="col">Desc</th>
                  <th scope="col">importe</th>
                </tr>
              </thead>
              <tbody>
                {!cuenta.items
                  ? null
                  : cuenta.items.map((item) => (
                      <tr>
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
                        <td className="text-center font-weight-bold">
                          ${item.importe}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
          <div className="card-footer p-1">
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
    </div>
  );
}
