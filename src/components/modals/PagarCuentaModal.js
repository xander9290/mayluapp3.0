import { useState, useEffect, useRef } from "react";
import { Modal } from "react-bootstrap";
import axios from "axios";

import {
  apiURI,
  fechaISO,
  cuentaConstructor,
  commit,
  operadorSession,
} from "../../helpers";
import ComandaModal from "../modals/Comanda";

export default function PagarCuentaModal(props) {
  const { cuenta, setCuenta, loadcuentas } = props;

  const inputEfectivo = useRef();
  const [values, setvalues] = useState({
    efectivo: 0,
    tarjeta: 0,
  });
  const [recibo, setRecibo] = useState(true);
  const [error, setError] = useState("");
  const [imprimir, setimprimir] = useState(false);
  const [cuentapagada, setCuentapagada] = useState(cuentaConstructor);

  const onValues = (e) => {
    setvalues({ ...values, [e.target.name]: e.target.value });
    setError(".");
  };

  const onRecibo = () => {
    setRecibo(!recibo);
  };

  const reset = () => {
    setvalues({ efectivo: 0, tarjeta: 0 });
    setError("");
    setRecibo(true);
  };

  const showActions = () => {
    inputEfectivo.current.focus();
  };

  const handlePago = async (e) => {
    e.preventDefault();
    const cambio =
        parseInt(values.efectivo) - cuenta.total + parseInt(values.tarjeta),
      checkpago = parseInt(values.efectivo) + parseInt(values.tarjeta);

    if (checkpago >= cuenta.total) {
      const data = {
        ...cuenta,
        efectivo: parseInt(values.efectivo),
        tarjeta: parseInt(values.tarjeta),
        estado: "cerrado",
        cambio,
        closedAt: fechaISO(),
      };
      const res = await axios.put(apiURI + "/cuentas/" + cuenta.id, data);
      setCuenta(cuentaConstructor);
      loadcuentas();
      setCuentapagada(res.data);
      document.title = "MAyLU";
      commit("ha cobrado la cuenta " + res.data.orden, operadorSession);
      setimprimir(recibo);
      props.onHide();
    } else {
      setError("MONTO INCORRECTO");
      inputEfectivo.current.focus();
    }
  };

  return (
    <Modal
      {...props}
      onExited={reset}
      onShow={showActions}
      size="sm"
      backdrop="static"
      keyboard={false}
    >
      <Modal.Body>
        <div className="card">
          <div className="card-header">
            <h5 className="card-title">Pagar cuenta</h5>
            <h3>
              cambio: $
              <span>
                {parseInt(values.efectivo) -
                  cuenta.total +
                  parseInt(values.tarjeta)}
              </span>
            </h3>
          </div>
          <div className="card-body">
            <form onSubmit={handlePago}>
              <small className="form-text text-danger">{error}</small>
              <div className="form-group">
                <label>Total a pagar:</label>
                <div className="input-group input-group-lg">
                  <div className="input-group-prepend">
                    <span className="input-group-text">$</span>
                  </div>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    value={cuenta.total}
                    readOnly
                  />
                  <div className="input-group-append">
                    <span className="input-group-text">.00</span>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Efectivo:</label>
                <div className="input-group input-group-lg">
                  <div className="input-group-prepend">
                    <span className="input-group-text">$</span>
                  </div>
                  <input
                    type="number"
                    name="efectivo"
                    ref={inputEfectivo}
                    className="form-control form-control-lg"
                    value={values.efectivo}
                    onChange={onValues}
                    required
                    autoComplete="off"
                  />
                  <div className="input-group-append">
                    <span className="input-group-text">.00</span>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Tarjeta:</label>
                <div className="input-group input-group-lg">
                  <div className="input-group-prepend">
                    <span className="input-group-text">$</span>
                  </div>
                  <input
                    type="number"
                    name="tarjeta"
                    onChange={onValues}
                    className="form-control form-control-lg"
                    value={values.tarjeta}
                    autoComplete="off"
                  />
                  <div className="input-group-append">
                    <span className="input-group-text">.00</span>
                  </div>
                </div>
              </div>
              <div className="form-check">
                <label className="form-check-label">
                  <input
                    type="checkbox"
                    name="recibo"
                    checked={recibo}
                    onChange={onRecibo}
                    className="form-check-input"
                  />
                  Imprimir recibo
                </label>
              </div>
              <button type="submit" className="btn btn-success btn-lg mt-2">
                Aceptar
              </button>
              <button
                onClick={() => props.onHide()}
                type="reset"
                className="btn btn-danger btn-lg ml-2 mt-2"
              >
                Cancelar
              </button>
            </form>
          </div>
        </div>
      </Modal.Body>
      <ComandaModal
        cuenta={cuentapagada}
        show={imprimir}
        onHide={() => setimprimir(false)}
      />
    </Modal>
  );
}
