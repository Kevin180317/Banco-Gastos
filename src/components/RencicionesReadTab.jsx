/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  Font,
} from "@react-pdf/renderer";

// Registrar fuente para caracteres especiales
Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
});

// Estilos para o PDF
const pdfStyles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
    fontFamily: "Helvetica",
  },
  header: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "bold",
  },
  subHeader: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: "center",
    color: "#666666",
  },
  clientInfo: {
    backgroundColor: "#F5F5F5",
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#DDDDDD",
  },
  clientTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
  },
  clientRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  clientLabel: {
    fontSize: 10,
    fontWeight: "bold",
    width: 80,
  },
  clientValue: {
    fontSize: 10,
    flex: 1,
  },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 20,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableColHeader: {
    width: "20%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#F0F0F0",
    padding: 8,
  },
  tableCol: {
    width: "20%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 8,
  },
  tableColWide: {
    width: "40%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 8,
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  tableCell: {
    fontSize: 9,
    textAlign: "left",
  },
  tableCellNumber: {
    fontSize: 9,
    textAlign: "right",
  },
  totalRow: {
    backgroundColor: "#FFF3CD",
  },
  saldoFinal: {
    backgroundColor: "#FFF3CD",
    padding: 10,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#000000",
    marginTop: 10,
  },
  saldoText: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
});

// Componente PDF
const RendicionPDF = ({
  selectedCliente,
  rendicion,
  totalAbonos,
  totalGastos,
  saldo,
  saldoAntes,
  saldoRendicion,
  saldoTotal,
  dineroActual,
}) => {
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("es-ES");
    } catch (e) {
      return dateStr;
    }
  };

  const ingresos = Array.isArray(rendicion.ingresos) ? rendicion.ingresos : [];
  const gastos = Array.isArray(rendicion.gastos) ? rendicion.gastos : [];

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <Image
          src="/logo.png" // Cambia esto por la ruta o URL de tu logo
          style={{ marginBottom: 40 }}
        />
        {/* Header */}
        <Text style={pdfStyles.header}>RENDICIÓN DE GASTOS</Text>
        <Text style={pdfStyles.subHeader}>
          Fecha: {new Date().toLocaleDateString("es-ES")}
        </Text>

        {/* Información del cliente */}
        {selectedCliente && (
          <View style={pdfStyles.clientInfo}>
            <View style={{ flexDirection: "row" }}>
              {/* Primera columna */}

              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={pdfStyles.clientTitle}>
                  Información del Cliente:
                </Text>
                <View style={pdfStyles.clientRow}>
                  <Text style={pdfStyles.clientLabel}>Nombre:</Text>
                  <Text style={pdfStyles.clientValue}>
                    {selectedCliente.nombre}
                  </Text>
                </View>
                <View style={pdfStyles.clientRow}>
                  <Text style={pdfStyles.clientLabel}>RUT:</Text>
                  <Text style={pdfStyles.clientValue}>
                    {selectedCliente.rut}
                  </Text>
                </View>
                <View style={pdfStyles.clientRow}>
                  <Text style={pdfStyles.clientLabel}>Correo:</Text>
                  <Text style={pdfStyles.clientValue}>
                    {selectedCliente.correo}
                  </Text>
                </View>
                <View style={pdfStyles.clientRow}>
                  <Text style={pdfStyles.clientLabel}>Teléfono:</Text>
                  <Text style={pdfStyles.clientValue}>
                    {selectedCliente.telefono}
                  </Text>
                </View>
              </View>
              {/* Segunda columna */}

              <View style={{ flex: 1 }}>
                <Text style={pdfStyles.clientTitle}>
                  Información de la Rendicion:
                </Text>
                <View style={pdfStyles.clientRow}>
                  <Text style={pdfStyles.clientLabel}>
                    Dinero antes de la rendición:
                  </Text>
                  <Text style={pdfStyles.clientValue}>${saldoTotal}</Text>
                </View>
                <View style={pdfStyles.clientRow}>
                  <Text style={pdfStyles.clientLabel}>
                    Total de gastos de la rendición actual:
                  </Text>
                  <Text style={pdfStyles.clientValue}>${saldoRendicion}</Text>
                </View>
                <View style={pdfStyles.clientRow}>
                  <Text style={pdfStyles.clientLabel}>
                    Dinero después de la rendición actual:
                  </Text>
                  <Text style={pdfStyles.clientValue}>${saldoAntes}</Text>
                </View>
                <View style={pdfStyles.clientRow}>
                  <Text style={pdfStyles.clientLabel}>Dinero actual:</Text>
                  <Text style={pdfStyles.clientValue}>${dineroActual}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Tabla de Ingresos */}
        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableRow}>
            <View style={pdfStyles.tableColHeader}>
              <Text style={pdfStyles.tableCellHeader}>INGRESO</Text>
            </View>
            <View style={pdfStyles.tableColWide}>
              <Text style={pdfStyles.tableCellHeader}>DETALLE</Text>
            </View>
            <View style={pdfStyles.tableColHeader}>
              <Text style={pdfStyles.tableCellHeader}>FECHA</Text>
            </View>
            <View style={pdfStyles.tableColHeader}>
              <Text style={pdfStyles.tableCellHeader}>MONTO</Text>
            </View>
          </View>

          {ingresos.map((ingreso, index) => (
            <View style={pdfStyles.tableRow} key={index}>
              <View style={pdfStyles.tableCol}>
                <Text style={pdfStyles.tableCell}>{ingreso.tipo || ""}</Text>
              </View>
              <View style={pdfStyles.tableColWide}>
                <Text style={pdfStyles.tableCell}>{ingreso.detalle || ""}</Text>
              </View>
              <View style={pdfStyles.tableCol}>
                <Text style={pdfStyles.tableCell}>
                  {formatDateForDisplay(ingreso.fecha)}
                </Text>
              </View>
              <View style={pdfStyles.tableCol}>
                <Text style={pdfStyles.tableCellNumber}>
                  ${ingreso.monto || 0}
                </Text>
              </View>
            </View>
          ))}

          <View style={[pdfStyles.tableRow, pdfStyles.totalRow]}>
            <View style={pdfStyles.tableCol}>
              <Text style={pdfStyles.tableCellHeader}></Text>
            </View>
            <View style={pdfStyles.tableColWide}>
              <Text style={pdfStyles.tableCellHeader}></Text>
            </View>
            <View style={pdfStyles.tableCol}>
              <Text style={pdfStyles.tableCellHeader}>Total abonos</Text>
            </View>
            <View style={pdfStyles.tableCol}>
              <Text style={pdfStyles.tableCellHeader}>${totalAbonos}</Text>
            </View>
          </View>
        </View>

        {/* Tabla de Gastos */}
        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableRow}>
            <View style={pdfStyles.tableColHeader}>
              <Text style={pdfStyles.tableCellHeader}>GASTO</Text>
            </View>
            <View style={pdfStyles.tableColHeader}>
              <Text style={pdfStyles.tableCellHeader}>DETALLE</Text>
            </View>
            <View style={pdfStyles.tableColHeader}>
              <Text style={pdfStyles.tableCellHeader}>FECHA</Text>
            </View>
            <View style={pdfStyles.tableColHeader}>
              <Text style={pdfStyles.tableCellHeader}>BOLETA</Text>
            </View>
            <View style={pdfStyles.tableColHeader}>
              <Text style={pdfStyles.tableCellHeader}>MONTO</Text>
            </View>
          </View>

          {gastos.map((gasto, index) => (
            <View style={pdfStyles.tableRow} key={index}>
              <View style={pdfStyles.tableCol}>
                <Text style={pdfStyles.tableCell}>{gasto.tipo || ""}</Text>
              </View>
              <View style={pdfStyles.tableCol}>
                <Text style={pdfStyles.tableCell}>{gasto.detalle || ""}</Text>
              </View>
              <View style={pdfStyles.tableCol}>
                <Text style={pdfStyles.tableCell}>
                  {formatDateForDisplay(gasto.fecha)}
                </Text>
              </View>
              <View style={pdfStyles.tableCol}>
                <Text style={pdfStyles.tableCell}>{gasto.boleta || ""}</Text>
              </View>
              <View style={pdfStyles.tableCol}>
                <Text style={pdfStyles.tableCellNumber}>
                  ${gasto.monto || 0}
                </Text>
              </View>
            </View>
          ))}

          <View style={[pdfStyles.tableRow, pdfStyles.totalRow]}>
            <View style={pdfStyles.tableCol}>
              <Text style={pdfStyles.tableCellHeader}></Text>
            </View>
            <View style={pdfStyles.tableCol}>
              <Text style={pdfStyles.tableCellHeader}></Text>
            </View>
            <View style={pdfStyles.tableCol}>
              <Text style={pdfStyles.tableCellHeader}></Text>
            </View>
            <View style={pdfStyles.tableCol}>
              <Text style={pdfStyles.tableCellHeader}>Total gastos</Text>
            </View>
            <View style={pdfStyles.tableCol}>
              <Text style={pdfStyles.tableCellHeader}>${totalGastos}</Text>
            </View>
          </View>

          <View style={[pdfStyles.tableRow, pdfStyles.totalRow]}>
            <View style={pdfStyles.tableCol}>
              <Text style={pdfStyles.tableCellHeader}></Text>
            </View>
            <View style={pdfStyles.tableCol}>
              <Text style={pdfStyles.tableCellHeader}></Text>
            </View>
            <View style={pdfStyles.tableCol}>
              <Text style={pdfStyles.tableCellHeader}></Text>
            </View>
            <View style={pdfStyles.tableCol}>
              <Text style={pdfStyles.tableCellHeader}>Saldo</Text>
            </View>
            <View style={pdfStyles.tableCol}>
              <Text style={pdfStyles.tableCellHeader}>${saldo}</Text>
            </View>
          </View>
        </View>

        {/* Saldo Final */}
        <View style={pdfStyles.saldoFinal}>
          <Text style={pdfStyles.saldoText}>
            Saldo a favor o pagar cliente:{" "}
            {saldo > 0
              ? `A favor del cliente: $${saldo}`
              : saldo < 0
              ? `A pagar por el cliente: $${Math.abs(saldo)}`
              : "$0"}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

const RendicionesTab = ({ clientes }) => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [saldos, setSaldos] = useState({});

  const [selectedCliente, setSelectedCliente] = useState(null);
  const [rendicion, setRendicion] = useState({
    ingresos: [{ tipo: "", detalle: "", monto: "", fecha: "" }],
    gastos: [{ detalle: "", fecha: "", boleta: "", monto: "" }],
  });
  const [totalAbonos, setTotalAbonos] = useState(0);
  const [totalGastos, setTotalGastos] = useState(0);
  const [saldo, setSaldo] = useState(0);
  const [isEditing, setIsEditing] = useState(true);
  const [historial, setHistorial] = useState([]);
  const [showHistorial, setShowHistorial] = useState(false);
  const [selectedRendicion, setSelectedRendicion] = useState(null);

  const printRef = useRef();

  // Update totals when rendicion changes
  useEffect(() => {
    const calculatedTotalAbonos = rendicion.ingresos.reduce(
      (sum, item) => sum + (parseFloat(item.monto) || 0),
      0
    );

    const calculatedTotalGastos = rendicion.gastos.reduce(
      (sum, item) => sum + (parseFloat(item.monto) || 0),
      0
    );

    setTotalAbonos(calculatedTotalAbonos);
    setTotalGastos(calculatedTotalGastos);
    setSaldo(calculatedTotalAbonos - calculatedTotalGastos);
  }, [rendicion]);

  // Cargar historial de rendiciones al montar
  useEffect(() => {
    if (showHistorial) {
      axios
        .get(`${API_URL}/rendiciones`, { withCredentials: true })
        .then((res) => setHistorial(res.data))
        .catch(() => setHistorial([]));
    }
  }, [showHistorial]);

  // Handle changes to ingreso items
  const handleIngresoChange = (index, field, value) => {
    const updatedIngresos = [...rendicion.ingresos];
    updatedIngresos[index][field] = value;
    setRendicion({ ...rendicion, ingresos: updatedIngresos });
  };

  // Handle changes to gasto items
  const handleGastoChange = (index, field, value) => {
    const updatedGastos = [...rendicion.gastos];
    updatedGastos[index][field] = value;
    setRendicion({ ...rendicion, gastos: updatedGastos });
  };

  // Add a new ingreso row
  const addIngreso = () => {
    setRendicion({
      ...rendicion,
      ingresos: [...rendicion.ingresos, { detalle: "", monto: "", fecha: "" }],
    });
  };

  // Add a new gasto row
  const addGasto = () => {
    setRendicion({
      ...rendicion,
      gastos: [
        ...rendicion.gastos,
        { detalle: "", fecha: "", boleta: "", monto: "" },
      ],
    });
  };

  // Remove an ingreso row
  const removeIngreso = (index) => {
    if (rendicion.ingresos.length > 1) {
      const updatedIngresos = rendicion.ingresos.filter((_, i) => i !== index);
      setRendicion({ ...rendicion, ingresos: updatedIngresos });
    }
  };

  // Remove a gasto row
  const removeGasto = (index) => {
    const updatedGastos = rendicion.gastos.filter((_, i) => i !== index);
    setRendicion({ ...rendicion, gastos: updatedGastos });
  };

  // Validar que todos los campos de ingresos y gastos estén completos
  const isRendicionValida = () => {
    // Validar ingresos
    for (const ingreso of rendicion.ingresos) {
      if (
        !ingreso.tipo ||
        !ingreso.detalle ||
        !ingreso.fecha ||
        !ingreso.monto
      ) {
        return false;
      }
    }
    // Validar gastos
    for (const gasto of rendicion.gastos) {
      if (
        !gasto.tipo ||
        !gasto.detalle ||
        !gasto.fecha ||
        !gasto.boleta ||
        !gasto.monto
      ) {
        return false;
      }
    }
    // Validar cliente seleccionado
    if (!selectedCliente) return false;
    return true;
  };

  // Save the rendicion
  const handleSave = async () => {
    if (!isRendicionValida()) {
      alert(
        "Por favor, complete todos los campos de ingresos y gastos antes de guardar."
      );
      return;
    }
    setIsEditing(false);

    try {
      if (selectedRendicion && selectedRendicion.id) {
        // Actualizar rendición existente
        await axios.put(
          `${API_URL}/rendiciones/${selectedRendicion.id}`,
          {
            clienteId: selectedCliente.id,
            rendicion: rendicion,
            totalAbonos,
            totalGastos,
            saldo,
          },
          { withCredentials: true }
        );
        alert("Rendición actualizada correctamente");
      } else {
        // Crear nueva rendición
        await axios.post(
          `${API_URL}/rendiciones`,
          {
            clienteId: selectedCliente.id,
            rendicion: rendicion,
            totalAbonos,
            totalGastos,
            saldo,
          },
          { withCredentials: true }
        );
        alert("Rendición guardada correctamente");
      }
    } catch (error) {
      console.error("Error al guardar rendición", error);
      alert("Error al guardar la rendición");
    }
  };

  // Print the rendicion (solo el contenido)
  const handlePrint = () => {
    const printContent = printRef.current;
    const originalContent = document.body.innerHTML;
    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <html>
        <head>
          <title>Rendición de Gastos</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            th { background-color: #f0f0f0; font-weight: bold; }
            .header { margin-bottom: 20px; }
            .client-info { background-color: #f9f9f9; padding: 15px; margin-bottom: 20px; border: 1px solid #ddd; }
            .totals { font-weight: bold; }
            .saldo-final { background-color: #fff3cd; font-weight: bold; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  // Generate Excel
  const handleGenerateExcel = () => {
    if (!selectedCliente) {
      alert("Debe seleccionar un cliente primero");
      return;
    }

    try {
      // Crear contenido CSV
      let csvContent = "data:text/csv;charset=utf-8,";

      // Información del cliente
      csvContent += "RENDICIÓN DE GASTOS\n";
      csvContent += `Cliente: ${selectedCliente.nombre}\n`;
      csvContent += `RUT: ${selectedCliente.rut}\n`;
      csvContent += `Correo: ${selectedCliente.correo}\n`;
      csvContent += `Teléfono: ${selectedCliente.telefono}\n\n`;

      // Tabla de ingresos
      csvContent += "INGRESOS\n";
      csvContent += "Tipo,Detalle,Fecha,Monto\n";
      rendicion.ingresos.forEach((ingreso, index) => {
        const tipo = index === 0 ? "Fondos por rendir" : ingreso.tipo || "";
        csvContent += `"${tipo}","${ingreso.detalle || ""}","${
          ingreso.fecha || ""
        }","${ingreso.monto || ""}"\n`;
      });
      csvContent += `,,Total Abonos,${totalAbonos}\n\n`;

      // Tabla de gastos
      csvContent += "GASTOS\n";
      csvContent += "Tipo,Detalle,Fecha,Boleta,Monto\n";
      rendicion.gastos.forEach((gasto) => {
        csvContent += `"${gasto.tipo || ""}","${gasto.detalle || ""}","${
          gasto.fecha || ""
        }","${gasto.boleta || ""}","${gasto.monto || ""}"\n`;
      });
      csvContent += `,,,Total Gastos,${totalGastos}\n`;
      csvContent += `,,,Saldo,${saldo}\n\n`;

      // Saldo final
      const saldoTexto =
        saldo > 0
          ? `A favor del cliente: $${saldo}`
          : saldo < 0
          ? `A pagar por el cliente: $${Math.abs(saldo)}`
          : "$0";
      csvContent += `Saldo a favor o pagar cliente,"${saldoTexto}"\n`;

      // Crear y descargar archivo
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `rendicion_${selectedCliente.nombre}_${
          new Date().toISOString().split("T")[0]
        }.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error al generar Excel:", error);
      alert("Error al generar el archivo Excel");
    }
  };

  // Create a new rendicion
  const handleNew = () => {
    setSelectedCliente(null);
    setRendicion({
      ingresos: [{ detalle: "Provisión de fondos", monto: "", fecha: "" }],
      gastos: [{ detalle: "", fecha: "", boleta: "", monto: "" }],
    });
    setIsEditing(true);
    setSelectedRendicion(null);
  };

  // Edit the current rendicion
  const handleEdit = () => {
    setIsEditing(true);
  };

  // Cuando seleccionas una rendición pasada, la cargas en modo solo lectura
  const handleVerRendicion = (rend) => {
    // Busca el cliente por ID, aunque sea en modo readOnly
    const cliente = clientes.find(
      (c) => String(c.id) === String(rend.clienteId)
    );
    setSelectedCliente(cliente || null);
    // Asegura que rend.rendicion exista y tenga ingresos/gastos
    let newRendicion = rend.rendicion
      ? rend.rendicion
      : { ingresos: rend.ingresos || [], gastos: rend.gastos || [] };
    // Si por alguna razón no tiene ingresos/gastos, inicializa vacío
    if (!Array.isArray(newRendicion.ingresos)) newRendicion.ingresos = [];
    if (!Array.isArray(newRendicion.gastos)) newRendicion.gastos = [];
    setRendicion(newRendicion);
    setIsEditing(false);
    setSelectedRendicion(rend);
    setShowHistorial(false);
  };

  // Eliminar una rendición del historial
  const handleEliminarRendicion = async (rendId) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta rendición?")) return;
    try {
      await axios.delete(`${API_URL}/rendiciones/${rendId}`, {
        withCredentials: true,
      });
      setHistorial((prev) => prev.filter((r) => r.id !== rendId));
      // Si la rendición eliminada es la seleccionada, limpia la selección
      if (selectedRendicion && selectedRendicion.id === rendId) {
        setSelectedCliente(null);
        setRendicion({
          ingresos: [{ detalle: "Provisión de fondos", monto: "", fecha: "" }],
          gastos: [{ detalle: "", fecha: "", boleta: "", monto: "" }],
        });
        setIsEditing(true);
        setSelectedRendicion(null);
      }
    } catch (error) {
      alert("Error al eliminar la rendición");
    }
  };

  // Format date for input field
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";

    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;

      return date.toISOString().split("T")[0];
    } catch (e) {
      return dateStr;
    }
  };

  // Format date for display
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("es-ES");
    } catch (e) {
      return dateStr;
    }
  };

  // Validación defensiva antes de renderizar tablas
  const ingresos = Array.isArray(rendicion.ingresos) ? rendicion.ingresos : [];
  const gastos = Array.isArray(rendicion.gastos) ? rendicion.gastos : [];

  useEffect(() => {
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
  }, []);

  return (
    <div className="space-y-6">
      {/* Botones de acción - NO se imprimen */}
      <div className="flex justify-between items-center no-print">
        <h2 className="text-xl font-bold">Rendición de Gastos</h2>
        <div className="space-x-2">
          <button
            onClick={() => setShowHistorial((v) => !v)}
            className="bg-gray-500 text-white px-3 py-1 rounded"
          >
            {showHistorial ? "Ocultar Historial" : "Ver Historial"}
          </button>
        </div>
      </div>

      {/* Historial de rendiciones */}
      {showHistorial && (
        <div className="bg-gray-50 border rounded p-4 mb-4">
          <h3 className="font-bold mb-2">Historial de Rendiciones Guardadas</h3>
          {historial.length === 0 ? (
            <p className="text-gray-500">No hay rendiciones guardadas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border mb-2">
                <thead>
                  <tr className="bg-yellow-100">
                    <th className="border px-2 py-1">Cliente</th>
                    <th className="border px-2 py-1">Fecha</th>
                    <th className="border px-2 py-1">Total Abonos</th>
                    <th className="border px-2 py-1">Total Gastos</th>
                    <th className="border px-2 py-1">Saldo</th>
                    <th className="border px-2 py-1">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((rend) => {
                    const cliente = clientes.find(
                      (c) => c.id === rend.clienteId
                    );
                    return (
                      <tr key={rend.id}>
                        <td className="border px-2 py-1">
                          {cliente ? cliente.nombre : "Cliente eliminado"}
                        </td>
                        <td className="border px-2 py-1">
                          {rend.createdAt
                            ? new Date(rend.createdAt).toLocaleDateString(
                                "es-ES"
                              )
                            : ""}
                        </td>
                        <td className="border px-2 py-1">
                          ${rend.totalAbonos}
                        </td>
                        <td className="border px-2 py-1">
                          ${rend.totalGastos}
                        </td>
                        <td className="border px-2 py-1">${rend.saldo}</td>
                        <td className="border px-2 py-1 flex gap-2">
                          <button
                            className="text-blue-600 underline"
                            onClick={() => handleVerRendicion(rend)}
                          >
                            Ver
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Contenido para imprimir */}
      <div ref={printRef}>
        <div className="header text-center mb-6">
          <h1 className="text-2xl font-bold">RENDICIÓN DE GASTOS</h1>
          <p className="text-gray-600 mt-2">
            Fecha: {new Date().toLocaleDateString("es-ES")}
          </p>
        </div>

        {/* Información del cliente - SÍ se imprime */}
        {selectedCliente && (
          <div className="client-info mb-6">
            <h3 className="font-bold text-lg mb-3">Información del Cliente:</h3>
            <div className="grid grid-cols-2 gap-4">
              <p>
                <strong>Nombre:</strong> {selectedCliente.nombre}
              </p>
              <p>
                <strong>RUT:</strong> {selectedCliente.rut}
              </p>
              <p>
                <strong>Correo:</strong> {selectedCliente.correo}
              </p>
              <p>
                <strong>Teléfono:</strong> {selectedCliente.telefono}
              </p>
              <p>
                <strong>Cantidad de dinero:</strong> {selectedCliente.dinero}
              </p>
              <p>
                <strong>Cantidad después de la rendición actual:</strong>{" "}
                {selectedCliente && totalGastos !== undefined
                  ? Number(selectedCliente.dinero) - Number(totalGastos)
                  : "-"}
              </p>
              <p>
                <strong>
                  Cantidad actual después del total de rendiciones:
                </strong>{" "}
                {saldos[selectedCliente.id] === undefined ||
                saldos[selectedCliente.id] === null ? (
                  <span className="text-gray-500">
                    El cliente no tiene rendiciones
                  </span>
                ) : (
                  <span
                    className={`font-semibold ${
                      saldos[selectedCliente.id] >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    ${saldos[selectedCliente.id]}
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Tablas de rendición SOLO LECTURA */}
        <div className="overflow-x-auto">
          {/* Tabla de ingresos */}
          <table className="min-w-full mb-4 border">
            <thead>
              <tr className="bg-yellow-100">
                <th className="border px-4 py-2 text-center w-1/4">INGRESO</th>
                <th className="border px-4 py-2 text-center w-1/2">DETALLE</th>
                <th className="border px-4 py-2 text-center w-1/8">FECHA</th>
                <th className="border px-4 py-2 text-center w-1/8">MONTO</th>
              </tr>
            </thead>
            <tbody>
              {ingresos.map((ingreso, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">{ingreso.tipo || ""}</td>
                  <td className="border px-4 py-2">{ingreso.detalle || ""}</td>
                  <td className="border px-4 py-2">
                    {formatDateForDisplay(ingreso.fecha)}
                  </td>
                  <td className="border px-4 py-2">${ingreso.monto || 0}</td>
                </tr>
              ))}
              <tr className="bg-yellow-100 totals">
                <td
                  colSpan="3"
                  className="border px-4 py-2 text-right font-bold"
                >
                  Total abonos
                </td>
                <td className="border px-4 py-2 font-bold">${totalAbonos}</td>
              </tr>
            </tbody>
          </table>

          {/* Tabla de gastos */}
          <table className="min-w-full mb-4 border">
            <thead>
              <tr className="bg-yellow-100">
                <th className="border px-4 py-2 text-center w-1/4">GASTO</th>
                <th className="border px-4 py-2 text-center w-1/3">DETALLE</th>
                <th className="border px-4 py-2 text-center w-1/8">FECHA</th>
                <th className="border px-4 py-2 text-center w-1/8">BOLETA</th>
                <th className="border px-4 py-2 text-center w-1/8">MONTO</th>
              </tr>
            </thead>
            <tbody>
              {gastos.map((gasto, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">{gasto.tipo || ""}</td>
                  <td className="border px-4 py-2">{gasto.detalle || ""}</td>
                  <td className="border px-4 py-2">
                    {formatDateForDisplay(gasto.fecha)}
                  </td>
                  <td className="border px-4 py-2">{gasto.boleta || ""}</td>
                  <td className="border px-4 py-2">${gasto.monto || 0}</td>
                </tr>
              ))}
              <tr className="bg-yellow-100 totals">
                <td
                  colSpan="4"
                  className="border px-4 py-2 text-right font-bold"
                >
                  Total gastos
                </td>
                <td className="border px-4 py-2 font-bold">${totalGastos}</td>
              </tr>
              <tr className="bg-yellow-100 totals">
                <td
                  colSpan="4"
                  className="border px-4 py-2 text-right font-bold"
                >
                  Saldo
                </td>
                <td className="border px-4 py-2 font-bold">${saldo}</td>
              </tr>
            </tbody>
          </table>

          {/* Saldo final */}
          <table className="min-w-full mb-4 border">
            <tbody>
              <tr className="saldo-final">
                <td className="border px-4 py-2 text-center font-bold w-1/2">
                  {(saldos[selectedCliente?.id] || 0) - totalGastos >= 0
                    ? "Saldo a favor después de la rendición"
                    : "Saldo en contra después de la rendición"}
                </td>
                <td className="border px-4 py-2 w-1/2 font-bold">
                  {selectedCliente?.id === undefined ||
                  saldos[selectedCliente?.id] === undefined ||
                  saldos[selectedCliente?.id] === null ? (
                    <span className="text-gray-500">
                      El cliente no tiene rendiciones
                    </span>
                  ) : (
                    <span
                      className={`font-semibold ${
                        saldos[selectedCliente?.id] >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      ${saldos[selectedCliente?.id]}
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* CSS para impresión */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }

          body * {
            visibility: hidden;
          }

          .print-area,
          .print-area * {
            visibility: visible;
          }

          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }

          table {
            page-break-inside: auto;
          }

          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default RendicionesTab;
