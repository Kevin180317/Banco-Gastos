import React, { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const CrearUsuarioForm = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    role: "abogado",
  });
  const [mensaje, setMensaje] = useState("");
  const [tempPassword, setTempPassword] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setTempPassword("");
    try {
      const res = await axios.post(`${API_URL}/users`, form);
      setMensaje("Usuario creado correctamente.");
      setTempPassword(res.data.tempPassword);
      setForm({ username: "", email: "", role: "abogado" });
    } catch (err) {
      setMensaje("Error al crear usuario.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        type="text"
        name="username"
        placeholder="Nombre"
        value={form.username}
        onChange={handleChange}
        required
        className="border p-1 rounded w-full"
      />
      <input
        type="email"
        name="email"
        placeholder="Correo"
        value={form.email}
        onChange={handleChange}
        required
        className="border p-1 rounded w-full"
      />
      <select
        name="role"
        value={form.role}
        onChange={handleChange}
        className="border p-1 rounded w-full"
        disabled
      >
        <option value="abogado">Abogado</option>
      </select>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-1 rounded"
      >
        Crear usuario
      </button>
      {mensaje && <div className="text-green-600">{mensaje}</div>}
      {tempPassword && (
        <div className="text-blue-600">
          Contraseña temporal: <b>{tempPassword}</b>
        </div>
      )}
    </form>
  );
};

export default CrearUsuarioForm;
