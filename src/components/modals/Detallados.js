import { Modal } from "react-bootstrap";
import { formatDate, operadorSession } from "../../helpers";

export default function DetalladoModal(props) {
  const { fechas, productos, miscelaneo } = props;
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
            table {
                width: 100%;
            }
            table tbody tr td {
                font-size: 18px;
            }
            table tbody tr {
                padding: 0;
            }
            td:first-child, td:last-child {
                text-align: center
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

  let total = 0;
  return (
    <Modal {...props} size="md" onShow={setImpresion}>
      <Modal.Body>
        <div id="body">
          <br></br>
          <h2 id="title">DETALLADO DE PRODUCTOS</h2>
          <hr></hr>
          <p>
            {formatDate(Date.now())} operador: {operadorSession}
          </p>
          <p>
            de: {fechas.gte} a: {fechas.lte}
          </p>
          <hr></hr>
          <table>
            <thead>
              <tr>
                <th>cant</th>
                <th>desc</th>
                <th>importe</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => {
                total += p.importe;
                return (
                  <tr>
                    <td valign="top">{p.cant}</td>
                    <td>{p.name}</td>
                    <td valign="top">${p.importe}</td>
                  </tr>
                );
              })}
              {
                miscelaneo.length===0?null:(
                  <tr>
                <td></td>
                <td>
                  <h4>---Miscelaneos---</h4>
                </td>
                <td></td>
              </tr>
                )
              }
              {miscelaneo.map((m) => {
                total += m.importe;
                return (
                  <tr>
                    <td valign="top">{m.cant}</td>
                    <td>{m.name}</td>
                    <td valign="top">${m.importe}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <hr></hr>
          <h3>Total de ventas: ${total}.00</h3>
        </div>
      </Modal.Body>
    </Modal>
  );
}
