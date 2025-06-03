import React, { useState, useEffect } from "react";
import axios from "axios";
import useAuth from "../components/useAuth";
import useLogout from "../components/useLogout";
import RendicionesTab from "../components/RendicionesTab";
const LOGO_URL = "/logo.png";

const AdminDashboard = () => {
  const { user, loading } = useAuth("admin");
  const { logout } = useLogout();
  const [tab, setTab] = useState("inicio");
  const [saldos, setSaldos] = useState({});

  const [clientes, setClientes] = useState([]);
  // PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // BUSCADOR
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedCliente, setSelectedCliente] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    rut: "",
    telefono: "",
    correo: "",
    direccion: "",
    giro: "",
    dinero: "",
  });
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Traer clientes del backend
  const fetchClientes = async () => {
    setLoadingClientes(true);
    try {
      const res = await axios.get("http://localhost:5000/clientes", {
        withCredentials: true,
      });
      // Asegura que todos los clientes tengan dinero como número
      setClientes(
        res.data.map((c) => ({
          ...c,
          dinero:
            c.dinero !== undefined && c.dinero !== null ? Number(c.dinero) : 0,
        }))
      );
    } catch (error) {
      console.error("Error al obtener clientes", error);
    } finally {
      setLoadingClientes(false);
    }
  };

  const fetchSaldos = async () => {
    try {
      const res = await axios.get("http://localhost:5000/saldos-clientes", {
        withCredentials: true,
      });
      // Convierte el array a un objeto para acceso rápido por cliente_id
      const saldosObj = {};
      res.data.forEach((s) => {
        saldosObj[s.cliente_id] = s.saldo;
      });
      setSaldos(saldosObj);
    } catch (error) {
      console.error("Error al obtener saldos", error);
    }
  };

  useEffect(() => {
    fetchClientes();
    fetchSaldos();
  }, []);

  // Filtrar clientes basado en el término de búsqueda
  const filteredClientes = clientes.filter((cliente) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      cliente.nombre.toLowerCase().includes(searchLower) ||
      cliente.rut.toLowerCase().includes(searchLower) ||
      cliente.correo.toLowerCase().includes(searchLower) ||
      (cliente.telefono &&
        cliente.telefono.toLowerCase().includes(searchLower)) ||
      (cliente.direccion &&
        cliente.direccion.toLowerCase().includes(searchLower)) ||
      (cliente.giro && cliente.giro.toLowerCase().includes(searchLower))
    );
  });

  // Manejar selección de cliente para editar
  const handleSelectCliente = (cliente) => {
    setSelectedCliente(cliente);
    setFormData({
      nombre: cliente.nombre,
      rut: cliente.rut,
      telefono: cliente.telefono || "",
      correo: cliente.correo,
      direccion: cliente.direccion || "",
      giro: cliente.giro || "",
      dinero:
        cliente.dinero !== undefined &&
        cliente.dinero !== null &&
        cliente.dinero !== 0
          ? String(cliente.dinero)
          : "",
    });
    setTab("editarCliente");
  };

  // Manejar cambio en inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "dinero") {
      // Permite solo números y punto decimal, y permite vacío
      if (/^\d*\.?\d*$/.test(value)) {
        setFormData((prev) => ({
          ...prev,
          dinero: value,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Manejar cambio en el buscador
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Resetear a la primera página al buscar
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Guardar o actualizar cliente
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        direccion: formData.direccion || "",
        giro: formData.giro || "",
        dinero:
          formData.dinero !== undefined &&
          formData.dinero !== null &&
          formData.dinero !== ""
            ? Number(formData.dinero)
            : "",
      };
      if (selectedCliente) {
        // Actualizar cliente
        await axios.put(
          `http://localhost:5000/clientes/${selectedCliente.id}`,
          dataToSend,
          { withCredentials: true }
        );
      } else {
        // Crear nuevo cliente
        await axios.post("http://localhost:5000/clientes", dataToSend, {
          withCredentials: true,
        });
      }
      setSelectedCliente(null);
      setFormData({
        nombre: "",
        rut: "",
        telefono: "",
        correo: "",
        direccion: "",
        giro: "",
        dinero: "",
      });
      fetchClientes();
      setTab("clientes");
    } catch (error) {
      console.error("Error al guardar cliente", error);
    }
  };

  if (loading) return <div className="text-center mt-10">Cargando...</div>;

  // --- Pestañas fijas ---
  const tabs = [
    { key: "inicio", label: "Inicio" },
    { key: "clientes", label: "Lista de clientes" },
    { key: "editarCliente", label: "Cliente" },
    { key: "rendiciones", label: "Rendiciones" },
    { key: "contacto", label: "Contacto" },
  ];

  // Calcular clientes a mostrar en la página actual (usando clientes filtrados)
  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage);
  const paginatedClientes = filteredClientes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold text-center mb-6">
        Panel de Administración - {user.username}
      </h1>

      {/* Navegación por pestañas */}
      <div className="flex justify-center gap-2 mb-8 flex-wrap">
        {tabs.map((item) => (
          <button
            key={item.key}
            onClick={() => {
              setTab(item.key);
              if (item.key === "clientes") setSelectedCliente(null);
              if (item.key === "editarCliente" && !selectedCliente) {
                setFormData({
                  nombre: "",
                  rut: "",
                  telefono: "",
                  correo: "",
                  direccion: "",
                  giro: "",
                  dinero: "",
                });
              }
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

      {/* Contenido por pestaña */}
      {tab === "inicio" && (
        <div className="flex flex-col items-center gap-4">
          <img src={LOGO_URL} alt="Logo OCL" className="h-24" />
        </div>
      )}

      {tab === "clientes" && (
        <div>
          <h2 className="text-xl font-bold mb-4">Lista de Clientes</h2>

          {/* Buscador */}
          <div className="mb-4 flex gap-2 items-center">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Buscar por nombre, RUT, correo, teléfono, dirección o giro..."
                className="w-full border px-3 py-2 rounded-lg pr-10"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  title="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>
            {searchTerm && (
              <span className="text-sm text-gray-600">
                {filteredClientes.length} de {clientes.length} clientes
              </span>
            )}
          </div>

          <button
            onClick={() => {
              fetchClientes();
              fetchSaldos();
            }}
            className="mb-8 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            title="Actualizar lista de clientes"
          >
            Actualizar pagina
          </button>

          {loadingClientes ? (
            <p>Cargando clientes...</p>
          ) : filteredClientes.length === 0 ? (
            <p>
              {searchTerm
                ? `No se encontraron clientes que coincidan con "${searchTerm}".`
                : "No hay clientes registrados."}
            </p>
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
                      <th className="px-3 py-2 border">Acciones</th>
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
                          <span
                            className={`font-semibold ${
                              saldos[c.id] >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            ${saldos[c.id] ?? c.dinero}
                          </span>
                        </td>

                        <td className="px-3 py-2 border  gap-2">
                          <button
                            className="text-blue-500 "
                            onClick={() => handleSelectCliente(c)}
                          >
                            Editar
                          </button>
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
              {totalPages > 1 && (
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
              )}
            </>
          )}
          <button
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
            onClick={() => {
              setSelectedCliente(null);
              setFormData({
                nombre: "",
                rut: "",
                telefono: "",
                correo: "",
                direccion: "",
                giro: "",
                dinero: "",
              });
              setTab("editarCliente");
            }}
          >
            + Nuevo Cliente
          </button>
        </div>
      )}

      {tab === "editarCliente" && (
        <div className="bg-gray-100 p-4 rounded shadow max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-4">
            {selectedCliente ? "Editar Cliente" : "Nuevo Cliente"}
          </h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="text"
              name="nombre"
              placeholder="Nombre del cliente"
              className="w-full border px-3 py-2 rounded"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="rut"
              placeholder="RUT"
              className="w-full border px-3 py-2 rounded"
              value={formData.rut}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="telefono"
              placeholder="Teléfono"
              className="w-full border px-3 py-2 rounded"
              value={formData.telefono}
              onChange={handleChange}
            />
            <input
              type="email"
              name="correo"
              placeholder="Correo electrónico"
              className="w-full border px-3 py-2 rounded"
              value={formData.correo}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="direccion"
              placeholder="Dirección"
              className="w-full border px-3 py-2 rounded"
              value={formData.direccion}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="giro"
              placeholder="Giro"
              className="w-full border px-3 py-2 rounded"
              value={formData.giro}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="dinero"
              placeholder="Dinero"
              className="w-full border px-3 py-2 rounded"
              value={formData.dinero}
              onChange={handleChange}
              inputMode="decimal"
              autoComplete="off"
              required
            />
            <div className="flex justify-between items-center">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Guardar cambios
              </button>
              <button
                type="button"
                className="text-gray-600 underline"
                onClick={() => {
                  setSelectedCliente(null);
                  setFormData({
                    nombre: "",
                    rut: "",
                    telefono: "",
                    correo: "",
                    direccion: "",
                    giro: "",
                    dinero: "",
                  });
                  setTab("clientes");
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {tab === "rendiciones" && <RendicionesTab clientes={clientes} />}

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

export default AdminDashboard;
