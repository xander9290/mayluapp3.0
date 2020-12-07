import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Modal } from "react-bootstrap";
import {
  fechaActual,
  formatDate,
  fechaISO,
  operadorRol,
  operadorSession,
  apiURI,
  commit,
  processImporte,
} from "../../helpers";

export default function CapturaModal(props) {
  const { cuenta, setCuenta } = props;

  const [sources, setSources] = useState({
    categorias: [],
    subcategorias: [],
    productos: [],
  });
  const [obs, setObs] = useState({ obs: "" });
  const [dscto, setDscto] = useState({ dscto: 0 });
  const [miscelaneo, setMiscelaneo] = useState({
    name: "",
    price: 0,
  });
  const [categoriaFondo, setCategoriaFondo] = useState("");
  const [subcategorias, setSubcategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [modificadores, setModificadores] = useState([]);
  const [contador, setContador] = useState(1);
  const [items, setItems] = useState([]);
  const [itemIndex, setItemIndex] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadsources();
  }, []);

  const listScroll = useRef();
  useEffect(() => {
    renderItems();
    setContador(1);
    setItemIndex(!items ? 0 : items.length - 1);
    setMiscelaneo({ name: "", price: 0 });
    scrollTop();
  }, [items]);

  const loadsources = async () => {
    const data = await axios.all([
      axios.get(apiURI + "/categorias"),
      axios.get(apiURI + "/subcategorias"),
      axios.get(apiURI + "/productos"),
    ]);
    setSources({
      categorias: data[0].data,
      subcategorias: data[1].data,
      productos: data[2].data,
    });
  };

  const scrollTop = () => {
    try {
      listScroll.current.scrollTop = listScroll.current.scrollHeight;
    } catch (error) {}
  };

  const reset = () => {
    setSubcategorias([]);
    setProductos([]);
    setModificadores([]);
    setContador(1);
    setItems([]);
    setTotal(0);
    setObs({ obs: "" });
    setDscto({ dscto: 0 });
    setMiscelaneo({ name: "", price: 0 });
    document.title = "MAyLU";
  };

  const aumentarContador = () => {
    setContador(parseInt(contador) + 1);
  };

  const decrementarContador = () => {
    if (contador > 1) {
      setContador(parseInt(contador) - 1);
    }
  };

  const fetchSubcategorias = (categoriaId, fondo) => {
    setProductos([]);
    setModificadores([]);
    const subcategorias = sources.subcategorias.filter(
      (subcategoria) => subcategoria.categoria_id === categoriaId
    );
    if (subcategorias) {
      setCategoriaFondo(fondo);
      setSubcategorias(subcategorias);
    }
  };

  const fetchProductos = (subcategoriaId) => {
    const getProductos = sources.productos.filter(
      (producto) => producto.subcategoria_id === subcategoriaId
    );
    const getSubcategoria = subcategorias.find(
      (subcategoria) => subcategoria.id === subcategoriaId
    );
    setProductos(getProductos);
    setModificadores(getSubcategoria.modificadores);
  };

  const renderItems = async () => {
    let ttl = 0;
    items.map((item, i) => {
      ttl += item.importe;
    });
    setTotal(ttl);
    document.title = `MAyLU $${ttl}.00`;
  };

  const insertItem = (productoId) => {
    const producto = productos.find((producto) => producto.id === productoId);
    if (producto) {
      const cant = parseInt(contador),
        importe = cant * parseInt(producto.price),
        price = producto.price;

      const data = {
        cant,
        name: producto.name,
        importe,
        price,
        dscto: 0,
        modificadores: [],
        producto_id: producto.id,
        contable: producto.contable,
        createdAt: fechaISO(),
        createdBy: operadorSession,
        cancelado: false,
      };
      setItems([...items, data]);
    }
  };

  const selectItem = (idx) => {
    setItemIndex(idx);
  };

  const insertModificador = (modificador) => {
    let list = items;
    try {
      list[itemIndex].modificadores.push(modificador);
      if (modificador.price > 0) {
        list[itemIndex].importe =
          list[itemIndex].importe + parseInt(modificador.price);
      }
    } catch (error) {
      alert("SELECCIONA UN PRODUCTO PRIMERO");
    }
    setItems([...list]);
  };

  const deleteItem = () => {
    let list = items;
    list.splice(itemIndex, 1);
    setItems([...list]);
  };

  const onObs = (e) => {
    setObs({ ...obs, [e.target.name]: e.target.value });
  };

  const insertObs = (e) => {
    e.preventDefault();
    if (items.length > 0) {
      let list = items;
      list[itemIndex].modificadores.push({
        name: obs.obs.trim(),
        price: 0,
      });
      setItems([...list]);
      setObs({ obs: "" });
    } else {
      alert("NO HAY PRODUCTOS EN LA LISTA");
      setObs({ obs: "" });
    }
  };

  const insertSeparador = () => {
    const data = {
      cant: 0,
      name: "------------------------------",
      importe: 0,
      price: 0,
      dscto: 0,
      modificadores: [],
      producto_id: null,
      contable: false,
      createdAt: fechaISO(),
      createdBy: operadorSession,
    };
    setItems([...items, data]);
  };

  const onDscto = (e) => {
    setDscto({ ...dscto, [e.target.name]: e.target.value });
  };

  const insertDscto = (e) => {
    e.preventDefault();
    if (items.length > 0) {
      let list = items,
        importe = list[itemIndex].importe;
      list[itemIndex].importe = importe - parseInt(dscto.dscto);
      list[itemIndex].dscto = parseInt(dscto.dscto);
      setItems([...list]);
      setDscto({ dscto: 0 });
    } else {
      alert("NO HAY PRODUCTOS EN LA LISTA");
      setDscto({ dscto: 0 });
    }
  };

  const onMiscelaneo = (e) => {
    setMiscelaneo({ ...miscelaneo, [e.target.name]: e.target.value });
  };

  const handleMiscelaneo = (e) => {
    e.preventDefault();
    const cant = parseInt(contador),
      importe = parseInt(cant) * parseInt(miscelaneo.price),
      price = parseInt(miscelaneo.price);

    const data = {
      cant,
      name: miscelaneo.name.trim(),
      importe,
      price,
      dscto: 0,
      modificadores: [],
      producto_id: null,
      contable: false,
      createdAt: fechaISO(),
      createdBy: operadorSession,
      cancelado: false,
    };
    setItems([...items, data]);
  };

  const aceptar = async () => {
    let newItems = cuenta.items;
    items.map((items) => {
      newItems.push(items);
    });
    
    const data = {
        ...cuenta,
        items: newItems,
       importe: processImporte.totalItems(newItems,cuenta.dscto).importe,
       total: processImporte.totalItems(newItems,cuenta.dscto).total
      }
    const res = await axios.put(apiURI + "/cuentas/" + cuenta.id, data);
    setCuenta(res.data);
    await commit(
      "ha hecho una captura en la cuenta " + cuenta.orden,
      operadorSession
    );
    // loadcuentas();
    props.onHide();
  };

  return (
    <Modal
      {...props}
      size="lg"
      backdrop="static"
      keyboard={false}
      dialogClassName="modal-captura"
      onExited={reset}
    >
      <Modal.Header className="p-1 d-flex justify-content-between align-items-center">
        {/* información cliente y orden */}
        <small>
          <ul className="list-group list-group-horizontal">
            <li className="list-group-item">
              cliente:{" "}
              <span className="font-weight-bold">{cuenta.torreta}</span>
            </li>
            <li className="list-group-item">
              orden: <span className="font-weight-bold">{cuenta.orden}</span>
            </li>
          </ul>
        </small>
        {/* controles de captura */}
        <div className="d-flex justify-content-between align-items-center">
          {/* separador */}
          <button
            onClick={insertSeparador}
            type="button"
            title="separador"
            className="btn btn-warning btn-lg font-weight-bold mr-2"
          >
            -----
          </button>
          {/* eliminar item */}
          <button
            onClick={deleteItem}
            title="eliminar item"
            type="button"
            className="btn btn-danger btn-lg font-weight-bold mr-2 text-light"
          >
            &times;
          </button>
          {/* observaciones */}
          <form className="form-inline" onSubmit={insertObs}>
            <div className="form-group">
              <input
                className="form-control form-control-lg txtObs"
                type="text"
                name="obs"
                value={obs.obs}
                onChange={onObs}
                placeholder="observaciones"
                required
                autoComplete="off"
              />
            </div>
            <button
              type="submit"
              title="agregar comentario"
              className="btn btn-primary btn-lg font-weight-bold"
            >
              {">"}
            </button>
          </form>
          {/* contador */}
          <button
            onClick={decrementarContador}
            type="button"
            title="menos"
            className="btn btn-warning btn-lg font-weight-bold ml-2"
          >
            &minus;
          </button>
          <input
            type="text"
            value={contador}
            className="form-control form-control-lg input-contador text-center font-weight-bold"
            readOnly
          />
          <button
            onClick={aumentarContador}
            type="button"
            title="más"
            className="btn btn-warning btn-lg font-weight-bold mr-2"
          >
            &#43;
          </button>
          {/* descuento por importe */}
          <form className="form-inline" onSubmit={insertDscto}>
            <div className="form-group">
              <input
                className="form-control form-control-lg txtDscto"
                type="number"
                name="dscto"
                value={dscto.dscto}
                onChange={onDscto}
                min="0"
                required
              />
            </div>
            <button
              type="submit"
              title="descontar"
              className="btn btn-primary btn-lg"
            >
              {"-$"}
            </button>
          </form>
        </div>
        {/* botones aceptar y cancelar */}
        <div className="d-flex justify-content-between align-items-center">
          <button
            onClick={aceptar}
            type="button"
            className="btn btn-success btn-lg mr-1"
          >
            Aceptar
          </button>
          <button
            onClick={props.onHide}
            type="button"
            className="btn btn-danger btn-lg"
          >
            Cancelar
          </button>
        </div>
      </Modal.Header>
      <Modal.Body className="card-captura row py-0">
        <div className="col-md-3 p-0 border">
          <div className="card">
            <div
              ref={listScroll}
              className="card-body card-body-items contenedor-scroll-y scroll-x p-0"
            >
              <table className="table table-sm table-bordered bg-light">
                <thead>
                  <tr className="text-center bg-secondary text-light">
                    <th scope="col">cant</th>
                    <th scope="col">desc</th>
                    <th scope="col">importe</th>
                    <th scope="col">precio</th>
                    <th scope="col">dscto</th>
                  </tr>
                </thead>
                <tbody>
                  {!items
                    ? null
                    : items.map((item, i) => (
                        <tr
                          key={i}
                          onClick={() => selectItem(i)}
                          className={itemIndex === i ? "bg-info" : ""}
                        >
                          <td className="text-center">
                            {item.cant}
                          </td>
                          <td>
                            <p className="m-0 p-0">{item.name}</p>
                            {!item.modificadores
                              ? null
                              : item.modificadores.map((mod, i) => (
                                  <small key={i}>
                                    <p className="m-0 p-0">
                                      {">>"} {mod.name}{" "}
                                      {mod.price > 0 ? "$" + mod.price : ""}
                                    </p>
                                  </small>
                                ))}
                          </td>
                          <td>
                            ${item.importe}
                          </td>
                          <td>
                            ${item.price}
                          </td>
                          <td>
                            -${item.dscto}
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
            <div className="card-footer p-1 d-flex justify-content-between align-items-center">
              <form onSubmit={handleMiscelaneo}>
                <div className="form-group">
                  <input
                    type="text"
                    name="name"
                    value={miscelaneo.name}
                    onChange={onMiscelaneo}
                    className="form-control txtObs"
                    required
                    autoComplete="off"
                    placeholder="Misceláneo"
                  />
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text">$</span>
                    </div>
                    <input
                      type="number"
                      name="price"
                      value={miscelaneo.price}
                      onChange={onMiscelaneo}
                      min="0"
                      className="form-control txtDscto"
                      required
                      autoComplete="off"
                      placeholder="Precio"
                    />
                    <div className="input-group-append">
                      <span className="input-group-text">.00</span>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm mr-1">
                    Aceptar
                  </button>
                  <button type="reset" className="btn btn-warning btn-sm">
                    Cancelar
                  </button>
                </div>
              </form>
              {/* total */}
              <div className="lead font-weight-bold">
                Total: $<span>{total}</span>.00
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-2 d-flex flex-column">
          {sources.categorias.map((categoria) => (
            <button
              type="button"
              onClick={() => fetchSubcategorias(categoria.id, categoria.fondo)}
              key={categoria.id}
              style={{ backgroundColor: categoria.fondo }}
              className="btn btn-warning font-weight-bold categorias-captura mb-1 text-uppercase"
            >
              {categoria.name}
            </button>
          ))}
        </div>
        <div className="col-md-7 p-0 border">
          <div className="card card-sources">
            <div className="card-header p-1 scroll-x">
              <div className="subcategoria-container">
                {subcategorias.map((subcategoria) => (
                  <button
                    onClick={() => fetchProductos(subcategoria.id)}
                    key={subcategoria.id}
                    type="button"
                    style={{ backgroundColor: categoriaFondo }}
                    className="btn btn-info text-uppercase text-dark font-weight-bold mr-1"
                  >
                    {subcategoria.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="card-body p-1 contenedor-scroll-y">
              <div className="productos-container">
                {productos.map((producto) => (
                  <button
                    onClick={() => insertItem(producto.id)}
                    key={producto.id}
                    type="button"
                    style={{ backgroundColor: categoriaFondo }}
                    className="btn btn-success text-dark font-weight-bold text-uppercase mr-1 mb-1"
                  >
                    {producto.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="card-footer p-1 scroll-x">
              <div className="modificadores-container">
                {modificadores.map((modificador, i) => (
                  <button
                    onClick={() => insertModificador(modificador)}
                    key={i}
                    type="button"
                    style={{ backgroundColor: categoriaFondo }}
                    className="btn btn-primary text-dark font-weight-bold text-uppercase mr-1 mb-1"
                  >
                    {modificador.name}{" "}
                    {modificador.price > 0 ? "$" + modificador.price : ""}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
