/* eslint-disable no-unused-vars */
// src/hooks/useCheckSession.js
import { useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const useCheckSession = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.get("http://localhost:5000/dashboard", {
          withCredentials: true,
        });

        const role = res.data.user.role;
        if (location.pathname === "/") {
          role === "admin" ? navigate("/admin") : navigate("/user");
        }
      } catch (err) {
        // Intentar refrescar token
        try {
          await axios.post(
            "http://localhost:5000/refresh-token",
            {},
            { withCredentials: true }
          );

          const retry = await axios.get("http://localhost:5000/dashboard", {
            withCredentials: true,
          });

          const newRole = retry.data.user.role;
          if (location.pathname === "/") {
            newRole === "admin" ? navigate("/admin") : navigate("/user");
          }
        } catch (refreshErr) {
          if (location.pathname !== "/") navigate("/");
        }
      }
    };

    checkSession();
  }, [location.pathname, navigate]);
};

export default useCheckSession;
