// components/useLogout.js
import axios from "axios";

const useLogout = () => {
  const logout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/logout",
        {},
        { withCredentials: true }
      );
      window.location.href = "/";
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  return { logout };
};

export default useLogout;
