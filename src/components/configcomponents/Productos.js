import { useState, useEffect, useRef } from "react";
import { apiURI, fechaISO, formatDate, operadorSession } from "../../helpers";
import axios from "axios";

export default function Productos(props) {
  const { servicechange } = props;

  const inputNombre = useRef();

  const [productos, setProductos] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [subcategoria, setSubcategoria] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [values, setValues] = useState({ name: "", price: 0 });
  const [search, setSearch] = useState({ entry: "" });
  const [searchmsj, setSearchmsj] = useState("");
  const [contable, setContable] = useState(true);
  const [existemsj, setExistemsj] = useState("-");
  const [successmsj, setSuccessmsj] = useState("-");
  const [action, setAction] = useState("new");

  useEffect(() => {
    loadsources();
    reset();
    setAction("new");
  }, [servicechange]);

  const reset = () => {
    setValues({ name: "", price: 0 });
    setContable(true);
    setSubcategoria("");
    setSearch({ entry: "" });
  };

  const loadsources = async () => {
    const data = await axios.all([
      axios.get(apiURI + "/productos"),
      axios.get(apiURI + "/categorias"),
      axios.get(apiURI + "/subcategorias"),
    ]);
    setProductos(data[0].data);
    setCategorias(data[1].data);
    setSubcategorias(data[2].data);
  };

  const onValues = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    setExistemsj("-");
  };

  const handleContable = () => {
    setContable(!contable);
  };

  const handleSubcategoria = (e) => {
    setSubcategoria(e.target.value);
  };

  const handleNewProduct = async (e) => {
    e.preventDefault();
    if (action === "new") {
      let existe = false;
      productos.map((p) => {
        if (p.name === values.name.trim()) {
          existe = !existe;
        }
      });
      if (existe) {
        setExistemsj("Ya existe un producto con ese nombre");
      } else {
        const data = {
          name: values.name.trim(),
          price: parseInt(values.price),
          subcategoria_id: subcategoria,
          contable,
          createdAt: fechaISO(),
          createdBy: operadorSession,
          lastEdit: null,
        };
        try {
          const res = await axios.post(apiURI + "/productos", data);
          setSuccessmsj("Agregado correctamente");
          setTimeout(() => {
            setSuccessmsj("-");
          }, 1200);
          // loadsources();
          setProductos([...productos, res.data].reverse());
          reset();
          inputNombre.current.focus();
        } catch (error) {
          alert("Error al crear item:\n", error);
        }
      }
    } else if (action === "edit") {
      const data = {
        name: values.name.trim(),
        price: parseInt(values.price),
        subcategoria_id: subcategoria,
        contable,
        createdAt: values.createdAt,
        createdBy: values.createdBy,
        lastEdit: fechaISO(),
      };
      try {
        const res = await axios.put(apiURI + "/productos/" + values.id, data);
        setSuccessmsj("Agregado correctamente");
        setTimeout(() => {
          setSuccessmsj("-");
        }, 1200);
        loadsources();
        // setProductos([...productos, res.data]);
        reset();
        setAction("new");
        inputNombre.current.focus();
      } catch (error) {
        alert("Error al editar item:\n", error);
      }
    }
  };

  const eliminar = async (id, idx) => {
    if (window.confirm("confirmar acción")) {
      try {
        const res = await axios.delete(apiURI + "/productos/" + id);
        reset();
        // loadsources();
        if (res.statusText === "OK") {
          let list = productos;
          list.splice(idx, 1);
          setProductos([...list]);
        }
      } catch (error) {
        alert("Error al eliminar item:\n", error);
      }
    }
  };

  const selectProducto = (id) => {
    const producto = productos.find((p) => p.id === id);
    if (producto) {
      setAction("edit");
      setValues({
        name: producto.name,
        price: producto.price,
        createdAt: producto.createdAt,
        createdBy: producto.createdBy,
        lastEdit: producto.lastEdit,
        id: producto.id,
      });
      setSubcategoria(producto.subcategoria_id);
      setContable(producto.contable);
    } else {
      setExistemsj("Producto no encontrado");
    }
  };

  const onSearch = (e) => {
    setSearch({ ...search, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const results = [];
    productos.map((p) => {
      const subcategoria = subcategorias.find(
        (s) => s.id === p.subcategoria_id
      );
      const categoria = categorias.find(
        (c) => c.id === subcategoria.categoria_id
      );
      if (
        search.entry.trim() === p.name ||
        search.entry.trim() === subcategoria.name ||
        search.entry.trim() === categoria.name
      ) {
        results.push({
          name: p.name,
          price: p.price,
          subcategoria_id: p.subcategoria_id,
          contable: p.contable,
          createdAt: p.createdAt,
          createdBy: p.createdBy,
          lastEdit: p.lastEdit,
          id: p.id,
        });
      }
    });
    if (results.length > 0) {
      setProductos(results);
    } else {
      setSearchmsj("sin resultados");
      setTimeout(() => {
        setSearchmsj("");
      }, 1200);
    }
  };

  const actualizar = () => {
    loadsources();
    setSearchmsj("");
    setSearch({ entry: "" });
  };

  return (
    <div className="row">
      <div className="col-md-4">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title">Productos</h5>
          </div>
          <div className="card-body">
            <h6>producto nuevo</h6>
            <form onSubmit={handleNewProduct}>
              <div className="form-group">
                <label>descripción:</label>
                <input
                  type="text"
                  name="name"
                  ref={inputNombre}
                  value={values.name}
                  onChange={onValues}
                  className="form-control"
                  required
                  autoComplete="off"
                />
                <small className="form-text text-danger">{existemsj}</small>
              </div>
              <div className="form-group">
                <label>precio:</label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  value={values.price}
                  onChange={onValues}
                  className="form-control"
                  required
                  autoComplete="off"
                />
                <small className="form-text">sólo numeros</small>
              </div>
              <div className="form-group">
                <label>subcategoría:</label>
                <select
                  value={subcategoria}
                  onChange={handleSubcategoria}
                  className="form-control text-uppercase"
                >
                  <option> </option>
                  {subcategorias.map((s) => (
                    <option
                      className="font-weight-bolder"
                      key={s.id}
                      value={s.id}
                    >
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={contable}
                  onChange={handleContable}
                  id="contable"
                />
                <label className="form-check-label" htmlFor="contable">
                  contable
                </label>
              </div>
              <button type="submit" className="btn btn-primary mr-1 mt-2">
                ACEPTAR
              </button>
              <button
                type="reset"
                onClick={reset}
                className="btn btn-warning mt-2"
              >
                CANCELAR
              </button>
            </form>
            <small className="form-text text-success">{successmsj}</small>
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
      <div className="col-md-8 px-0">
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
                items {productos.length}
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
          <div className="card-body p-1 list-items-table">
            <table className="table table-sm table-bordered table-hover">
              <thead>
                <tr className="text-center">
                  <th scope="col">DEL</th>
                  <th scope="col">EDIT</th>
                  <th scope="col">DESCRIPCIÓN</th>
                  <th scope="col">PRECIO</th>
                  <th scope="col">SUBCATEGORÍA</th>
                  <th scope="col">CATEGORÍA</th>
                  <th scope="col">contable</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((p, idx) => {
                  let fondo = "",
                    cateName,
                    subName;
                  const subc = subcategorias.find(
                    (s) => s.id === p.subcategoria_id
                  );
                  if (subc) {
                    const categoria = categorias.find(
                      (c) => c.id === subc.categoria_id
                    );
                    if (categoria) {
                      fondo = categoria.fondo;
                      cateName = categoria.name;
                      subName = subc.name;
                    }
                  }
                  return (
                    <tr key={p.id} className="text-uppercase">
                      <th scope="row" className="text-center">
                        <button
                          title="ELIMINAR"
                          onClick={() => eliminar(p.id, idx)}
                          className="btn btn-danger btn-sm"
                        >
                          &times;
                        </button>
                      </th>
                      <th scope="row" className="text-center">
                        <button
                          title="EDITAR"
                          onClick={() => selectProducto(p.id)}
                          className="btn btn-warning btn-sm"
                        >
                          &#9998;
                        </button>
                      </th>
                      <td>{p.name}</td>
                      <td>${p.price}.00</td>
                      <td
                        style={{
                          backgroundColor: fondo,
                        }}
                        className="text-center"
                      >
                        {subName}
                      </td>
                      <td
                        style={{
                          backgroundColor: fondo,
                        }}
                        className="text-center"
                      >
                        {cateName}
                      </td>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          checked={p.contable ? true : false}
                          readOnly
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="card-footer"></div>
        </div>
      </div>
    </div>
  );
}
