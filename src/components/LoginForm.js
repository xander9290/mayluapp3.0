import { useState, useEffect, useRef } from "react";
import { apiURI, fechaISO } from "../helpers";
import axios from "axios";

export default function LoginForm() {
  const [operadores, setOperadores] = useState([]);
  const [err, setErr] = useState("");
  const [values, setValues] = useState({
    pswd: "",
    name: "",
  });

  const inputPwsd = useRef();

  useEffect(() => {
    loadoperadores();
  }, []);

  const loadoperadores = async () => {
    const response = await axios.get(apiURI + "/operadores");
    setOperadores(response.data);
  };

  const onvalue = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    setErr("");
  };

  const handlelogin = async (e) => {
    e.preventDefault();
    const operador = operadores.find(
      (o) => o.name === values.name && o.pswd === values.pswd
    );
    if (operador) {
      await axios.post(apiURI + "/logs", {
        createdAt: fechaISO(),
        operador: operador.name,
        commit: "Ha iniciado sesión",
      });
      window.sessionStorage.setItem("operador",operador.name);
      window.sessionStorage.setItem("operadorRol",operador.rol);
      window.location.href="http://localhost:3000";
    } else {
      setErr("operador o contraseña incorrecto");
      inputPwsd.current.focus();
    }
  };

  return (
    <div className="row">
      <div className="col-md-3 offset-md-4">
        <div className="card mt-5">
          <div className="card-header">
            <h5 className="card-title">Entrada de Operador</h5>
          </div>
          <div className="card-body">
            <form className="text-uppercase" onSubmit={handlelogin}>
              <div className="form-group">
                <label>operador:</label>
                <select
                  name="name"
                  value={values.name}
                  onChange={onvalue}
                  className="form-control form-control-lg text-uppercase"
                  required
                >
                  <option></option>
                  {operadores.map((o) => (
                    <option key={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>contraseña:</label>
                <input
                  type="password"
                  name="pswd"
                  ref={inputPwsd}
                  value={values.pswd}
                  onChange={onvalue}
                  className="form-control form-control-lg"
                  required
                  autoComplete="off"
                />
              </div>
              <small className="form-text text-danger text-center">{err}</small>
              <button className="btn btn-primary btn-lg btn-block text-uppercase">
                entrar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
