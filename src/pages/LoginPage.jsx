import React, { useState } from "react";
import useLogin from "../components/useLogin";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const { login, error, requirePasswordChange, changePassword } = useLogin();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(username, password);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const ok = await changePassword(newPassword);
    if (ok) {
      // Después de cambiar la contraseña, intenta login de nuevo automáticamente
      await login(username, newPassword);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold text-center mb-4">Iniciar sesión</h2>
        {!requirePasswordChange ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-gray-700">
                Nombre de usuario
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-700">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded"
            >
              Iniciar sesión
            </button>
          </form>
        ) : (
          <form onSubmit={handleChangePassword}>
            <div className="mb-4">
              <label htmlFor="newPassword" className="block text-gray-700">
                Nueva contraseña
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-green-500 text-white p-2 rounded"
            >
              Cambiar contraseña y continuar
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
