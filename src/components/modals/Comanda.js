import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Modal } from "react-bootstrap";
import {
  fechaActual,
  formatDate,
  fechaISO,
  operadorRol,
  operadorSession,
  cuentaInitValues,
  apiURI,
  commit,
  numeroALetras,
} from "../../helpers";

export default function ComandaModal(props) {
  const { cuenta, comanda, onHide } = props;

  const setVista = () => {
    onHide();
    const printContents = document.getElementById("comandaVista").innerHTML,
      w = window.open("", "PRINT", "height=600,width=700");

    w.document.write(
      `
            <style>
                * {
                    text-transform: uppercase;
                    font-family: Ticketing;
                }
                h1,h2,h3,h4,h5,h6,p {
                    margin: 0;
                    padding: 0;
                }
                #logoContainer {
                    background-color: black;
                    color: white;
                    border-radius: 6px;
                    text-align: center;
                    width: 42%;
                    margin: 0 auto;
                    padding: 8px;
                }
                #logoNameTitle {
                    font-size: 42px;
                }
                #logoSubName {
                    font-size: 25px;
                }
                #logo {
                    border: 3px dashed white;
                    border-radius: 6px;
                    padding: 6px;
                }
                #infoEmpresa {
                    text-align: center;
                }
                #infoCuenta {
                    text-align: center;
                }
                strong {
                    font-size: 20px;
                    font-weight: bold;
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
                #totalInfo {
                   padding-right: 40px;
                }
                ul {
                    text-align: right;
                }
                ul li {
                    text-decoration: none;
                    display: block;
                    margin-bottom: 1px;
                    margin: 0px;
                    padding: 0px;
                  }
                #footer {
                    text-align: center;
                }
            </style>
          `
    );
    w.document.write(printContents);
    w.document.close();
    w.focus();
    w.print();
    w.close();
    return true;
  };
  return (
    <Modal
      {...props}
      size="md"
      onShow={setVista}
      backdrop="static"
      keyboard="true"
    >
      <div id="comandaVista">
        <br></br>
        <div id="logoContainer">
          <div id="logo">
            <h3 id="logoNameTitle">maylu</h3>
            <h5 id="logoSubName">sushi</h5>
          </div>
        </div>
        <div id="infoEmpresa">
          <p>manuel mena #3870</p>
          <p>colonia polanco, c.p. 44960</p>
          <p id="tel">tel: 3333675283</p>
          <p id="wsap">whatsapp: 3311327036</p>
        </div>
        <div id="infoCuenta">
          <strong>
            {" "}
            <p>
              orden: {cuenta.orden} {cuenta.servicio}
            </p>
            <p>cliente: {cuenta.torreta}</p>
          </strong>
          <p>
            operador: {cuenta.createdBy}{" "}
            {comanda
              ? formatDate(cuenta.createdAt)
              : formatDate(cuenta.closedAt)}
          </p>
        </div>
        {!cuenta.cliente.id ? null : (
          <div style={{ display: comanda ? "none" : "block" }} id="clienteInfo">
            <hr></hr>
            <strong>
              <p>{cuenta.cliente.address.calle}</p>
              <p>{cuenta.cliente.address.cruces}</p>
              <p>{cuenta.cliente.address.colonia}</p>
            </strong>
            <p>tel: {cuenta.cliente.tel}</p>
          </div>
        )}
        <hr></hr>
        <div id="itemsInfo">
          <table>
            <thead>
              <tr>
                <th>cant</th>
                <th>desc</th>
                <th>importe</th>
              </tr>
            </thead>
            <tbody>
              {!cuenta.items
                ? null
                : cuenta.items.map((item, i) => (
                    <tr key={i}>
                      <td valign="top">{item.cant}</td>
                      <td>
                        <p>{item.name}</p>
                        <small>
                          {item.modificadores.map((m, i) => (
                            <p key={i}>
                              {">>"}
                              {m.name} {m.price > 0 ? "$" + m.price : ""}
                            </p>
                          ))}
                        </small>
                      </td>
                      <td valign="top">${item.importe}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
          <hr></hr>
        </div>
        <div id="totalInfo">
          <small>
            <ul>
              <li style={{ display: cuenta.dscto > 0 ? "block" : "none" }}>
                subtotal: ${cuenta.importe}.00
              </li>
              <li style={{ display: cuenta.dscto > 0 ? "block" : "none" }}>
                descuento: -${cuenta.dscto}.00
              </li>
              <li>
                <h2>total: ${cuenta.total}.00</h2>
              </li>
              <li style={{ display: cuenta.efectivo > 0 ? "block" : "none" }}>
                efectivo: ${cuenta.efectivo}.00
              </li>
              <li style={{ display: cuenta.tarjeta > 0 ? "block" : "none" }}>
                tarjeta: ${cuenta.tarjeta}.00
              </li>
              <li style={{ display: cuenta.cambio > 0 ? "block" : "none" }}>
                cambio: ${cuenta.cambio}.00
              </li>
            </ul>
            {numeroALetras(cuenta.total, {
              plural: "PESOS 00/100",
              singular: "PESO 00/100",
            })}
          </small>
          <hr></hr>
          <div id="footer">
            <p>**gracias por su compra**</p>
            <small>
              <p>consulte nuestro menú por whatsapp</p>
            </small>
          </div>
        </div>
      </div>
    </Modal>
  );
}
