import { useEffect } from "react";

import { operadorSession } from "./helpers";

import LoginForm from "./components/LoginForm";
import Interface from "./components/Interface";

function App() {
  return (
    <div className="container-fluid">
      {operadorSession ? <Interface /> : <LoginForm />}
    </div>
  );
}

export default App;
