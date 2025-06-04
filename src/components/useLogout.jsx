// components/useLogout.js
import axios from "axios";

const useLogout = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
      window.location.href = "/";
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  return { logout };
};

export default useLogout;
