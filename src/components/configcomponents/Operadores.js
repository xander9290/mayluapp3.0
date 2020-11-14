import { useState, useEffect } from "react";
import {
  apiURI,
  commit,
  fechaActual,
  fechaISO,
  formatDate,
  operadorRol,
  operadorSession,
} from "../../helpers";
import axios from "axios";
import bcrypt from "bcryptjs";

export default function Operadores(props) {
  const { servicechange } = props;

  const [operadores, setOperadores] = useState([]);
  const [logs, setLogs] = useState([]);
  const [searchLogs, setSearchLogs] = useState({
    fecha: fechaActual(),
    operador: "",
  });
  const [searchmsj, setSearchmsj] = useState(".");
  const [values, setValues] = useState({
    name: "",
    pswd: "",
    rol: "",
  });
  const [successmsj, setSuccesmsj] = useState(".");
  const [existemsj, setExistemsj] = useState(".");
  const [action, setAction] = useState("new");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [modalResp, setModalResp] = useState(null);

  useEffect(() => {
    loadoperadores();
    loadlogs();
    reset();
  }, [servicechange]);

  const reset = () => {
    setValues({
      name: "",
      pswd: "",
      rol: "",
    });
    setAction("new");
    setSearchLogs({ fecha: fechaActual(), operador: "" });
  };

  const loadoperadores = async () => {
    const data = await axios.get(apiURI + "/operadores");
    setOperadores(data.data);
  };

  const loadlogs = async () => {
    const data = await axios.get(apiURI + "/logs");
    setLogs(data.data);
  };

  const onValues = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    setExistemsj("-");
  };

  const hanldeOPerador = async (e) => {
    e.preventDefault();
    if (action === "new") {
      let existe = false;
      operadores.map((o) => {
        if (o.name === values.name) {
          existe = !existe;
        }
      });

      if (existe) {
        setExistemsj("Nombre no disponible");
      } else {
        const saltos = await bcrypt.genSalt(5);
        const pswd = await bcrypt.hash(values.pswd, saltos);
        const data = {
          name: values.name,
          pswd,
          rol: values.rol,
          createdAt: fechaISO(),
          createdBy: operadorSession,
          lastEdit: "",
        };
        await axios.post(apiURI + "/operadores", data);
        loadoperadores();
        reset();
        setSuccesmsj("Agreado correctamente");
        commit(`ha creado a operador ${values.name}`, operadorSession);
        setTimeout(() => {
          setSuccesmsj("-");
        }, 1200);
        loadlogs();
      }
    } else if (action === "edit") {
      const saltos = await bcrypt.genSalt(5);
      const pswd = await bcrypt.hash(values.pswd, saltos);
      const data = {
        name: values.name,
        pswd,
        rol: values.rol,
        createdAt: values.createdAt,
        createdBy: values.createdBy,
        lastEdit: fechaISO(),
      };
      await axios.put(apiURI + "/operadores/" + values.id, data);
      loadoperadores();
      reset();
      setSuccesmsj("Editado correctamente");
      commit(`ha editado a operador ${values.name}`, operadorSession);
      setTimeout(() => {
        setSuccesmsj("-");
      }, 1200);
      loadlogs();
    }
  };

  const selectOperador = (id) => {
    const operador = operadores.find((o) => o.id === id);
    if (operador) {
      setAction("edit");
      setValues({
        name: operador.name,
        rol: operador.rol,
        pswd: operador.pswd,
        createdAt: operador.createdAt,
        createdBy: operador.createdBy,
        lastEdit: operador.lastEdit,
        id: operador.id,
      });
    }
  };

  const deleteOperador = async (id, name) => {
    if (window.confirm("confirmar acción")) {
      await axios.delete(apiURI + "/operadores/" + id);
      commit(`ha eliminado operador ${name}`, operadorSession);
      loadoperadores();
      loadlogs();
      reset();
    }
  };

  const onSearchLogs = (e) => {
    setSearchLogs({ ...searchLogs, [e.target.name]: e.target.value });
  };

  const handleSearchLogs = async (e) => {
    e.preventDefault();
    // const data = await axios.get(
    //   `${apiURI}/logs?fecha=${searchLogs.fecha}&operador=${searchLogs.operador}`
    // );
    const resulst = logs.filter(
      (l) => l.fecha === searchLogs.fecha && l.operador === searchLogs.operador
    );
    if (resulst.length > 0) {
      setLogs(resulst);
    } else {
      setSearchmsj("Sin registros");
      setTimeout(() => {
        setSearchmsj("-");
      }, 1600);
    }
  };

  const actualizarLogs = () => {
    loadlogs();
    setSearchLogs({ fecha: fechaActual(), operador: "" });
  };

  const deleteLog = async (id) => {
    if (window.confirm("confirmar acción")) {
      await axios.delete(apiURI + "/logs/" + id);
      loadlogs();
      setSearchmsj("hecho");
      setTimeout(() => {
        setSearchmsj("-");
      }, 1600);
    }
  };

  return (
    <div className="row">
      <div className="col-md-3">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title">Operadores</h5>
          </div>
          <div className="card-body">
            <h6 className="card-title">Nuevo operador</h6>
            <form onSubmit={hanldeOPerador}>
              <div className="form-group">
                <input
                  type="type"
                  name="name"
                  value={values.name}
                  onChange={onValues}
                  className="form-control"
                  placeholder="Nombre"
                  autoComplete="off"
                  required
                />
                <small className="form-text text-danger">{existemsj}</small>
              </div>
              <div className="form-group">
                <input
                  type="password"
                  name="pswd"
                  value={values.pswd}
                  onChange={onValues}
                  className="form-control"
                  placeholder="Contraseña"
                  maxLength="4"
                  autoComplete="off"
                  required
                />
                <small className="form-text">4 caracteres requeridos</small>
              </div>
              <div className="form-group">
                <label>Rol</label>
                <select
                  className="form-control"
                  name="rol"
                  value={values.rol}
                  onChange={onValues}
                  required
                >
                  <option></option>
                  <option
                    value="master"
                    className="text-uppercase font-weight-bolder"
                  >
                    master
                  </option>
                  <option
                    value="cajero"
                    className="text-uppercase font-weight-bolder"
                  >
                    cajero
                  </option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary">
                Aceptar
              </button>
              <button
                type="reset"
                onClick={reset}
                className="btn btn-warning ml-1"
              >
                Cancelar
              </button>
              <small className="form-text text-success">{successmsj}</small>
            </form>
          </div>
          <div className="card-footer">
            <small>
              <p className="p-0 m-0">
                creación:{" "}
                <span className="font-weight-bold">
                  {formatDate(values.createdAt)}
                </span>
              </p>
              <p className="p-0 m-0">
                Creado por:{" "}
                <span className="font-weight-bold">{values.createdBy}</span>
              </p>
              <p className="p-0 m-0">
                úlitma edición:{" "}
                <span className="font-weight-bold">
                  {formatDate(values.lastEdit)}
                </span>
              </p>
            </small>
          </div>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card">
          <div className="card-body">
            <table className="table table-sm table-bordered text-uppercase">
              <thead>
                <tr className="text-center">
                  <th scope="col">DEL</th>
                  <th scope="col">EDIT</th>
                  <th scope="col">nombre</th>
                  <th scope="col">rol</th>
                </tr>
              </thead>
              <tbody>
                {operadores.map((c) => (
                  <tr key={c.id} className="text-uppercase">
                    <th scope="row" className="text-center">
                      <button
                        style={{
                          display: c.id === "3b12193b-e553-4fe8-921a-101a33847112" ? "none" : "block",
                        }}
                        title="ELIMINAR"
                        onClick={() => deleteOperador(c.id, c.name)}
                        className="btn btn-danger btn-sm"
                      >
                        &times;
                      </button>
                    </th>
                    <th scope="row" className="text-center">
                      <button
                        title="EDITAR"
                        onClick={() => selectOperador(c.id)}
                        className="btn btn-warning btn-sm"
                      >
                        &#9998;
                      </button>
                    </th>
                    <td>{c.name}</td>
                    <td>{c.rol}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="col-md-5">
        <div className="card">
          <div className="card-header d-flex justify-content-between">
            <div className="d-flex align-items-center">
              <form className="form-inline" onSubmit={handleSearchLogs}>
                <div className="form-group">
                  <input
                    className="form-control form-control-sm mr-1"
                    type="date"
                    name="fecha"
                    value={searchLogs.fecha}
                    max={fechaActual()}
                    onChange={onSearchLogs}
                  />
                </div>
                <div className="form-group">
                  <select
                    name="operador"
                    className="form-control form-control-sm text-uppercase"
                    value={searchLogs.operador}
                    onChange={onSearchLogs}
                  >
                    <option> </option>
                    {operadores.map((o) => (
                      <option
                        key={o.id}
                        className="font-weight-bolder"
                        value={o.name}
                      >
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn btn-primary btn-sm">
                  &#x1F50D;
                </button>
              </form>
            </div>
            <div>
              <button
                type="button"
                onClick={actualizarLogs}
                className="btn btn-primary btn-sm"
                title="actualizar"
              >
                actalizar &#128472;
              </button>
            </div>
          </div>
          <div className="card-body list-items-table p-1">
            <small className="text-danger ml-1">{searchmsj}</small>
            <table className="table table-sm table-bordered text-uppercase">
              <thead>
                <tr className="text-center">
                  <th scope="col">del</th>
                  <th scope="col">nombre</th>
                  <th scope="col">commit</th>
                  <th scope="col">fecha</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="text-lowercase">
                    <td className="text-center">
                      <button
                        onClick={() => deleteLog(l.id)}
                        className="btn btn-danger btn-sm"
                      >
                        &times;
                      </button>
                    </td>
                    <td>{l.operador}</td>
                    <td>{l.commit}</td>
                    <td>{formatDate(l.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card-footer"></div>
        </div>
      </div>
    </div>
  );
}
