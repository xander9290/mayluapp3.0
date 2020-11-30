import { useState, useEffect } from "react";
import {
  apiURI,
  fechaISO,
  formatDate,
  operadorSession,
  commit,
} from "../../helpers";
import axios from "axios";

export default function Clientes(props) {
  const { servicechange } = props;

  const [clientes, setClientes] = useState([]);
  const [cliente, setCliente] = useState({
    namex: "",
    tel: "",
    calle: "",
    cruces: "",
    colonia: "",
    obs: "",
  });
  const [action, setAction] = useState("new");
  const [successmsj, setSuccessmsj] = useState("-");
  const [search, setSearch] = useState({ entry: "" });
  const [searchmsj, setSearchmsj] = useState("-");

  useEffect(() => {
    loadclientes();
  }, [servicechange]);

  const loadclientes = async () => {
    const data = await axios.get(apiURI + "/clientes");
    setClientes(data.data);
  };

  const reset = () => {
    setCliente({
      namex: "",
      tel: "",
      calle: "",
      cruces: "",
      colonia: "",
      obs: "",
    });
    setAction("new");
    setSearch({ entry: "" });
  };

  const onCliente = (e) => {
    setCliente({ ...cliente, [e.target.name]: e.target.value });
  };

  const handleCliente = async (e) => {
    e.preventDefault();
    if (action === "new") {
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
      try {
        const res = await axios.post(apiURI + "/clientes", data);
        // loadclientes();
        setClientes([...clientes, res.data]);
        reset();
        setSuccessmsj("Guardado correctamente");
        await commit(`ha creado a cliente ${cliente.namex}`, operadorSession);
        setTimeout(() => {
          setSuccessmsj("-");
        }, 1300);
      } catch (error) {
        alert("Error al crear item:\n", error);
      }
    } else if (action === "edit") {
      const data = {
        name: cliente.namex.trim(),
        tel: cliente.tel.trim(),
        address: {
          calle: cliente.calle,
          cruces: cliente.cruces,
          colonia: cliente.colonia,
          obs: cliente.obs,
        },
        createdAt: cliente.createdAt,
        createdBy: operadorSession,
        lastEdit: fechaISO(),
      };
      try {
        const res = await axios.put(apiURI + "/clientes/" + cliente.id, data);
        loadclientes();
        // setClientes([...clientes, res.data]);
        reset();
        setSuccessmsj("Editado correctamente");
        await commit(`ha editado a cliente ${cliente.namex}`, operadorSession);
        setTimeout(() => {
          setSuccessmsj("-");
        }, 1300);
      } catch (error) {
        alert("Error al editar item:\n", error);
      }
    }
  };

  const deleteCliente = async (id, name) => {
    if (window.confirm("confirmar acción")) {
      try {
      await axios.delete(apiURI + "/clientes/" + id);
      loadclientes();
      reset();
      await commit(`ha eliminado a cliente ${name}`, operadorSession);
      setSuccessmsj("Eliminado correctamente");
      setTimeout(() => {
        setSuccessmsj("-");
      }, 1200);
      } catch (error) {
        alert("Error al eliminar item:\n", error);
      }
    }
  };

  const selectCliente = (id) => {
    const getCliente = clientes.find((c) => c.id === id);
    if (getCliente) {
      setAction("edit");
      setCliente({
        namex: getCliente.name,
        tel: getCliente.tel,
        calle: getCliente.address.calle,
        cruces: getCliente.address.cruces,
        colonia: getCliente.address.colonia,
        obs: getCliente.address.obs,
        createdAt: getCliente.createdAt,
        createdBy: getCliente.createdBy,
        lastEdit: getCliente.lastEdit,
        id: getCliente.id,
      });
    }
  };

  const onSearch = (e) => {
    setSearch({ ...search, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const results = [];
    let entry = search.entry.toUpperCase();
    clientes.map((c) => {
      if (c.tel === entry.trim() || c.name === entry.trim()) {
        results.push({
          name: c.name,
          tel: c.tel,
          address: {
            calle: c.address.calle,
            cruces: c.address.cruces,
            colonia: c.address.colonia,
            obs: c.address.obs,
          },
          createdAt: c.createdAt,
          createdBy: c.createdBy,
          lastEdit: c.lastEdit,
          id: c.id,
        });
      }
    });
    if (results.length > 0) {
      setClientes(results);
    } else {
      loadclientes();
      setSearchmsj("sin resultados");
      setTimeout(() => {
        setSearchmsj("");
      }, 1200);
    }
  };

  const actualizar = () => {
    loadclientes();
  };

  return (
    <div className="row">
      <div className="col-md-4">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title">clientes</h5>
          </div>
          <div className="card-body">
            <h6 className="card-title">nuevo cliente</h6>
            <form onSubmit={handleCliente}>
              <div className="form-group">
                <label>contacto</label>
                <input
                  className="form-control"
                  type="text"
                  name="namex"
                  value={cliente.namex}
                  onChange={onCliente}
                  placeholder="Nombre"
                  required
                  autoComplete="new-password"
                />
                <input
                  className="form-control"
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
                  className="form-control"
                  type="text"
                  name="calle"
                  value={cliente.calle}
                  onChange={onCliente}
                  placeholder="Calle"
                  required
                  autoComplete="new-calle"
                />
                <input
                  className="form-control"
                  type="text"
                  name="cruces"
                  value={cliente.cruces}
                  onChange={onCliente}
                  placeholder="Cruces"
                  required
                  autoComplete="off"
                />
                <input
                  className="form-control"
                  type="text"
                  name="colonia"
                  value={cliente.colonia}
                  onChange={onCliente}
                  placeholder="Colonia"
                  required
                  autoComplete="off"
                />
                <textarea
                  className="form-control"
                  name="obs"
                  value={cliente.obs}
                  onChange={onCliente}
                  rows="2"
                  placeholder="Observaciones"
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary">
                Guardar &#128190;
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
                  {formatDate(cliente.createdAt)}
                </span>
              </p>
              <p className="p-0 m-0">
                Creado por:{" "}
                <span className="font-weight-bold">{cliente.createdBy}</span>
              </p>
              <p className="p-0 m-0">
                úlitma edición:{" "}
                <span className="font-weight-bold">
                  {formatDate(cliente.lastEdit)}
                </span>
              </p>
            </small>
          </div>
        </div>
      </div>
      <div className="col-md-8">
        <div className="card">
          <div className="card-header d-flex justify-content-between">
            <div className="d-flex align-items-center">
              <form className="form-inline" onSubmit={handleSearch}>
                <div className="form-group">
                  <input
                    className="form-control"
                    type="text"
                    name="entry"
                    value={search.entry}
                    onChange={onSearch}
                    placeholder="Buscar"
                    required
                    autoComplete="off"
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  &#x1F50D;
                </button>
              </form>
              <span className="badge badge-info ml-1">
                items {clientes.length}
              </span>
              <small className="text-danger ml-1">{searchmsj}</small>
            </div>
            <div>
              <button
                type="button"
                onClick={actualizar}
                className="btn btn-primary"
                title="actualizar"
              >
                actalizar &#128472;
              </button>
            </div>
          </div>
          <div className="card-body list-items-table p-1">
            <table className="table table-sm table-bordered table-hover">
              <thead>
                <tr className="text-center">
                  <th scope="col">DEL</th>
                  <th scope="col">EDIT</th>
                  <th scope="col">Nombre</th>
                  <th scope="col">TELÉFONO</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => (
                  <tr key={c.id} className="text-uppercase">
                    <th scope="row" className="text-center">
                      <button
                        title="ELIMINAR"
                        onClick={() => deleteCliente(c.id, c.name)}
                        className="btn btn-danger btn-sm"
                      >
                        &times;
                      </button>
                    </th>
                    <th scope="row" className="text-center">
                      <button
                        title="EDITAR"
                        onClick={() => selectCliente(c.id)}
                        className="btn btn-warning btn-sm"
                      >
                        &#9998;
                      </button>
                    </th>
                    <td>{c.name}</td>
                    <td>{c.tel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
