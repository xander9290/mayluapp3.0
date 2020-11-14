import { useState, useEffect } from "react";
import { apiURI, fechaISO, formatDate, operadorSession } from "../../helpers";
import axios from "axios";
import { CirclePicker } from "react-color";

export default function Categorias(props) {
  const { servicechange } = props;

  const [err, setErr] = useState("-");
  const [msj, setMsj] = useState("-");
  const [categorias, setCategorias] = useState([]);
  const [values, setValues] = useState({
    name: "",
    fondo: "#ABB8C3",
  });
  const [valuesedit, setValuesedit] = useState({
    name: "",
    fondo: "",
    createdAt: "",
    createdBy: "",
    lastEdit: "",
    id: null,
  });

  useEffect(() => {
    loadcategorias();
    reset();
  }, [servicechange]);

  const loadcategorias = async () => {
    const data = await axios.get(
      apiURI + "/categorias"
    );
    setCategorias(data.data);
  };

  const onValues = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    setErr("-");
  };

  const handlecategoria = async (e) => {
    e.preventDefault();
    let existe = false;
    categorias.map((c) => {
      if (c.name === values.name) {
        existe = true;
      }
    });
    if (existe) {
      setErr("Ya existe una categoría con ese nombre");
    } else {
      const data = {
        ...values,
        createdAt: fechaISO(),
        createdBy: operadorSession,
      };
      await axios.post(apiURI + "/categorias", data);
      loadcategorias();
      reset();
    }
  };

  const selectcategoria = async (id) => {
    // const data = await axios.get(apiURI + "/categorias/" + id);
    const categoria = categorias.find(categoria=>categoria.id===id);
    setValuesedit({
      name: categoria.name,
      fondo: categoria.fondo,
      createdAt: categoria.createdAt,
      createdBy: categoria.createdBy,
      lastEdit: categoria.lastEdit,
      id,
    });
  };

  const deletecategoria = async (id) => {
    if (window.confirm("confirmar acción")) {
      await axios.delete(apiURI + "/categorias/" + id);
      loadcategorias();
      reset();
    }
  };

  const onColor = (color) => {
    setValuesedit({ ...valuesedit, fondo: color.hex });
  };

  const onEdit = (e) => {
    setValuesedit({ ...valuesedit, [e.target.name]: e.target.value });
  };

  const handleeditar = async (e) => {
    e.preventDefault();
    const data = {
      ...valuesedit,
      lastEdit: fechaISO(),
    };
    await axios.put(apiURI + "/categorias/" + valuesedit.id, data);
    loadcategorias();
    setMsj("SE ha editado con éxito");
    setTimeout(() => {
      setMsj("-");
    }, 1300);
    reset();
  };

  const reset = () => {
    setErr("-");
    setValues({
      name: "",
      fondo: "#ABB8C3",
    });
    setValuesedit({
      name: "",
      fondo: "",
      createdAt: "",
      createdBy: "",
      lastEdit: "",
      id: null,
    });
  };

  return (
    <div className="row">
      <div className="col-md-4">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title">
              Categorías{" "}
              <span className="badge badge-info">
                items {categorias.length}
              </span>
            </h5>
            <form className="form-inline" onSubmit={handlecategoria}>
              <div className="form-group">
                <input
                  className="form-control"
                  type="text"
                  name="name"
                  value={values.name}
                  onChange={onValues}
                  placeholder="nueva categoria"
                  autoComplete="off"
                  required
                />
              </div>
              <button
                type="submit"
                title="AGREGAR"
                className="btn btn-primary"
                title="agregar"
              >
                +
              </button>
            </form>
            <small className="form-text text-danger text-uppercase">
              {err}
            </small>
          </div>
          <div className="card-body">
            <ul className="list-group list-items text-uppercase">
              {categorias.map((c) => (
                <li
                  key={c.id}
                  style={{ backgroundColor: c.fondo }}
                  className="list-group-item font-weight-bolder d-flex justify-content-between align-items-center"
                >
                  {c.name}
                  <span>
                    <button
                      onClick={() => deletecategoria(c.id)}
                      className="btn btn-danger mr-1"
                      title="eliminar"
                    >
                      &times;
                    </button>
                    <button
                      onClick={() => selectcategoria(c.id)}
                      className="btn btn-info"
                      title="editar"
                    >
                      &#x270e;
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card-footer">
            <small>
              <p className="p-0 m-0">
                creación:{" "}
                <span className="font-weight-bold">
                  {formatDate(valuesedit.createdAt)}
                </span>
              </p>
              <p className="p-0 m-0">
                Creado por:{" "}
                <span className="font-weight-bold">{valuesedit.createdBy}</span>
              </p>
              <p className="p-0 m-0">
                úlitma edición:{" "}
                <span className="font-weight-bold">
                  {formatDate(valuesedit.lastEdit)}
                </span>
              </p>
            </small>
          </div>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title">Edición</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleeditar} disabled={valuesedit.id?false:true}>
              <div className="form-group">
                <input
                  className="form-control"
                  type="text"
                  name="name"
                  onChange={onEdit}
                  value={valuesedit.name}
                  placeholder="editar nombre"
                  required
                  autoComplete="off"
                />
                <small className="form-text">
                  Edita el nombre de la categoría
                </small>
              </div>
              <div className="form-group">
                <CirclePicker color={valuesedit.fondo} onChange={onColor} />
                <small className="form-text">
                  Establece un color de fondo para el botón
                </small>
              </div>
              <button className="btn btn-primary mr-1" type="submit">
                Guardar
              </button>
              <button className="btn btn-warning" type="reset" onClick={reset}>
                Cancelar
              </button>
              <small className="form-text text-success text-center">
                {msj}
              </small>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
