import { useState, useRef } from "react";
import { Modal } from "react-bootstrap";
import axios from "axios";
import {
  fechaActual,
  fechaISO,
  operadorSession,
  cuentaConstructor,
  apiURI,
  commit,
} from "../../helpers";

export default function AbrirComedorModal(props) {
  const { cuentas, loadcuentas, setCuenta, setModalcaptura } = props;

  const inputTorreta = useRef();
  const [values, setValues] = useState({
    torreta: "mostrador",
    personas: 1,
    servicio: "pll",
  });
  const [existemsj, setExistemsj] = useState("");

  const reset = () => {
    setValues({
      torreta: "mostrador",
      personas: 1,
      servicio: "pll",
    });
    setExistemsj("");
  };

  const setShowModal = () => {
    inputTorreta.current.focus();
  };

  const onValues = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    setExistemsj("");
  };

  const handleCuenta = async (e) => {
    e.preventDefault();
    let existe = false;
    cuentas.map((cuenta) => {
      if (cuenta.torreta === values.torreta) {
        existe = !existe;
      }
    });
    if (existe && values.torreta !== "mostrador") {
      setExistemsj("ya existe una mesa con el mismo nombre");
    } else {
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
        torreta: values.torreta,
        personas: values.personas,
        servicio: values.servicio,
        createdAt: fechaISO(),
        folio,
        orden,
      };
      const newCuenta = await axios.post(apiURI + "/cuentas", data);
      commit("ha creado la orden en comedor " + orden, operadorSession);
      loadcuentas();
      setCuenta(newCuenta.data);
      props.onHide();
      setTimeout(() => {
        setModalcaptura(true);
      }, 500);
    }
  };

  return (
    <Modal
      {...props}
      onExited={reset}
      onShow={setShowModal}
      size="sm"
      backdrop="static"
      keyboard={false}
    >
      <div className="card">
        <div className="card-header">
          <h5 className="card-title">Abrir nueva cuenta</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleCuenta}>
            <div className="form-group">
              <label>mesa:</label>
              <input
                type="text"
                name="torreta"
                ref={inputTorreta}
                value={values.torreta}
                onChange={onValues}
                className="form-control form-control-lg"
                required
                autoComplete="off"
              />
              <small className="form-text text-danger">{existemsj}</small>
            </div>
            <div className="form-group">
              <label>personas:</label>
              <input
                type="number"
                name="personas"
                min="1"
                value={values.personas}
                onChange={onValues}
                className="form-control form-control-lg"
                required
                autoComplete="off"
              />
            </div>
            <div className="form-group">
              <label>servicio:</label>
              <select
                className="form-control form-control-lg text-uppercase"
                name="servicio"
                value={values.servicio}
                onChange={onValues}
                required
              >
                <option> </option>
                <option className="font-weight-bold" value="comedor">
                  comedor
                </option>
                <option className="font-weight-bold" value="pll">
                  para llevar
                </option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary btn-lg">
              Abrir
            </button>
            <button
              type="reset"
              onClick={props.onHide}
              className="btn btn-danger btn-lg ml-1"
            >
              Cancelar
            </button>
          </form>
        </div>
      </div>
    </Modal>
  );
}
