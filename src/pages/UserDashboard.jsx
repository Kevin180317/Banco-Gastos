import React, { useState, useEffect } from "react";
import axios from "axios";
import useAuth from "../components/useAuth";
import useLogout from "../components/useLogout";
import RendicionesUserTab from "../components/RencicionesReadTab";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFDownloadLink,
  Image,
} from "@react-pdf/renderer";
const LOGO_URL = "/logo.png";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 20,
    fontSize: 11,
    fontFamily: "Helvetica",
  },
  headerBox: {
    border: "2px solid black",
    padding: 10,
    marginBottom: 15,
    textAlign: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
  },
  mainSection: {
    border: "1px solid black",
    padding: 15,
    marginBottom: 10,
  },
  responsableSection: {
    border: "1px solid black",
    padding: 15,
    marginBottom: 10,
  },
  notariaSection: {
    border: "1px solid black",
    padding: 15,
    marginBottom: 10,
  },
  adminSection: {
    border: "1px solid black",
    padding: 15,
    marginBottom: 10,
  },
  field: {
    marginBottom: 8,
    fontSize: 11,
  },
  fieldLabel: {
    fontWeight: "bold",
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 10,
    fontSize: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  column: {
    flex: 1,
    marginRight: 10,
  },
  underline: {
    borderBottom: "1px solid black",
    minHeight: 15,
    marginLeft: 5,
    flex: 1,
  },
});

const SolicitudFondoPDF = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.headerBox}>
        <Text style={styles.title}>SOLICITUD DE FONDOS POR RENDIR</Text>
        <Image src={LOGO_URL} style={{ marginTop: 5, alignSelf: "center" }} />
      </View>

      {/* Información principal */}
      <View style={styles.mainSection}>
        <Text style={styles.field}>
          <Text style={styles.fieldLabel}>Fecha : </Text>
          {data.fecha}
        </Text>
        <Text style={styles.field}>
          <Text style={styles.fieldLabel}>Cliente : </Text>
          {data.cliente}
        </Text>
        <Text style={styles.field}>
          <Text style={styles.fieldLabel}>Solicitante de la empresa : </Text>
          {data.solicitanteEmpresa}
        </Text>
        <Text style={styles.field}>
          <Text style={styles.fieldLabel}>Monto : </Text>
          {data.monto}
        </Text>
      </View>

      {/* Responsables */}
      <View style={styles.responsableSection}>
        <Text style={styles.field}>
          <Text style={styles.fieldLabel}>Responsable Interno: </Text>
          {data.responsableInterno}
        </Text>
        <Text style={styles.field}>
          <Text style={styles.fieldLabel}>Responsable Externo : </Text>
          {data.responsableExterno}
        </Text>
        <Text style={styles.field}>
          <Text style={styles.fieldLabel}>Concepto : </Text>
          {data.concepto}
        </Text>
      </View>

      {/* Transferencia */}
      <View style={styles.notariaSection}>
        <Text style={styles.field}>
          <Text style={styles.fieldLabel}>
            A nombre de quién se emite Transferencia :{" "}
          </Text>
          {data.emiteTransferencia}
        </Text>
        <Text style={styles.field}>
          <Text style={styles.fieldLabel}>¿Tiene respaldo boleta? : </Text>
          {data.tramiteRespaldo}
        </Text>
      </View>

      {/* Información interna */}
      <View style={styles.adminSection}>
        <Text style={styles.sectionTitle}>Interno Administración</Text>
        <Text style={styles.field}>
          <Text style={styles.fieldLabel}>Nº Documento: </Text>
          {data.nDocumento}
        </Text>
        <Text style={styles.field}>
          <Text style={styles.fieldLabel}>Cuenta Corriente: </Text>
          {data.cuentaCorriente}
        </Text>
        <Text style={styles.field}>
          <Text style={styles.fieldLabel}>Banco: </Text>
          {data.banco}
        </Text>
      </View>
    </Page>
  </Document>
);

const UserDashboard = () => {
  const { user, loading } = useAuth("user");
  const { logout } = useLogout();
  const [tab, setTab] = useState("inicio");
  const [clientes, setClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [saldos, setSaldos] = useState({});
  const API_URL = import.meta.env.VITE_API_URL;

  const [formData, setFormData] = useState({
    fecha: "",
    cliente: "",
    solicitanteEmpresa: "",
    monto: "",
    responsableInterno: "",
    responsableExterno: "",
    concepto: "",
    emiteTransferencia: "",
    tramiteRespaldo: "",
    nDocumento: "",
    cuentaCorriente: "",
    banco: "",
  });

  // PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const fetchClientes = () => {
    setLoadingClientes(true);
    axios
      .get(`${API_URL}/clientes`, { withCredentials: true })
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
  };

  const fetchSaldos = () => {
    axios
      .get(`${API_URL}/saldos-clientes`, { withCredentials: true })
      .then((res) => {
        const saldosObj = {};
        res.data.forEach((s) => {
          saldosObj[s.cliente_id] = s.saldo;
        });
        setSaldos(saldosObj);
      })
      .catch(() => setSaldos({}));
  };

  useEffect(() => {
    if (tab === "clientes") {
      fetchClientes();
      fetchSaldos();
    }
  }, [tab]);

  if (loading) return <div className="text-center mt-10">Cargando...</div>;

  const tabs = [
    { key: "inicio", label: "Inicio" },
    { key: "clientes", label: "Lista de clientes" },
    { key: "rendiciones", label: "Rendiciones" },
    { key: "solicitud-fondo", label: "Solicitud de Fondo" },
    { key: "contacto", label: "Contacto" },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const requiredFields = [
    "fecha",
    "cliente",
    "solicitanteEmpresa",
    "monto",
    "responsableExterno",
    "concepto",
    "emiteTransferencia",
    "tramiteRespaldo",
  ];

  const isFormValid = requiredFields.every(
    (field) => formData[field].trim() !== ""
  );

  const handleDownloadClick = () => {
    // Limpiar formulario
    setFormData({
      fecha: "",
      cliente: "",
      solicitanteEmpresa: "",
      monto: "",
      responsableInterno: "",
      responsableExterno: "",
      concepto: "",
      emiteTransferencia: "",
      tramiteRespaldo: "",
      nDocumento: "",
      cuentaCorriente: "",
      banco: "",
    });
  };

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

  // PAGINACIÓN
  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage);
  const paginatedClientes = filteredClientes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
          <RendicionesUserTab clientes={clientes} />
        </div>
      )}

      {tab === "solicitud-fondo" && (
        <div className="max-w-xl mx-auto">
          <h2 className="text-xl font-bold mb-4">Solicitud de Fondo</h2>
          <form>
            {" "}
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col">
                (•) Fecha
                <input
                  type="text"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                  className="border rounded p-2"
                />
              </label>
              <label className="flex flex-col">
                (•) Cliente
                <input
                  type="text"
                  name="cliente"
                  value={formData.cliente}
                  onChange={handleChange}
                  className="border rounded p-2"
                />
              </label>
              <label className="flex flex-col">
                (•) Solicitante de la empresa
                <input
                  type="text"
                  name="solicitanteEmpresa"
                  value={formData.solicitanteEmpresa}
                  onChange={handleChange}
                  className="border rounded p-2"
                />
              </label>
              <label className="flex flex-col">
                (•) Monto
                <input
                  type="text"
                  name="monto"
                  value={formData.monto}
                  onChange={handleChange}
                  className="border rounded p-2"
                />
              </label>
              <label className="flex flex-col">
                (•) Responsable Interno
                <input
                  type="text"
                  name="responsableInterno"
                  value={formData.responsableInterno}
                  onChange={handleChange}
                  className="border rounded p-2"
                />
              </label>
              <label className="flex flex-col">
                (•) Responsable Externo
                <input
                  type="text"
                  name="responsableExterno"
                  value={formData.responsableExterno}
                  onChange={handleChange}
                  className="border rounded p-2"
                />
              </label>
              <label className="flex flex-col col-span-2">
                (•) Concepto
                <textarea
                  name="concepto"
                  value={formData.concepto}
                  onChange={handleChange}
                  className="border rounded p-2"
                  rows={3}
                />
              </label>
              <label className="flex flex-col">
                (•) Indicar a nombre de quién se “emite” Transferencia
                <input
                  type="text"
                  name="emiteTransferencia"
                  value={formData.emiteTransferencia}
                  onChange={handleChange}
                  className="border rounded p-2"
                />
              </label>
              <label className="flex flex-col">
                (•) Indicar si trámite tiene respaldo (boleta)
                <input
                  type="text"
                  name="tramiteRespaldo"
                  value={formData.tramiteRespaldo}
                  onChange={handleChange}
                  className="border rounded p-2"
                />
              </label>

              <h3 className="font-semibold mt-6 mb-2 col-span-2">
                Interno Administración
              </h3>

              <label className="flex flex-col">
                Nº Documento
                <input
                  type="text"
                  name="nDocumento"
                  value={formData.nDocumento}
                  onChange={handleChange}
                  className="border rounded p-2"
                />
              </label>
              <label className="flex flex-col">
                Cta. Cte.
                <input
                  type="text"
                  name="cuentaCorriente"
                  value={formData.cuentaCorriente}
                  onChange={handleChange}
                  className="border rounded p-2"
                />
              </label>
              <label className="flex flex-col">
                Banco
                <input
                  type="text"
                  name="banco"
                  value={formData.banco}
                  onChange={handleChange}
                  className="border rounded p-2"
                />
              </label>
            </div>
            <div className="mt-6">
              <button
                disabled={!isFormValid}
                className={`px-4 py-2 rounded text-white ${
                  isFormValid
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                <PDFDownloadLink
                  document={<SolicitudFondoPDF data={formData} />}
                  fileName="solicitud_fondo.pdf"
                  disabled={!isFormValid || loading}
                  onClick={handleDownloadClick}
                  className={`px-4 py-2 rounded ${
                    !isFormValid || loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {({ loading: pdfLoading }) =>
                    pdfLoading ? "Descargar PDF" : "Descargar PDF"
                  }
                </PDFDownloadLink>
              </button>
            </div>
          </form>
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

export default UserDashboard;
