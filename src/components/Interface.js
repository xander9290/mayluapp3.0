import { Fragment, useState, useEffect } from "react";
import {
  operadorSession,
  operadorRol,
  fechaActual,
  commit,
  clockTime,
} from "../helpers";

import Puntoventa from "./Puntoventa";
import Config from "./Config";

export default function Interface() {
  return (
    <Fragment>
      <div className="row">
        <div className="col-md-12 p-1">
          <Nav />
        </div>
      </div>
      <div className="row">
        <div className="col-md-12 p-1">
          <Main />
        </div>
      </div>
    </Fragment>
  );
}

function Nav() {
  const [clock, setClock] = useState("");
  const [abierto, setAbierto] = useState(true);

  useEffect(() => {
    setInterval(() => {
      const [string] = clockTime();
      setClock(string);
      if (string >= "02:00 p.m." && string <= "09:30 p.m.") {
        setAbierto(true);
      } else {
        setAbierto(false);
      }
    }, 1000);
  }, []);

  const logout = (e) => {
    e.preventDefault();
    commit("ha cerrado sesion", operadorSession);
    window.sessionStorage.clear();
    window.location.href = window.location.href;
  };
  return (
    <div className="d-flex justify-content-between align-content-center">
      <ul className="nav nav-pills">
        <li className="nav-item">
          <a
            className="nav-link active mr-1 bg-success text-white font-weight-bold"
            href="#puntoventa"
            data-toggle="pill"
            aria-selected="true"
          >
            punto de venta
          </a>
        </li>
        <li
          className="nav-item"
          style={{ display: operadorRol === "master" ? "block" : "none" }}
        >
          <a
            className="nav-link text-white mr-1 bg-success font-weight-bold"
            href="#config"
            data-toggle="pill"
          >
            administración
          </a>
        </li>
      </ul>
      {!abierto ? (
        <span className="h4 text-light bg-danger border rounded border-light px-3">
          {clock} {"cerrado"}
        </span>
      ) : (
        <span className="h4 text-dark bg-light border rounded px-3">
          {clock} {"abierto"}
        </span>
      )}
      <small>
        <ul className="list-group list-group-horizontal">
          <li className="list-group-item">
            operador:{" "}
            <span className="font-weight-bolder">{operadorSession}</span>
          </li>
          <li className="list-group-item">
            Fecha:{" "}
            <span className="font-weight-bolder">
              {fechaActual(Date.now())}
            </span>
          </li>
          <li className="list-group-item">
            <a className="text-danger" href="#salir" onClick={logout}>
              salir
            </a>
          </li>
        </ul>
      </small>
    </div>
  );
}

function Main() {
  return (
    <div className="tab-content main">
      <div
        className="tab-pane fade show active container-fluid"
        id="puntoventa"
      >
        <Puntoventa />
      </div>
      <div className="tab-pane fade container-fluid" id="config">
        <Config />
      </div>
    </div>
  );
}
