import React, { useEffect, useState } from "react";
import axios from "axios";

const MisViativosPorEstado = ({ estadoFiltro = null }) => {
  const [viaticos, setViaticos] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchViaticos = async () => {
      try {
        const res = await axios.get(`${API_URL}/viaticos`, {
          withCredentials: true,
        });
        let filtrados = res.data;
        if (estadoFiltro) {
          filtrados = filtrados.filter((v) => v.estado === estadoFiltro);
        }
        setViaticos(filtrados);
      } catch (err) {
        console.error("Error al obtener viáticos", err);
      } finally {
        setLoading(false);
      }
    };
    fetchViaticos();
  }, [estadoFiltro]);

  if (loading) return <p className="text-center">Cargando viáticos...</p>;
  if (viaticos.length === 0)
    return <p className="text-center">No hay viáticos para mostrar.</p>;

  return (
    <div className="space-y-8">
      {viaticos.map((v) => (
        <div
          key={v.id}
          className="border p-6 rounded shadow bg-white max-w-3xl mx-auto"
        >
          <h3 className="text-xl font-bold mb-4">Viático #{v.id}</h3>

          <div className="mb-3">
            <span className="font-semibold mr-2">Estado:</span>
            <span
              className={`inline-block px-3 py-1 rounded text-white text-sm ${
                v.estado === "aprobada"
                  ? "bg-green-600"
                  : v.estado === "rechazada"
                  ? "bg-red-600"
                  : "bg-yellow-500"
              }`}
            >
              {v.estado.toUpperCase()}
            </span>
          </div>

          <p>
            <strong>Fecha de Solicitud:</strong>{" "}
            {new Date(v.fecha_solicitud).toLocaleDateString("es-CL")}
          </p>
          <p>
            <strong>Fecha de Reembolso:</strong>{" "}
            {v.fecha_reembolso
              ? new Date(v.fecha_reembolso).toLocaleDateString("es-CL")
              : "No asignada"}
          </p>
          <p>
            <strong>Socio que autoriza:</strong>{" "}
            {v.socio_autoriza || "No asignado"}
          </p>
          <p>
            <strong>Total a reembolsar:</strong>{" "}
            <span className="font-bold">
              $ ${Number(v.total_reembolso || 0).toFixed(2)}
            </span>
          </p>

          {v.estado === "rechazada" && v.motivo_rechazo && (
            <p className="text-red-700 mt-2">
              <strong>Motivo de rechazo:</strong> {v.motivo_rechazo}
            </p>
          )}

          <div className="mt-5">
            <h4 className="font-semibold mb-2 text-lg">Detalle de Gastos:</h4>
            {v.gastos.length === 0 ? (
              <p className="italic text-gray-500">No hay gastos registrados.</p>
            ) : (
              <ul className="list-disc list-inside space-y-1">
                {v.gastos.map((g, idx) => (
                  <li key={idx}>
                    <strong>Fecha:</strong>{" "}
                    {g.fechaGasto
                      ? new Date(g.fechaGasto).toLocaleDateString("es-CL")
                      : "Sin fecha"}{" "}
                    | <strong>Trámite:</strong> {g.tramite || "-"} |{" "}
                    <strong>N° Boleta:</strong> {g.numeroBoleta || "-"} |{" "}
                    <strong>Monto:</strong> ${Number(g.monto).toFixed(2)} |{" "}
                    <strong>Cliente:</strong> {g.cliente || "-"} |{" "}
                    <strong>Cargo a:</strong> {g.cargo || "-"}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MisViativosPorEstado;
