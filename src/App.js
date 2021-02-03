import { useEffect } from "react";

import { operadorSession } from "./helpers";

import LoginForm from "./components/LoginForm";
import Interface from "./components/Interface";

function App() {
  useEffect(() => {
    window.addEventListener("beforeunload", function (e) {
      e.preventDefault();
      e.returnValue = "";
    });
    document.addEventListener("contextmenu", (e) => e.preventDefault());

    return () => {
      window.removeEventListener("beforeunload", function (e) {
        e.preventDefault();
        e.returnValue = "";
      });
      document.removeEventListener("contextmenu", (e) => e.preventDefault());
    };
  }, []);
  return (
    <div className="container-fluid">
      {operadorSession ? <Interface /> : <LoginForm />}
    </div>
  );
}

export default App;
