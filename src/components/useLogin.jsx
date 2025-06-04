/* eslint-disable no-unused-vars */
// src/hooks/useLogin.js
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const useLogin = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;

  const login = async (username, password) => {
    try {
      const res = await axios.post(
        `${API_URL}/login`,
        { username, password },
        { withCredentials: true }
      );

      const role = res.data.role;
      role === "admin" ? navigate("/admin") : navigate("/user");
    } catch (err) {
      setError("Usuario o contraseña incorrectos");
    }
  };

  return { login, error };
};

export default useLogin;
