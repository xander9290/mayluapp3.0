import { useState, useEffect } from "react";
import axios from "axios";
import {
  fechaActual,
  operadorRol,
  operadorSession,
  apiURI,
  commit,
} from "../../helpers";

import ResumenModal from "../modals/Resumen";
import DetalladoModal from "../modals/Detallados";

export default function Monitor(props) {
  const { changeservicio } = props;

  const [fechas, setFechas] = useState({
    gte: fechaActual(Date.now()),
    lte: fechaActual(Date.now()),
  });
  const [cuentascomedor, setCuentascomedor] = useState({ cant: 0, total: 0 });
  const [cuentaspll, setCuentaspll] = useState({ cant: 0, total: 0 });
  const [cuentasdomicilio, setCuentasdomicilio] = useState({
    cant: 0,
    total: 0,
  });
  const [caja, setCaja] = useState([]);
  const [gastos, setGastos] = useState({ cant: 0, total: 0 });
  const [depositos, setDepositos] = useState({ cant: 0, total: 0 });
  const [tarjetas, setTarjetas] = useState({ cant: 0, total: 0, cuentas: [] });
  const [cancelados, setCancelados] = useState([]);
  const [descuentos, setDescuentos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [resumenmodal, setResumenmodal] = useState(false);
  const [detalladomodal, setDetalladomodal] = useState(false);

  useEffect(() => {
    setFechas({
      gte: fechaActual(Date.now()),
      lte: fechaActual(Date.now()),
    });
    loaddata();
  }, [changeservicio]);

  const loaddata = async () => {
    const data = await axios.all([
      axios.get(
        `${apiURI}/cuentas?fecha_gte=${fechas.gte}&fecha_lte=${fechas.lte}&estado_ne=cancelado`
      ),
      axios.get(
        `${apiURI}/cajas?fecha_gte=${fechas.gte}&fecha_lte=${fechas.lte}`
      ),
      axios.get(
        `${apiURI}/cuentas?fecha_gte=${fechas.gte}&fecha_lte=${fechas.lte}&estado=cancelado`
      ),
    ]);
    procesarServicios(data[0].data);
    procesarTarjetas(data[0].data);
    procesarCaja(data[1].data);
    setCancelados(data[2].data);
    const _descuentos = data[0].data.filter((cuenta) => cuenta.dscto > 0);
    setDescuentos(_descuentos);
    procesarProductos(data[0].data);
  };

  const procesarProductos = async (data) => {
    let items = [],
      list = [],
      productos = [];
    const res = await axios.get(apiURI + "/productos");
    productos = res.data;
    data.map((cuenta) => {
      cuenta.items.map((item) => {
        items.push(item);
      });
    });
    productos.map((producto) => {
      const contables = items.filter(
        (item) => item.producto_id === producto.id && item.contable === true
      );
      if (contables.length > 0) {
        let cant = 0,
          imp = 0;
        contables.map((c) => {
          cant += c.cant;
          imp += c.importe;
        });
        list.push({
          cant,
          name: contables[0].name,
          importe: imp,
        });
      }
    });
    setProductos(list);
  };

  const procesarTarjetas = (data) => {
    let totaltarjetas = 0;
    const _tarjetas = data.filter((cuenta) => cuenta.tarjeta > 0);
    _tarjetas.map((cuenta) => {
      totaltarjetas += cuenta.tarjeta;
    });
    setTarjetas({ cant: _tarjetas.length, total: totaltarjetas, cuentas:_tarjetas });
  };

  const procesarCaja = (data) => {
    setCaja(data);
    let totalgastos = 0,
      totaldepositos = 0;

    const _gasto = data.filter((caja) => caja.tipo === "gasto");
    const _deposito = data.filter((caja) => caja.tipo === "deposito");

    _gasto.map((caja) => {
      totalgastos += caja.importe;
    });
    _deposito.map((caja) => {
      totaldepositos += caja.importe;
    });

    setGastos({ cant: _gasto.length, total: totalgastos });
    setDepositos({ cant: _deposito.length, total: totaldepositos });
  };

  const procesarServicios = (data) => {
    let totalcomedor = 0,
      totalpll = 0,
      totaldomicilio = 0;

    const comedor = data.filter((cuenta) => cuenta.servicio === "comedor");
    const pll = data.filter((cuenta) => cuenta.servicio === "pll");
    const domicilio = data.filter((cuenta) => cuenta.servicio === "domicilio");

    comedor.map((cuenta) => {
      totalcomedor += cuenta.total;
    });
    pll.map((cuenta) => {
      totalpll += cuenta.total;
    });
    domicilio.map((cuenta) => {
      totaldomicilio += cuenta.total;
    });
    setCuentascomedor({ cant: comedor.length, total: totalcomedor });
    setCuentaspll({ cant: pll.length, total: totalpll });
    setCuentasdomicilio({ cant: domicilio.length, total: totaldomicilio });
  };

  const onFechas = (e) => {
    setFechas({ ...fechas, [e.target.name]: e.target.value });
  };

  const handleMonitor = (e) => {
    e.preventDefault();
    loaddata();
  };

  return (
    <div className="row">
      <div className="col-md-6 offset-md-3 mt-1">
        <div className="card">
          <div className="card-header d-flex flex-column align-items-center">
            <h5 className="card-title text-center">monitor de ventas</h5>
            <form className="form-inline" onSubmit={handleMonitor}>
              <div className="form-group">
                <input
                  className="formt-control form-control-lg font-weight-bold"
                  name="gte"
                  type="date"
                  max={fechaActual(Date.now())}
                  value={fechas.gte}
                  onChange={onFechas}
                />
              </div>
              <div className="form-group">
                <input
                  className="formt-control form-control-lg font-weight-bold ml-1"
                  name="lte"
                  type="date"
                  max={fechaActual(Date.now())}
                  value={fechas.lte}
                  onChange={onFechas}
                />
              </div>
              <button
                type="submit"
                title="actualizar"
                className="btn btn-info btn-lg"
              >
                &#x1f5d8;
              </button>
            </form>
          </div>
          <div className="card-body p-2">
            <ul className="list-group text-uppercase">
              <li className="list-group-item p-1 lead">
                comedor:{" "}
                <span className="font-weight-bold">
                  ${cuentascomedor.total}.00
                </span>
                <span className="badge badge-info ml-1">
                  {cuentascomedor.cant}
                </span>
              </li>
              <li className="list-group-item p-1 lead">
                para llevar:{" "}
                <span className="font-weight-bold">${cuentaspll.total}.00</span>
                <span className="badge badge-info ml-1">{cuentaspll.cant}</span>
              </li>
              <li className="list-group-item p-1 lead">
                domicilio:{" "}
                <span className="font-weight-bold">
                  ${cuentasdomicilio.total}.00
                </span>
                <span className="badge badge-info ml-1">
                  {cuentasdomicilio.cant}
                </span>
              </li>
              <li className="list-group-item bg-warning p-1 font-weight-bold lead">
                venta total:{" "}
                <span className="font-weight-bold">
                  $
                  {cuentascomedor.total +
                    cuentaspll.total +
                    cuentasdomicilio.total}
                  .00
                </span>
              </li>
              <h4 className="card-text font-weight-bolder">
                --Moviemientos de caja--
              </h4>
              <li className="list-group-item p-1 lead">
                Retiros:{" "}
                <span className="font-weight-bold">-${gastos.total}.00</span>
                <span className="badge badge-info ml-1">{gastos.cant}</span>
              </li>
              <li className="list-group-item p-1 lead">
                depósitos:{" "}
                <span className="font-weight-bold">+${depositos.total}.00</span>
                <span className="badge badge-info ml-1">{depositos.cant}</span>
              </li>
              <h4 className="card-text font-weight-bolder">
                --pagos con tarjeta--
              </h4>
              <li className="list-group-item p-1 lead">
                tarjetas:{" "}
                <span className="font-weight-bold">${tarjetas.total}.00</span>
                <span className="badge badge-info ml-1">{tarjetas.cant}</span>
              </li>
              <li className="list-group-item bg-info p-1 font-weight-bold lead">
                total efectivo:{" "}
                <span className="font-weight-bold">
                  $
                  {cuentascomedor.total +
                    cuentaspll.total +
                    cuentasdomicilio.total +
                    depositos.total -
                    gastos.total -
                    tarjetas.total}
                  .00
                </span>
              </li>
            </ul>
          </div>
          <div className="card-footer">
            <button onClick={()=>setResumenmodal(true)} type="button" className="btn btn-secondary btn-lg">
              Imprimir Resumen
            </button>
            <button onClick={()=>setDetalladomodal(true)} type="button" className="btn btn-secondary btn-lg ml-1">
              Imprimir Detallado
            </button>
          </div>
        </div>
      </div>
      <ResumenModal 
        show={resumenmodal}
        onHide={()=>setResumenmodal(false)}
        comedor={cuentascomedor}
        pll={cuentaspll}
        domicilio={cuentasdomicilio}
        caja={caja}
        gastos={gastos}
        depositos={depositos}
        tarjetas={tarjetas}
        cancelados={cancelados}
        descuentos={descuentos}
        productos={productos}
      />
      <DetalladoModal 
        show={detalladomodal}
        onHide={()=>setDetalladomodal(false)}
        fechas={fechas}
        productos={productos}
      />
    </div>
  );
}
