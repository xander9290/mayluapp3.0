import { useState, useEffect, useRef } from "react";
import { apiURI, fechaISO, formatDate, operadorSession } from "../../helpers";
import axios from "axios";

export default function Subcategorias(props) {
  const { servicechange } = props;

  const [subcategorias, setSubcategorias] = useState([]);
  const [categorias, setcategorias] = useState([]);
  const [areas, setAreas] = useState([]);
  const [err, setErr] = useState("-");
  const [errmodif, setErrmodif] = useState("-");
  const [msj, setMsj] = useState("-");
  const [values, setValues] = useState({
    name: "",
  });
  const [valuesedit, setValuesedit] = useState({
    name: "",
    createdAt: "",
    createdBy: "",
    lastEdit: "",
    id: null,
  });
  const [modificadores, setmodificadores] = useState([]);
  const [succesModif, setSuccesModif] = useState("-");
  const [valuemodif, setvaluemodif] = useState({
    name: "",
    price: 0,
  });
  const [currentSub, setCurrentSub] = useState("");

  useEffect(() => {
    loadsubcategorias();
    loadsources();
    reset();
  }, [servicechange]);

  const loadsubcategorias = async () => {
    const data = await axios.get(
      apiURI + "/subcategorias"
    );
    setSubcategorias(data.data);
  };

  const loadsources = async () => {
    const data = await axios.all([
      axios.get(apiURI + "/categorias"),
      axios.get(apiURI + "/areas"),
    ]);
    setcategorias(data[0].data);
    setAreas(data[1].data);
  };

  const reset = () => {
    setErr("-");
    setValues({ name: "" });
    setValuesedit({
      name: "",
      createdAt: "",
      createdBy: "",
      lastEdit: "",
      area_id: "",
      categoria_id: "",
      id: null,
    });
    setvaluemodif({ name: "", price: 0 });
    setmodificadores([]);
    setCurrentSub("");
  };

  const handleNuevo = async (e) => {
    e.preventDefault();
    let existe = false;
    subcategorias.map((s) => {
      if (s.name === values.name) {
        existe = !existe;
      }
    });
    if (existe) {
      setErr("Ya existe una subcategoría con el mismo nombre");
    } else {
      const data = {
        name: values.name.trim(),
        createdAt: fechaISO(),
        createdBy: operadorSession,
        area_id: "",
        categoria_id: "",
        modificadores: [],
      };
      await axios.post(apiURI + "/subcategorias", data);
      loadsubcategorias();
      reset();
    }
  };

  const onNuevo = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    setErr("-");
  };

  const eliminar = async (id) => {
    if (window.confirm("confirmar acción")) {
      await axios.delete(apiURI + "/subcategorias/" + id);
      loadsubcategorias();
      reset();
    }
  };

  const selectsubcategoria = async (id) => {
    // const data = await axios.get(apiURI + "/subcategorias/" + id);
    const subcategoria = subcategorias.find((c) => c.id === id);
    if (subcategoria) {
      setmodificadores(subcategoria.modificadores);
      setCurrentSub(subcategoria.name);
      setValuesedit({
        name: subcategoria.name,
        createdAt: subcategoria.createdAt,
        createdBy: subcategoria.createdBy,
        lastEdit: subcategoria.lastEdit,
        area_id: subcategoria.area_id,
        categoria_id: subcategoria.categoria_id,
        id,
      });
    } else {
      setErr("Error al buscar la categoria seleccionada");
    }
  };

  const onEdit = (e) => {
    setValuesedit({ ...valuesedit, [e.target.name]: e.target.value });
    setErr("-");
  };

  const handleAsignar = async (e) => {
    e.preventDefault();
    const data = {
      name: valuesedit.name.trim(),
      createdAt: valuesedit.createdAt,
      createdBy: valuesedit.createdBy,
      area_id: valuesedit.area_id,
      modificadores: modificadores,
      categoria_id: valuesedit.categoria_id,
      lastEdit: fechaISO(),
    };
    await axios.put(apiURI + "/subcategorias/" + valuesedit.id, data);
    loadsubcategorias();
    setMsj("SE ha editado con éxito");
    setTimeout(() => {
      setMsj("-");
    }, 1300);
    reset();
  };

  const inputModifName = useRef();
  const onModif = (e) => {
    setvaluemodif({ ...valuemodif, [e.target.name]: e.target.value });
    setErrmodif("-");
  };

  const newModificador = async (e) => {
    e.preventDefault();
    let existe = false;
    modificadores.map((m) => {
      if (m.name === valuemodif.name.trim()) {
        existe = true;
      }
    });

    if (valuesedit.id) {
      if (existe) {
        setErrmodif("Ya existe un modificador con ese nombre");
      } else {
        setmodificadores([
          ...modificadores,
          { name: valuemodif.name.trim(), price: valuemodif.price },
        ]);
        setvaluemodif({ name: "", price: 0 });
        inputModifName.current.focus();
        setErrmodif("-");
        setSuccesModif("Agregado correctamente");
        setTimeout(() => {
          setSuccesModif("-");
        }, 1200);
      }
    } else {
      setErrmodif("Selecciona primero una subcategoría");
    }
  };

  const deleteModificador = (idx) => {
    if (window.confirm("confirmar acción")) {
      let list = modificadores;
      list.splice(idx, 1);
      setmodificadores([...list]);
    }
  };

  return (
    <div className="row">
      <div className="col-md-4">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title">
              subcategorías{" "}
              <span className="badge badge-info">
                items {subcategorias.length}
              </span>
            </h5>
            <form onSubmit={handleNuevo} className="form-inline">
              <div className="form-group">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  name="name"
                  value={values.name}
                  onChange={onNuevo}
                  placeholder="nueva subcategoria"
                  required
                  autoComplete="off"
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                title="agregar"
              >
                {"+"}
              </button>
            </form>
            <small className="form-text text-danger">{err}</small>
          </div>
          <div className="card-body">
            <ul className="list-group list-items">
              {subcategorias.map((s) => {
                const categoria = categorias.find(
                  (c) => c.id === s.categoria_id
                );
                let fondo = "#ABB8C3",
                  ubicacion = "";
                if (categoria) {
                  fondo = categoria.fondo;
                  ubicacion = categoria.name;
                }
                return (
                  <li
                    key={s.id}
                    style={{ backgroundColor: fondo }}
                    className="list-group-item border-bottom d-flex justify-content-between align-items-center font-weight-bolder"
                  >
                    <span>
                      {s.name}
                      <small>
                        <p className="p-0 m-0">{ubicacion}</p>
                      </small>
                    </span>
                    <span>
                      <button
                        onClick={() => eliminar(s.id)}
                        className="btn btn-danger mr-1"
                        title="eliminar"
                      >
                        &times;
                      </button>
                      <button
                        onClick={() => selectsubcategoria(s.id)}
                        className="btn btn-info"
                        title="editar"
                      >
                        &#x270e;
                      </button>
                    </span>
                  </li>
                );
              })}
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
            <h5 className="card-title">edición</h5>
          </div>
          <div className="card-body">
            <form
              onSubmit={handleAsignar}
              disabled={valuesedit.id ? false : true}
            >
              <div className="form-group">
                <label>nombre</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={valuesedit.name}
                  onChange={onEdit}
                  placeholder="editar nombre"
                  autoComplete="off"
                  required
                />
                <small className="form-text">
                  Edita el nombre de la subcategoría
                </small>
              </div>
              <div className="form-group">
                <label>Área</label>
                <select
                  className="form-control text-uppercase"
                  name="area_id"
                  value={valuesedit.area_id}
                  onChange={onEdit}
                >
                  <option> </option>
                  {areas.map((a) => (
                    <option
                      className="font-weight-bolder"
                      key={a.id}
                      value={a.id}
                    >
                      {a.name}
                    </option>
                  ))}
                </select>
                <small className="form-text">
                  Asigna un área a la subcategoría
                </small>
              </div>
              <div className="form-group">
                <label>Categoría</label>
                <select
                  name="categoria_id"
                  className="form-control text-uppercase"
                  value={valuesedit.categoria_id}
                  onChange={onEdit}
                >
                  <option> </option>
                  {categorias.map((a) => (
                    <option
                      className="font-weight-bolder"
                      key={a.id}
                      value={a.id}
                    >
                      {a.name}
                    </option>
                  ))}
                </select>
                <small className="form-text">
                  Asigna un categoría a la subcategoría
                </small>
              </div>
              <button type="submit" className="btn btn-info btn-sm mr-1">
                Guardar
              </button>
              <button
                type="reset"
                onClick={reset}
                className="btn btn-warning btn-sm"
              >
                Cancelar
              </button>
            </form>
          </div>
          <div className="card-footer">
            <small className="form-text text-success text-center">{msj}</small>
          </div>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title">
              modificadores{" "}
              <span className="badge badge-info">
                items {modificadores.length}
              </span>
            </h5>
            <form
              className="form-inline"
              onSubmit={newModificador}
              disabled={valuesedit.id ? false : true}
            >
              <div className="form-group">
                <input
                  className="form-control form-control-sm mr-1"
                  type="text"
                  name="name"
                  min="0"
                  ref={inputModifName}
                  value={valuemodif.name}
                  onChange={onModif}
                  placeholder="nuevo modificador"
                  autoComplete="off"
                  required
                />
              </div>
              <div className="form-group">
                <label>$</label>
                <input
                  className="form-control form-control-sm input-contador"
                  type="number"
                  name="price"
                  value={valuemodif.price}
                  onChange={onModif}
                  placeholder="$"
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                title="agregar"
              >
                +
              </button>
            </form>
            <small className="form-text text-danger">{errmodif}</small>
          </div>
          <div className="card-body">
            <h6 className="text-center card-text">
              {currentSub === "" ? "<subcategoría>" : currentSub}
            </h6>
            <ul className="list-group list-items text-uppercase">
              {modificadores.length > 0 ? (
                modificadores.map((m, i) => (
                  <li
                    key={i}
                    className="list-group-item font-weight-bolder d-flex justify-content-between align-items-center"
                  >
                    {m.price > 0 ? m.name + " $" + m.price + "" : m.name}
                    <button
                      type="button"
                      onClick={() => deleteModificador(i)}
                      className="btn btn-danger"
                      title="eliminar"
                    >
                      &times;
                    </button>
                  </li>
                ))
              ) : (
                <li className="list-group-item font-weight-bolder text-uppercase text-center">
                  sin modificadores
                </li>
              )}
            </ul>
          </div>
          <div className="card-footer">
            <small className="form-text text-success">{succesModif}</small>
          </div>
        </div>
      </div>
    </div>
  );
}
