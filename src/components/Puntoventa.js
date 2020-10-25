import { useState, useEffect, useRef, Fragment } from "react";
import { operadorRol } from "../helpers";

export default function Puntoventa() {
  const [changeservicio, setChangeservicio] = useState("");

  const serviceChange = (e) => {
    setChangeservicio(e.target.hash);
  };
  return (
    <Fragment>
      <div className="row">
        <small>
          <ul className="nav nav-pills navbar-dark bg-dark">
            <li className="nav-item">
              <a
                onClick={serviceChange}
                href="#comedor"
                className="nav-link text-white border mr-1 active"
                data-toggle="pill"
                aria-selected="true"
              >
                comedor
              </a>
            </li>
            <li className="nav-item">
              <a
                onClick={serviceChange}
                href="#domicilio"
                className="nav-link text-white border mr-1"
                data-toggle="pill"
                aria-selected="false"
              >
                domicilio
              </a>
            </li>
            <li className="nav-item">
              <a
                onClick={serviceChange}
                href="#cerradas"
                className="nav-link text-white border mr-1"
                data-toggle="pill"
                aria-selected="false"
              >
                cuentas cerradas
              </a>
            </li>
            <li className="nav-item">
              <a
                onClick={serviceChange}
                href="#caja"
                className="nav-link text-white border mr-1"
                data-toggle="pill"
                aria-selected="false"
              >
                caja
              </a>
            </li>
            <li
              style={{ display: operadorRol === "operador" ? "none" : "block" }}
              className="nav-item"
            >
              <a
                onClick={serviceChange}
                href="#monitor"
                className="nav-link text-white border mr-1"
                data-toggle="pill"
                aria-selected="false"
              >
                monitor de ventas
              </a>
            </li>
          </ul>
        </small>
      </div>
    </Fragment>
  );
}
