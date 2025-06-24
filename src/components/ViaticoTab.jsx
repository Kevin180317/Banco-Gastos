import React, { useState } from "react";
import axios from "axios";

const ViaticosTab = ({ user }) => {
  const [fechaSolicitud, setFechaSolicitud] = useState("");
  const [socioAutoriza, setSocioAutoriza] = useState("");
  const [fechaReembolso, setFechaReembolso] = useState("");
  const [gastos, setGastos] = useState([]);
  const [enviado, setEnviado] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  const agregarGasto = () => {
    setGastos([
      ...gastos,
      {
        fechaGasto: "",
        tramite: "",
        numeroBoleta: "",
        monto: "",
        cliente: "",
        cargo: "",
      },
    ]);
  };

  const eliminarGasto = (index) => {
    const nuevosGastos = gastos.filter((_, i) => i !== index);
    setGastos(nuevosGastos);
  };

  const actualizarGasto = (index, field, value) => {
    const nuevosGastos = [...gastos];
    nuevosGastos[index][field] = value;
    setGastos(nuevosGastos);
  };

  const totalReembolso = gastos.reduce(
    (acc, curr) => acc + Number(curr.monto || 0),
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_URL}/viaticos`,
        {
          fechaSolicitud,
          socioAutoriza,
          fechaReembolso,
          totalReembolso,
          gastos,
        },
        { withCredentials: true }
      );
      setEnviado(true);
      setGastos([]);
      setFechaSolicitud("");
      setSocioAutoriza("");
      setFechaReembolso("");
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
      alert("Error al enviar la solicitud");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded shadow space-y-6 max-w-4xl mx-auto"
    >
      <h2 className="text-2xl font-bold text-center mb-6">
        SOLICITUD REEMBOLSO DE GASTOS
      </h2>

      {enviado && (
        <p className="text-green-600 font-semibold text-center">
          Solicitud enviada con éxito.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="fechaSolicitud" className="block font-medium mb-1">
            Fecha solicitud reembolso
          </label>
          <input
            id="fechaSolicitud"
            type="date"
            value={fechaSolicitud}
            onChange={(e) => setFechaSolicitud(e.target.value)}
            required
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Nombre Abogado</label>
          <input
            type="text"
            value={user.username}
            disabled
            className="border p-2 rounded bg-gray-100 w-full"
          />
        </div>

        <div>
          <label htmlFor="socioAutoriza" className="block font-medium mb-1">
            Socio que autoriza
          </label>
          <input
            id="socioAutoriza"
            type="text"
            value={socioAutoriza}
            onChange={(e) => setSocioAutoriza(e.target.value)}
            required
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label htmlFor="fechaReembolso" className="block font-medium mb-1">
            Fecha Reembolso
          </label>
          <input
            id="fechaReembolso"
            type="date"
            value={fechaReembolso}
            onChange={(e) => setFechaReembolso(e.target.value)}
            required
            className="border p-2 rounded w-full"
          />
        </div>
      </div>

      <hr className="my-6" />

      <h3 className="text-lg font-semibold mb-4">Detalle de gastos</h3>

      {gastos.map((gasto, index) => (
        <div
          key={index}
          className="grid grid-cols-1 sm:grid-cols-6 gap-4 mb-4 items-end border p-4 rounded relative"
        >
          <div>
            <label
              htmlFor={`fechaGasto-${index}`}
              className="block font-medium mb-1"
            >
              Fecha gasto
            </label>
            <input
              id={`fechaGasto-${index}`}
              type="date"
              value={gasto.fechaGasto}
              onChange={(e) =>
                actualizarGasto(index, "fechaGasto", e.target.value)
              }
              className="border p-2 rounded w-full"
              required
            />
          </div>

          <div>
            <label
              htmlFor={`tramite-${index}`}
              className="block font-medium mb-1"
            >
              Trámite
            </label>
            <input
              id={`tramite-${index}`}
              type="text"
              value={gasto.tramite}
              onChange={(e) =>
                actualizarGasto(index, "tramite", e.target.value)
              }
              className="border p-2 rounded w-full"
              required
            />
          </div>

          <div>
            <label
              htmlFor={`numeroBoleta-${index}`}
              className="block font-medium mb-1"
            >
              N° Boleta
            </label>
            <input
              id={`numeroBoleta-${index}`}
              type="text"
              value={gasto.numeroBoleta}
              onChange={(e) =>
                actualizarGasto(index, "numeroBoleta", e.target.value)
              }
              className="border p-2 rounded w-full"
              required
            />
          </div>

          <div>
            <label
              htmlFor={`monto-${index}`}
              className="block font-medium mb-1"
            >
              Monto
            </label>
            <input
              id={`monto-${index}`}
              type="number"
              min="0"
              value={gasto.monto}
              onChange={(e) => actualizarGasto(index, "monto", e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
          </div>

          <div>
            <label
              htmlFor={`cliente-${index}`}
              className="block font-medium mb-1"
            >
              Cliente
            </label>
            <input
              type="text"
              id={`cliente-${index}`}
              value={gasto.cliente}
              onChange={(e) =>
                actualizarGasto(index, "cliente", e.target.value)
              }
              className="border p-2 rounded w-full"
              placeholder="Ingrese cliente"
              required
            />
          </div>

          <div>
            <label
              htmlFor={`cargo-${index}`}
              className="block font-medium mb-1"
            >
              Cargo a
            </label>
            <select
              id={`cargo-${index}`}
              value={gasto.cargo}
              onChange={(e) => actualizarGasto(index, "cargo", e.target.value)}
              className="border p-2 rounded w-full"
              required
            >
              <option value="">Seleccione cargo</option>
              <option value="cliente">Cliente</option>
              <option value="ocl">OCL</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => eliminarGasto(index)}
            className="absolute top-2 right-2 bg-red-600 text-white rounded px-2 py-1 text-sm hover:bg-red-700"
            aria-label={`Eliminar gasto ${index + 1}`}
          >
            X
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={agregarGasto}
        className="bg-blue-600 text-white px-5 py-2 rounded"
      >
        Agregar gasto
      </button>

      <div className="mt-6 text-right font-bold text-lg">
        Total Reembolso: ${totalReembolso.toFixed(2)}
      </div>

      <button
        type="submit"
        className="bg-green-600 text-white px-6 py-3 rounded mt-6 w-full hover:bg-green-700 transition"
      >
        Enviar Solicitud
      </button>
    </form>
  );
};

export default ViaticosTab;
