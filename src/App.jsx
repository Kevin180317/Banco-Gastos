import useCheckSession from "./components/useCheckSession";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Admin from "./pages/AdminDashboard";
import User from "./pages/UserDashboard";
import Abogados from "./pages/AbogadosDashboard";
const App = () => {
  useCheckSession();

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/user" element={<User />} />
      <Route path="/abogados" element={<Abogados />} />
      {/* Puedes agregar más rutas según sea necesario */}
    </Routes>
  );
};

export default App;
