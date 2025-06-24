import React, { useState, useEffect } from "react";
import axios from "axios";
import useAuth from "../components/useAuth";
import useLogout from "../components/useLogout";
import RendicionesTab from "../components/RendicionesTab";
import ViaticosTab from "../components/ViaticoTab";
import MisViativosPorEstado from "../components/MisViaticosPorEstado";
const LOGO_URL = "/logo.png";

const AbogadosDashboard = () => {
  const { user, loading } = useAuth("abogado");
  const { logout } = useLogout();
  const [tab, setTab] = useState("inicio");
  const [clientes, setClientes] = useState([]);
  const [modoViaticos, setModoViaticos] = useState("crear"); // cambiar "ver" por "crear"
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const res = await axios.get(`${API_URL}/clientes`, {
        withCredentials: true,
      });
      setClientes(res.data);
    } catch (error) {
      console.error("Error al obtener clientes", error);
    }
  };

  const tabs = [
    { key: "inicio", label: "Inicio" },
    { key: "rendiciones", label: "Rendiciones" },
    { key: "viaticos", label: "Viáticos" },
    { key: "contacto", label: "Contacto" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold text-center mb-6">
        Panel del Abogado - {user.username}
      </h1>

      {/* Navegación */}
      <div className="flex justify-center gap-2 mb-8 flex-wrap">
        {tabs.map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`px-4 py-2 rounded-t-lg border-b-2 ${
              tab === item.key
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {item.label}
          </button>
        ))}
        <button
          onClick={logout}
          className="px-4 py-2 rounded-t-lg bg-red-500 text-white ml-2"
        >
          Exit
        </button>
      </div>

      {tab === "inicio" && (
        <div className="flex flex-col items-center gap-4">
          <img src={LOGO_URL} alt="Logo OCL" className="h-24" />
        </div>
      )}

      {tab === "rendiciones" && <RendicionesTab clientes={clientes} />}

      {tab === "viaticos" && (
        <div className="flex flex-col items-center">
          <div className="flex justify-center mb-4 gap-2">
            <button
              onClick={() => setModoViaticos("crear")}
              className={`px-4 py-2 rounded bg-blue-600 text-white ${
                modoViaticos === "crear" ? "opacity-100" : "opacity-70"
              }`}
            >
              Crear Viático
            </button>
            <button
              onClick={() => setModoViaticos("aprobada")}
              className={`px-4 py-2 rounded bg-green-500 text-white ${
                modoViaticos === "aprobada" ? "opacity-100" : "opacity-70"
              }`}
            >
              Aprobados
            </button>
            <button
              onClick={() => setModoViaticos("pendiente")}
              className={`px-4 py-2 rounded bg-yellow-500 text-white ${
                modoViaticos === "pendiente" ? "opacity-100" : "opacity-70"
              }`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setModoViaticos("rechazada")}
              className={`px-4 py-2 rounded bg-red-500 text-white ${
                modoViaticos === "rechazada" ? "opacity-100" : "opacity-70"
              }`}
            >
              Rechazados
            </button>
          </div>

          {modoViaticos === "crear" ? (
            <ViaticosTab user={user} clientes={clientes} />
          ) : (
            <MisViativosPorEstado estadoFiltro={modoViaticos} />
          )}
        </div>
      )}

      {tab === "contacto" && (
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-xl font-bold mb-2">Contacto</h2>
          <div className="bg-white p-4 rounded shadow w-full max-w-md">
            <p>
              <strong>Oficina:</strong> Ovalle Consejeros Legales
            </p>
            <p>
              <strong>Dirección:</strong> Cerro el plomo #5420 Of. 903, Las
              Condes
            </p>
            <p>
              <strong>Teléfono:</strong> 225779000
            </p>
            <p>
              <strong>Email:</strong> Isabel.quiroz@ocl.cl
            </p>
            <a
              href="https://ocl.cl/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Sitio web oficial
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default AbogadosDashboard;
