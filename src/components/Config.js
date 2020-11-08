import { useState } from "react";

import Areas from "./configcomponents/Areas";
import Categorias from "./configcomponents/Categorias";
import Subcategorias from "./configcomponents/Subcategorias";
import Productos from "./configcomponents/Productos";
import Clientes from "./configcomponents/Clientes";
import Operadores from "./configcomponents/Operadores";

export default function Config() {
  const [servicechange, setServicechange] = useState("");
  const serviceChange = (e) => {
    setServicechange(e.target.hash);
  };
  return (
    <div className="row">
      <div className="col-md-2">
        <ul className="nav nav-pills navbar-dark flex-column text-uppercase">
          <li className="nav-item">
            <a
              onClick={serviceChange}
              href="#areas"
              className="nav-link text-white mr-1 border-bottom active"
              data-toggle="pill"
              aria-selected="true"
            >
              áreas
            </a>
          </li>
          <li className="nav-item">
            <a
              onClick={serviceChange}
              href="#categorias"
              className="nav-link text-white border-bottom mr-1"
              data-toggle="pill"
            >
              categorías
            </a>
          </li>
          <li className="nav-item">
            <a
              onClick={serviceChange}
              href="#subcategorias"
              className="nav-link text-white border-bottom mr-1"
              data-toggle="pill"
            >
              subcategorías
            </a>
          </li>
          <li className="nav-item">
            <a
              onClick={serviceChange}
              href="#productos"
              className="nav-link text-white border-bottom mr-1"
              data-toggle="pill"
            >
              productos
            </a>
          </li>
          <li className="nav-item">
            <a
              onClick={serviceChange}
              href="#clientes"
              className="nav-link text-white border-bottom mr-1"
              data-toggle="pill"
            >
              clientes
            </a>
          </li>
          <li className="nav-item">
            <a
              onClick={serviceChange}
              href="#operadores"
              className="nav-link text-white border-bottom mr-1"
              data-toggle="pill"
            >
              operadores
            </a>
          </li>
        </ul>
      </div>
      <div className="tab-content col-md-10">
        <div
          className="tab-pane show active container-fluid p-0"
          id="areas"
        >
          <Areas servicechange={servicechange} />
        </div>
        <div
          className="tab-pane show container-fluid p-0"
          id="categorias"
        >
          <Categorias servicechange={servicechange} />
        </div>
        <div
          className="tab-pane show container-fluid p-0"
          id="subcategorias"
        >
          <Subcategorias servicechange={servicechange} />
        </div>
        <div
          className="tab-pane show container-fluid p-0"
          id="productos"
        >
          <Productos servicechange={servicechange} />
        </div>
        <div
          className="tab-pane show container-fluid p-0"
          id="clientes"
        >
          <Clientes servicechange={servicechange} />
        </div>
        <div
          className="tab-pane show container-fluid p-0"
          id="operadores"
        >
          <Operadores servicechange={servicechange} />
        </div>
      </div>
    </div>
  );
}
