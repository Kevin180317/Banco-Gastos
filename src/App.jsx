import useCheckSession from "./components/useCheckSession";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Admin from "./pages/AdminDashboard";
import User from "./pages/UserDashboard";
const App = () => {
  useCheckSession();

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/user" element={<User />} />
    </Routes>
  );
};

export default App;
