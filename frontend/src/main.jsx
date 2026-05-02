import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
<<<<<<< HEAD
import { AuthProvider } from "./context/AuthContext";
import { EmpresaProvider } from "./context/EmpresaContext";
=======
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
<<<<<<< HEAD
      <AuthProvider>
        <EmpresaProvider>
          <App />
        </EmpresaProvider>
      </AuthProvider>
=======
      <App />
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
    </BrowserRouter>
  </React.StrictMode>
);