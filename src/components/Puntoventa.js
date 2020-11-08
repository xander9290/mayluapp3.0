import { useState, Fragment } from "react";
import { operadorRol } from "../helpers";

import Comedor from "./puntoventacomponents/Comedor";
import Domicilio from "./puntoventacomponents/Domicilio";
import Cerradas from "./puntoventacomponents/Cerradas";
import Caja from "./puntoventacomponents/Caja";
import Monitor from "./puntoventacomponents/Monitor";

export default function Puntoventa() {
  const [changeservicio, setChangeservicio] = useState("");

  const serviceChange = (e) => {
    setChangeservicio(e.target.hash);
  };
  return (
    <Fragment>
      <div className="row">
        <small className="col-md-12 p-0">
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
      <div className="row">
        <div className="tab-content col-md-12 p-0">
          <div
            className="tab-pane fade show active container-fluid"
            id="comedor"
          >
            <Comedor changeservicio={changeservicio} />
          </div>
          <div className="tab-pane fade show container-fluid" id="domicilio">
            <Domicilio changeservicio={changeservicio} />
          </div>
          <div className="tab-pane fade show container-fluid" id="cerradas">
            <Cerradas changeservicio={changeservicio} />
          </div>
          <div className="tab-pane fade show container-fluid" id="caja">
            <Caja changeservicio={changeservicio} />
          </div>
          <div className="tab-pane fade show container-fluid" id="monitor">
            <Monitor changeservicio={changeservicio} />
          </div>
        </div>
      </div>
    </Fragment>
  );
}
