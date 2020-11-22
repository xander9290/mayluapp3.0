import { useState, useEffect, useRef } from "react";
import {
  apiURI,
  fechaActual,
  fechaISO,
  commit,
  operadorSession,
} from "../helpers";
import axios from "axios";
import bcrypt from "bcryptjs";

export default function LoginForm() {
  const [operadores, setOperadores] = useState([]);
  const [err, setErr] = useState("-");
  const [values, setValues] = useState({
    pswd: "",
    name: "",
  });
  const [listIndex, setListIndex] = useState(0);

  const inputPwsd = useRef();

  useEffect(() => {
    loadoperadores();
  }, []);

  const loadoperadores = async () => {
    const response = await axios.get(apiURI + "/operadores");
    setOperadores(response.data.reverse());
  };

  const selectItem = (idx) => {
    setListIndex(parseInt(idx));
  };

  const onvalue = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    setErr("-");
  };

  const setOperadorName = (name) => {
    setValues({...values,name});
    inputPwsd.current.focus();
  }

  const handlelogin = async (e) => {
    e.preventDefault();
    const operador = operadores.find((o) => o.name === values.name);
    if (operador) {
      const pswd = operador.pswd,
        match = await bcrypt.compare(values.pswd, pswd);
      if (match) {
        await commit("ha iniciado sesión", operador.name);
        window.sessionStorage.setItem("operador", operador.name);
        window.sessionStorage.setItem("operadorRol", operador.rol);
        window.location.href = window.location.href;
      } else {
        setErr("Operador o contraseña incorrecto");
      }
    } else {
      setErr("Operador o contraseña incorrecto");
    }
  };

  return (
    <div className="row">
      <div className="col-sm-3 col-md-3 offset-md-4">
        <div className="card mt-5">
          <div className="card-header">
            <h5 className="card-title">Entrada de Operador</h5>
          </div>
          <div className="card-body">
            <form className="text-uppercase" onSubmit={handlelogin}>
              <div className="form-group">
                <label>operador:</label>
                {/* <select
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
                </select> */}
                <ul className="list-group list-items-operadores">
                  {operadores.map((operador, i) => (
                    <li
                      key={operador.id}
                      onClick={() => selectItem(i)}
                      onDoubleClick={()=>setOperadorName(operador.name)}
                      className={
                        listIndex === i
                          ? "list-group-item p-2 font-weight-bold bg-info"
                          : "list-group-item p-2 font-weight-bold"
                      }
                    >
                      {operador.name}
                    </li>
                  ))}
                </ul>
                <input 
                  type="text"
                  name="name"
                  value={values.name}
                  onChange={onvalue}
                  className="form-control form-control-lg text-uppercase mt-1"
                  required
                  autoComplete="off"
                />
              </div>
              <div className="form-group">
                <label>contraseña:</label>
                <input
                  type="password"
                  name="pswd"
                  maxLength="4"
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
