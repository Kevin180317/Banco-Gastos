import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const NotificacionesRendiciones = () => {
  const [rendicionesPendientes, setRendicionesPendientes] = useState([]);
  const [viaticosPendientes, setViaticosPendientes] = useState([]);
  const [mostrar, setMostrar] = useState(false);
  const [detalle, setDetalle] = useState(null);
  const [motivo, setMotivo] = useState("");

  useEffect(() => {
    axios.get(`${API_URL}/rendiciones-pendientes`).then((res) => {
      setRendicionesPendientes(res.data);
    });
    axios
      .get(`${API_URL}/admin/viaticos?estado=pendiente`, {
        withCredentials: true,
      })
      .then((res) => {
        setViaticosPendientes(res.data);
      });
  }, []);

  const handleAprobar = async (id, tipo) => {
    const endpoint = tipo === "viatico" ? "viaticos" : "rendiciones";
    await axios.put(`${API_URL}/${endpoint}/${id}/aprobar`, null, {
      withCredentials: true,
    });
    if (tipo === "viatico") {
      setViaticosPendientes((prev) => prev.filter((v) => v.id !== id));
    } else {
      setRendicionesPendientes((prev) => prev.filter((r) => r.id !== id));
    }
    setDetalle(null);
  };

  const handleRechazar = async (id, tipo) => {
    const endpoint = tipo === "viatico" ? "viaticos" : "rendiciones";
    await axios.put(`${API_URL}/${endpoint}/${id}/rechazar`, { motivo });
    if (tipo === "viatico") {
      setViaticosPendientes((prev) => prev.filter((v) => v.id !== id));
    } else {
      setRendicionesPendientes((prev) => prev.filter((r) => r.id !== id));
    }
    setDetalle(null);
    setMotivo("");
  };

  const totalPendientes =
    rendicionesPendientes.length + viaticosPendientes.length;

  return (
    <div className="relative">
      <button
        className="relative text-2xl"
        onClick={() => setMostrar((v) => !v)}
        title="Notificaciones pendientes"
      >
        <span role="img" aria-label="campana">
          🔔
        </span>
        {totalPendientes > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full px-2 text-xs">
            {totalPendientes}
          </span>
        )}
      </button>

      {mostrar && (
        <div className="absolute z-10 bg-white border rounded shadow-lg mt-2 w-96 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-bold p-2 border-b">
            Notificaciones Pendientes
          </h3>

          {rendicionesPendientes.map((r) => (
            <div
              key={`rend-${r.id}`}
              className="p-2 border-b cursor-pointer hover:bg-gray-100"
              onClick={() => setDetalle({ ...r, tipo: "rendicion" })}
            >
              <div>
                <b>Cliente:</b> {r.clienteId} | <b>Por:</b> {r.user_username}
              </div>
              <div>
                <b>Total Gastos:</b> ${r.totalGastos}
              </div>
            </div>
          ))}

          {viaticosPendientes.map((v) => (
            <div
              key={`viat-${v.id}`}
              className="p-2 border-b cursor-pointer hover:bg-gray-100"
              onClick={() => setDetalle({ ...v, tipo: "viatico" })}
            >
              <div>
                <b>Viático ID:</b> {v.id} | <b>Por abogado:</b>{" "}
                {v.abogado_username}
              </div>
              <div>
                <b>Total Reembolso:</b> ${v.total_reembolso}
              </div>
            </div>
          ))}

          {totalPendientes === 0 && (
            <div className="p-4">No hay notificaciones pendientes.</div>
          )}
        </div>
      )}

      {detalle && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-20">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-2">
              Detalle de {detalle.tipo === "viatico" ? "Viático" : "Rendición"}
            </h2>

            {/* Detalle de viático */}
            {detalle.tipo === "viatico" ? (
              <>
                <div className="mb-2">
                  <b>ID:</b> {detalle.id}
                </div>
                <div className="mb-2">
                  <b>Socio que autoriza:</b> {detalle.socio_autoriza}
                </div>
                <div className="mb-2">
                  <b>Fecha Solicitud:</b>{" "}
                  {new Date(detalle.fecha_solicitud).toLocaleDateString()}
                </div>
                <div className="mb-2">
                  <b>Total Reembolso:</b> ${detalle.total_reembolso}
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Detalle de Gastos</h4>
                  <div className="space-y-3">
                    {detalle.gastos.map((g, idx) => (
                      <div key={idx} className="border p-3 rounded bg-gray-50">
                        <p>
                          <strong>Fecha Gasto:</strong>{" "}
                          {new Date(g.fechaGasto).toLocaleDateString()}
                        </p>
                        <p>
                          <strong>Trámite:</strong> {g.tramite}
                        </p>
                        <p>
                          <strong>N° Boleta:</strong> {g.numeroBoleta}
                        </p>
                        <p>
                          <strong>Monto:</strong> ${g.monto}
                        </p>
                        <p>
                          <strong>Cliente:</strong> {g.cliente}
                        </p>
                        <p>
                          <strong>Cargo Cliente/OCL:</strong> {g.cargo}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* Detalle de rendición (sin cambios) */
              <>
                <div>
                  <b>ID:</b> {detalle.id}
                </div>
                <div>
                  <b>Cliente:</b> {detalle.clienteId}
                </div>
                <div>
                  <b>Por:</b> {detalle.user_username}
                </div>
                <div>
                  <b>Total Abonos:</b> ${detalle.totalAbonos}
                </div>
                <div>
                  <b>Total Gastos:</b> ${detalle.totalGastos}
                </div>
                <div>
                  <b>Saldo:</b> ${detalle.saldo}
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Detalle de Ingresos</h4>
                  <div className="space-y-3">
                    {detalle.ingresos.map((ing, idx) => (
                      <div key={idx} className="border p-3 rounded bg-gray-50">
                        <p>
                          <strong>Fecha:</strong>{" "}
                          {new Date(ing.fecha).toLocaleDateString()}
                        </p>
                        <p>
                          <strong>Monto:</strong> ${ing.monto}
                        </p>
                        <p>
                          <strong>Detalle:</strong> {ing.detalle}
                        </p>
                        {ing.metodo && (
                          <p>
                            <strong>Método:</strong> {ing.metodo}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Detalle de Gastos</h4>
                  <div className="space-y-3">
                    {detalle.gastos.map((gasto, idx) => (
                      <div key={idx} className="border p-3 rounded bg-gray-50">
                        <p>
                          <strong>Fecha:</strong>{" "}
                          {new Date(gasto.fecha).toLocaleDateString()}
                        </p>
                        <p>
                          <strong>Monto:</strong> ${gasto.monto}
                        </p>
                        <p>
                          <strong>Detalle:</strong> {gasto.detalle}
                        </p>
                        <p>
                          <strong>Trámite:</strong> {gasto.tramite || "N/A"}
                        </p>
                        <p>
                          <strong>N° Boleta:</strong>{" "}
                          {gasto.numero_boleta || "N/A"}
                        </p>
                        {gasto.cliente && (
                          <p>
                            <strong>Cliente:</strong> {gasto.cliente}
                          </p>
                        )}
                        {gasto.cargo && (
                          <p>
                            <strong>Cargo Cliente/OCL:</strong> {gasto.cargo}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-2 mt-4">
              <button
                className="bg-green-600 text-white px-4 py-1 rounded"
                onClick={() => handleAprobar(detalle.id, detalle.tipo)}
              >
                Aprobar
              </button>

              <button
                className="bg-red-600 text-white px-4 py-1 rounded"
                onClick={() => handleRechazar(detalle.id, detalle.tipo)}
              >
                Rechazar
              </button>
              <button
                className="ml-auto text-gray-600"
                onClick={() => setDetalle(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificacionesRendiciones;
