import { useState, useEffect } from "react";
import { apiURI, fechaISO, formatDate, operadorSession } from "../../helpers";
import axios from "axios";

export default function Areas(props) {
  const { servicechange } = props;

  const [err, setErr] = useState("-");
  const [areas, setAreas] = useState([]);
  const [area, setArea] = useState({});
  const [values, setValues] = useState({ name: "" });

  useEffect(() => {
    loadareas();
    setArea({});
  }, [servicechange]);

  const loadareas = async () => {
    const data = await axios.get(apiURI + "/areas");
    setAreas(data.data);
  };

  const valuesChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    setErr("-");
  };

  const handleareas = async (e) => {
    e.preventDefault();

    let existe = false;
    areas.map((a) => {
      if (a.name === values.name) {
        existe = true;
      }
    });

    if (existe) {
      setErr("Ya existe un área con ese nombre");
    } else {
      const data = {
        ...values,
        createdAt: fechaISO(),
        createdBy: operadorSession,
      };
      try {
        const res = await axios.post(apiURI + "/areas", data);
        // loadareas();
        setAreas([...areas, res.data]);
        setValues({ name: "" });
        setArea({});
      } catch (error) {
        alert("Error al crear item:\n",error);
      }
    }
  };

  const deltearea = async (id) => {
    if (window.confirm("confirmar acción")) {
      try {
        await axios.delete(apiURI + "/areas/" + id);
        loadareas();
        setArea({});
      } catch (error) {
        alert("Error al eliminar item:\n",error);
      }
    }
  };

  const selectarea = async (e, id) => {
    e.stopPropagation();
    // const data = await axios.get(apiURI + "/areas/" + id);
    const area = areas.find((area) => area.id === id);
    setArea(area);
  };

  return (
    <div className="row">
      <div className="col-md-4">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title">
              Áreas{" "}
              <span className="badge badge-info">items {areas.length}</span>
            </h5>
            <form className="form-inline" onSubmit={handleareas}>
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  value={values.name}
                  onChange={valuesChange}
                  className="form-control form-control-md"
                  placeholder="nueva área"
                  required
                  autoComplete="off"
                />
              </div>
              <button
                title="AGREGAR"
                type="submit"
                className="btn btn-primary btn-md"
              >
                {" + "}
              </button>
            </form>
            <small className="form-text text-danger text-uppercase">
              {err}
            </small>
          </div>
          <div className="card-body">
            <ul className="list-group list-items">
              {areas.map((a) => (
                <li
                  onClick={(e) => selectarea(e, a.id)}
                  key={a.id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  {a.name}
                  <button
                    type="button"
                    onClick={() => deltearea(a.id)}
                    className="btn btn-danger btn-sm"
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="card-footer">
            <small>
              <p className="p-0 m-0">
                creación:{" "}
                <span className="font-weight-bold">
                  {formatDate(area.createdAt)}
                </span>
              </p>
              <p className="p-0 m-0">
                Creado por:{" "}
                <span className="font-weight-bold">{area.createdBy}</span>
              </p>
            </small>
          </div>
        </div>
      </div>
      <div className="col-md-4 p-0"></div>
      <div className="col-md-4 p-0"></div>
    </div>
  );
}
