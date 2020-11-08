import { useState, useRef } from "react";
import { Modal } from "react-bootstrap";

export default function InfoCliente(props) {
  const { cuenta } = props;

  return (
    <Modal {...props} size="lg" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>datos de cliente</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ul className="list-group list-group-horizontal">
          <li className="list-group-item lead p-1">
            orden: <span className="font-weight-bold">{cuenta.orden}</span>
          </li>
        </ul>
        {!cuenta.cliente ? null : (
          <ul className="list-group">
            <li className="list-group-item lead">
              cliente:{" "}
              <span className="font-weight-bold">{cuenta.cliente.name}</span>
            </li>
            <li className="list-group-item lead">
              teléfono:{" "}
              <span className="font-weight-bold">{cuenta.cliente.tel}</span>
            </li>
            <li className="list-group-item lead">
              calle:{" "}
              <span className="font-weight-bold">
                {cuenta.cliente.address.calle}
              </span>
            </li>
            <li className="list-group-item lead">
              cruces:{" "}
              <span className="font-weight-bold">
                {cuenta.cliente.address.cruces}
              </span>
            </li>
            <li className="list-group-item lead">
              colonia:{" "}
              <span className="font-weight-bold">
                {cuenta.cliente.address.colonia}
              </span>
            </li>
            <li className="list-group-item lead">
              observaciones:{" "}
              <span className="font-weight-bold">
                {cuenta.cliente.address.obs}
              </span>
            </li>
          </ul>
        )}
      </Modal.Body>
    </Modal>
  );
}
