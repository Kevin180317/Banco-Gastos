import React, { useState, useEffect } from "react";
import axios from "axios";
import useAuth from "../components/useAuth";
import useLogout from "../components/useLogout";
import RendicionesTab from "../components/RendicionesTab";

const LOGO_URL = "/logo.png";

const UserDashboard = () => {
  const { user, loading } = useAuth("user");
  const { logout } = useLogout();
  const [tab, setTab] = useState("inicio");
  const [clientes, setClientes] = useState([]);
  // PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (tab === "clientes") {
      setLoadingClientes(true);
      axios
        .get("http://localhost:5000/clientes", { withCredentials: true })
        .then((res) =>
          setClientes(
            res.data.map((c) => ({
              ...c,
              dinero:
                c.dinero !== undefined && c.dinero !== null
                  ? Number(c.dinero)
                  : 0,
            }))
          )
        )
        .catch(() => setClientes([]))
        .finally(() => setLoadingClientes(false));
    }
  }, [tab]);

  if (loading) return <div className="text-center mt-10">Cargando...</div>;

  const tabs = [
    { key: "inicio", label: "Inicio" },
    { key: "clientes", label: "Lista de clientes" },
    { key: "rendiciones", label: "Rendiciones" },
    { key: "contacto", label: "Contacto" },
  ];

  // PAGINACIÓN
  const totalPages = Math.ceil(clientes.length / itemsPerPage);
  const paginatedClientes = clientes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold text-center mb-6">
        Bienvenido, {user.username}
      </h1>
      <div className="flex justify-center gap-2 mb-8 flex-wrap">
        {tabs.map((item) => (
          <button
            key={item.key}
            onClick={() => {
              setTab(item.key);
              if (item.key === "clientes") setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-t-lg border-b-2 transition-all duration-150 ${
              tab === item.key
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-100 text-gray-700 border-transparent"
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
      {tab === "clientes" && (
        <div>
          <h2 className="text-xl font-bold mb-4">Lista de Clientes</h2>
          {loadingClientes ? (
            <p>Cargando clientes...</p>
          ) : clientes.length === 0 ? (
            <p>No hay clientes registrados.</p>
          ) : (
            <>
              {/* Notificación de copiado */}
              {copiedId && (
                <div className="mb-2 text-green-700 bg-green-100 border border-green-300 px-4 py-2 rounded text-center">
                  Cliente copiado al portapapeles
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded shadow">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 border">Nombre</th>
                      <th className="px-3 py-2 border">RUT</th>
                      <th className="px-3 py-2 border">Teléfono</th>
                      <th className="px-3 py-2 border">Correo</th>
                      <th className="px-3 py-2 border">Dirección</th>
                      <th className="px-3 py-2 border">Giro</th>
                      <th className="px-3 py-2 border">Dinero</th>
                      <th className="px-3 py-2 border">Copiar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedClientes.map((c) => (
                      <tr key={c.id}>
                        <td className="px-3 py-2 border">{c.nombre}</td>
                        <td className="px-3 py-2 border">{c.rut}</td>
                        <td className="px-3 py-2 border">{c.telefono}</td>
                        <td className="px-3 py-2 border">{c.correo}</td>
                        <td className="px-3 py-2 border">{c.direccion}</td>
                        <td className="px-3 py-2 border">{c.giro}</td>
                        <td className="px-3 py-2 border">
                          <span className="text-green-600 font-semibold">
                            ${c.dinero}
                          </span>
                        </td>
                        <td className="px-3 py-2 border">
                          <button
                            className="text-gray-600 underline"
                            onClick={() => {
                              const text = `Nombre: ${c.nombre}
RUT: ${c.rut}
Teléfono: ${c.telefono}
Correo: ${c.correo}
Dirección: ${c.direccion}
Giro: ${c.giro}
Dinero: $${c.dinero}`;
                              navigator.clipboard.writeText(text);
                              setCopiedId(c.id);
                              setTimeout(() => setCopiedId(null), 1500);
                            }}
                          >
                            Copiar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Paginación */}
              <div className="flex justify-center items-center gap-2 mt-4">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
                >
                  {"<"}
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded ${
                      currentPage === i + 1
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
                >
                  {">"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
      {tab === "rendiciones" && (
        <div>
          <h2 className="text-xl font-bold mb-4">Mis Rendiciones</h2>
          <RendicionesTab clientes={clientes} readOnly={true} />
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
              <strong>Dirección:</strong> Cerro el plomo #5420 Of. 903 , Las
              condes
            </p>
            <p>
              <strong>Teléfono:</strong> 225779000
            </p>
            <p>
              <strong>Email:</strong> Isabel.quiros@ocl.cl
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

export default UserDashboard;
