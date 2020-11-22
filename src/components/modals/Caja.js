import { useState } from "react";
import { Modal } from "react-bootstrap";

import { formatDate } from "../../helpers";

export default function CajaModal(props) {
  const { caja, setCaja } = props;

  const closeModal = () => {
    setCaja({});
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
      p,h3 {
        margin: 0px;
        padding: 0px;
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
          <hr></hr>
          <h3>{caja.tipo}</h3>
          <p>fecha: {formatDate(caja.createdAt)} Operador: {caja.createdBy}</p>
          <hr></hr>
          <p>concepto: {caja.concepto}</p>
          <p>importe: ${caja.importe}</p>
          <hr></hr>
        </div>
      </Modal.Body>
    </Modal>
  );
}
