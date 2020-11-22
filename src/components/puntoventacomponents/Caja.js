import { useState, useEffect } from "react";
import axios from "axios";
import {
  fechaActual,
  operadorRol,
  operadorSession,
  apiURI,
  commit,
  fechaISO,
} from "../../helpers";

import CajaModal from "../modals/Caja";

export default function Caja(props) {
  const { changeservicio } = props;

  const [cajas, setCajas] = useState([]);
  const [caja, setCaja] = useState({});
  const [cajamodal, setCajamodal] = useState(false);
  const [values, setValues] = useState({
    tipo: "",
    concepto: "",
    importe: "",
  });

  const imprimir = () => {};

  useEffect(()=>{
    loadcajas();
  },[])

  useEffect(() => {
    loadcajas();
    reset();
  }, [changeservicio]);

  const reset = () => {
    setValues({
      tipo: "",
      concepto: "",
      importe: "",
    });
  };

  const loadcajas = async () => {
    const data = await axios.get(apiURI + "/cajas");
    setCajas(data.data.reverse());
  };

  const onValues = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleCaja = async (e) => {
    e.preventDefault();
    const data = {
      tipo: values.tipo,
      concepto: values.concepto.trim(),
      importe: parseInt(values.importe),
      fecha: fechaActual(Date.now()),
      createdAt: fechaISO(),
      createdBy: operadorSession,
    };
    const res = await axios.post(apiURI + "/cajas", data);
    await commit(
      "ha registrado un " + values.tipo + " de $" + values.importe,
      operadorSession
    );
    setCaja(res.data);
    setCajas([...cajas,res.data].reverse());
    // loadcajas();
    reset();
    setCajamodal(true);
  };

  const deleteCaja = async (id, tipo, importe) => {
    if (window.confirm("CONFIRMAR ACCIÓN")) {
      await axios.delete(apiURI + "/cajas/" + id);
      await commit(
        "ha eliminado un " + tipo + " de $" + importe,
        operadorSession
      );
      loadcajas();
      reset();
    }
  };

  return (
    <div className="row">
      <div className="col-md-3 mt-1">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title">gastos y depósitos</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleCaja}>
              <div className="form-group">
                <label>tipo:</label>
                <select
                  className="form-control form-control-lg text-uppercase"
                  name="tipo"
                  value={values.tipo}
                  onChange={onValues}
                  required
                >
                  <option> </option>
                  <option className="font-weight-bold" value="gasto">
                    Gasto
                  </option>
                  <option className="font-weight-bold" value="deposito">
                    deposito
                  </option>
                </select>
              </div>
              <div className="form-group">
                <label>Concepto:</label>
                <input
                  className="form-control form-control-lg"
                  type="text"
                  name="concepto"
                  value={values.concepto}
                  onChange={onValues}
                  required
                  autoComplete="off"
                />
              </div>
              <div className="form-group">
                <label>importe:</label>
                <input
                  className="form-control form-control-lg"
                  type="number"
                  name="importe"
                  min="0"
                  value={values.importe}
                  onChange={onValues}
                  required
                  autoComplete="off"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg mr-1">
                Aceptar
              </button>
              <button type="reset" className="btn btn-warning btn-lg mr-1">
                Cancelar
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="col-md-5 m-1">
        <div className="card">
          <div className="card-body list-items-table scroll-x p-0">
            <table className="table table-sm table-bordered text-uppercase">
              <thead className="bg-secondary text-light">
                <tr className="text-center">
                  <th scope="col">DEL</th>
                  <th scope="col">Concepto</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">importe</th>
                  <th scope="col">fecha</th>
                  <th scope="col">operador</th>
                </tr>
              </thead>
              <tbody>
                {cajas.map((caja) => (
                  <tr key={caja.id} className="font-weight-bold">
                    <th className="text-center">
                      <button
                        onClick={() =>
                          deleteCaja(caja.id, caja.tipo, caja.importe)
                        }
                        type="button"
                        className="btn btn-danger btn-sm"
                      >
                        &times;
                      </button>
                    </th>
                    <td>{caja.concepto}</td>
                    <td
                      className={
                        caja.tipo === "gasto"
                          ? "bg-danger text-center"
                          : "bg-success text-center"
                      }
                    >
                      {caja.tipo}
                    </td>
                    <td className="text-right">${caja.importe}</td>
                    <td className="text-center">{caja.fecha}</td>
                    <td className="text-center">{caja.createdBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <CajaModal
        show={cajamodal}
        onHide={() => setCajamodal(false)}
        caja={caja}
        setCaja={setCaja}
      />
      {/* <div className="col-md-1">
        <button onClick={imprimir} type="button" className="btn btn-warning btn-lg">imprimir</button>
      </div> */}
    </div>
  );
}
