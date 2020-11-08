import { Modal } from "react-bootstrap";
import { formatDate, operadorSession } from "../../helpers";

export default function ResumenModal(props) {
  const {
    comedor,
    pll,
    domicilio,
    caja,
    gastos,
    depositos,
    tarjetas,
    cancelados,
    descuentos,
  } = props;
  const closeModal = () => {
    props.onHide();
  };

  const setImpresion = () => {
    const printContents = document.getElementById("body").innerHTML,
      w = window.open("", "PRINT", "height=600,width=700");
    w.document.write(`
        <style>
          *{
            text-transform: uppercase;
            font-family: Ticketing;
          }
          p,h1,h2,h3,h4,h5,h6 {
              margin: 0;
              padding: 0;
          }
          #title {
              text-aling: center;
          }
        </style>`);
    w.document.write(printContents);
    w.document.close();
    w.focus();
    w.print();
    w.close();
    closeModal();
    return true;
  };

  return (
    <Modal {...props} size="md" onShow={setImpresion}>
      <Modal.Body>
        <div id="body">
          <br></br>
          <h1 id="title">RESUMEN DE VENTAS</h1>
          <hr></hr>
          <p>fecha: {formatDate(Date.now())}</p>
          <p>operador: {operadorSession}</p>
          <hr></hr>
          <h3>cuentas por servicio</h3>
          <h4>
            -comedor: ${comedor.total}.00 ({comedor.cant})
          </h4>
          <h4>
            -para llevar: ${pll.total}.00 ({pll.cant})
          </h4>
          <h4>
            -domicilio: ${domicilio.total}.00 ({domicilio.cant})
          </h4>
          <h2>
            venta total: ${comedor.total + pll.total + domicilio.total}.00
          </h2>
          <hr></hr>
          <div style={{ display: caja.length > 0 ? "block" : "none" }}>
            <h3>movimientos en caja</h3>
            {caja.map((caja) => (
              <div>
                <h4>-tipo: {caja.tipo}</h4>
                <h4>
                  -concepto: {caja.concepto} ${caja.importe}.00
                </h4>
                <p>-------------------------------------</p>
              </div>
            ))}
            <hr></hr>
          </div>
          <div
            style={{ display: tarjetas.cuentas.length > 0 ? "block" : "none" }}
          >
            <h3>pagos con tarjeta</h3>
            {tarjetas.cuentas.map((cuenta) => (
              <div>
                <h4>
                  -orden: {cuenta.orden} total: ${cuenta.tarjeta}.00
                </h4>
              </div>
            ))}
            <p>-------------------------------------</p>
            <h4>total de tarjetas: ${tarjetas.total}.00</h4>
            <hr></hr>
          </div>
          <h2>
            efectivo: $
            {comedor.total +
              pll.total +
              domicilio.total +
              depositos.total -
              gastos.total -
              tarjetas.total}
            .00
          </h2>
          <div style={{ display: descuentos.length > 0 ? "block" : "none" }}>
            <hr></hr>
            <h3>ordenes con descuento</h3>
            {descuentos.map((cuenta) => (
              <div>
                <h4>-orden:{cuenta.orden}</h4>
                <h4>importe:${cuenta.importe}.00</h4>
                <h4>dscto:-${cuenta.dscto}</h4>
                <h4>
                  total:$
                  {cuenta.total}
                </h4>
                <p>-------------------------------------</p>
              </div>
            ))}
          </div>
          <div style={{ display: cancelados.length > 0 ? "block" : "none" }}>
            <hr></hr>
            <h3>ordenes canceladas</h3>
            {cancelados.map((cuenta) => (
              <div>
                <h4>
                  -orden: {cuenta.orden} total: ${cuenta.total}.00
                </h4>
              </div>
            ))}
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
