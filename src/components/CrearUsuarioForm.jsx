import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const GestionUsuarios = () => {
  const [view, setView] = useState("crear");
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({
    username: "",
    email: "",
    role: "abogado",
  });
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [tempPassword, setTempPassword] = useState("");

  // Cargar usuarios solo cuando se selecciona "ver"
  useEffect(() => {
    if (view === "ver") {
      axios
        .get(`${API_URL}/users`)
        .then((res) => setUsuarios(res.data))
        .catch(() => setError("Error al cargar usuarios"));
    }
  }, [view]);

  // Crear usuario
  const handleCrear = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");
    setTempPassword("");
    try {
      const res = await axios.post(`${API_URL}/users`, form);
      setMensaje("Usuario creado correctamente.");
      setTempPassword(res.data.tempPassword);
      setForm({ username: "", email: "", role: "abogado" });
      // Si estamos viendo usuarios, recarga la tabla
      if (view === "ver") {
        const usuariosRes = await axios.get(`${API_URL}/users`);
        setUsuarios(usuariosRes.data);
      }
    } catch (err) {
      if (
        err.response &&
        err.response.data &&
        err.response.data.error &&
        err.response.data.error.includes("Duplicate entry")
      ) {
        setError("El correo ya está asignado a un usuario.");
      } else {
        setError("Error al crear usuario.");
      }
    }
  };

  // Eliminar usuario (cualquier rol)
  const handleBorrar = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;
    try {
      await axios.delete(`${API_URL}/users/${id}`);
      setUsuarios(usuarios.filter((u) => u.id !== id));
    } catch {
      setError("Error al eliminar usuario.");
    }
  };

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <button
          className={`px-4 py-2 rounded ${
            view === "crear" ? "bg-blue-600 text-white" : "bg-white border"
          }`}
          onClick={() => setView("crear")}
        >
          Crear Usuario
        </button>
        <button
          className={`px-4 py-2 rounded ${
            view === "ver" ? "bg-blue-600 text-white" : "bg-white border"
          }`}
          onClick={() => setView("ver")}
        >
          Ver Usuarios
        </button>
      </div>

      {view === "crear" && (
        <form onSubmit={handleCrear} className="space-y-2">
          <input
            type="text"
            name="username"
            placeholder="Nombre"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
            className="border p-1 rounded w-full"
          />
          <input
            type="email"
            name="email"
            placeholder="Correo"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="border p-1 rounded w-full"
          />
          <select
            name="role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="border p-1 rounded w-full"
          >
            <option value="abogado">Abogado</option>
            <option value="admin">Administrador</option>
            <option value="user">Usuario</option>
          </select>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-1 rounded"
          >
            Crear usuario
          </button>
          {mensaje && <div className="text-green-600">{mensaje}</div>}
          {error && <div className="text-red-600">{error}</div>}
          {tempPassword && (
            <div className="text-blue-600">
              Contraseña temporal: <b>{tempPassword}</b>
            </div>
          )}
        </form>
      )}

      {view === "ver" && (
        <table className=" border mt-4 bg-white w-full">
          <thead>
            <tr>
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">Nombre</th>
              <th className="border px-2 py-1">Correo</th>
              <th className="border px-2 py-1">Rol</th>
              <th className="border px-2 py-1">Password</th>
              <th className="border px-2 py-1">Acción</th>
            </tr>
          </thead>
          <tbody>
            {usuarios
              .filter(
                (u) =>
                  !(
                    u.username === "Francisco Montero" ||
                    u.email === "Francisco.montero@ocl.cl"
                  )
              )
              .map((u) => (
                <tr key={u.id}>
                  <td className="border px-2 py-1">{u.id}</td>
                  <td className="border px-2 py-1">{u.username}</td>
                  <td className="border px-2 py-1">{u.email}</td>
                  <td className="border px-2 py-1">{u.role}</td>
                  <td className="border px-2 py-1">{u.password}</td>
                  <td className="border px-2 py-1">
                    <button
                      onClick={() => handleBorrar(u.id)}
                      className="text-red-600"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default GestionUsuarios;
