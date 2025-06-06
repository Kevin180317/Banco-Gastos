/* eslint-disable no-unused-vars */

import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const useAuth = (requiredRole) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const validateSession = async () => {
      try {
        const response = await axios.get(`${API_URL}/dashboard`, {
          withCredentials: true,
        });

        if (requiredRole && response.data.user.role !== requiredRole) {
          navigate("/"); // Redirigir si no cumple el rol
        } else {
          setUser(response.data.user);
        }
      } catch (error) {
        navigate("/"); // Redirigir si no hay sesión
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, [navigate, requiredRole]);

  return { user, loading };
};

export default useAuth;
