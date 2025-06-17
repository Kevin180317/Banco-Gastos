// src/components/useLogin.js
import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const useLogin = () => {
  const [error, setError] = useState("");
  const [requirePasswordChange, setRequirePasswordChange] = useState(false);
  const [userId, setUserId] = useState(null);

  const login = async (username, password) => {
    setError("");
    try {
      const res = await axios.post(
        `${API_URL}/login`,
        { username, password },
        { withCredentials: true }
      );
      if (res.data.requirePasswordChange) {
        setRequirePasswordChange(true);
        setUserId(res.data.userId);
        return false; // Indica que no se hizo login normal
      }
      // Aquí puedes manejar el login exitoso normalmente (redirigir, guardar usuario, etc.)
      window.location.reload(); // O tu lógica de navegación
      return true;
    } catch (err) {
      setError("Usuario o contraseña incorrectos");
      return false;
    }
  };

  const changePassword = async (newPassword) => {
    setError("");
    try {
      await axios.put(`${API_URL}/users/${userId}/password`, { newPassword });
      setRequirePasswordChange(false);
      setUserId(null);
      // Después de cambiar la contraseña, puedes intentar login de nuevo o redirigir
      return true;
    } catch (err) {
      setError("Error al cambiar la contraseña");
      return false;
    }
  };

  return { login, error, requirePasswordChange, changePassword };
};

export default useLogin;
