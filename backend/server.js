import express from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cors from "cors";
import mysql2 from "mysql2";
const app = express();
const PORT = 5000;

// Configuración de CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT"], // Agrega "PUT" aquí
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(cookieParser());

// Usuarios predefinidos (nombre de usuario, contraseña en texto plano, rol)
const users = [
  {
    username: "Francisco Montero",
    email: "Francisco.montero@ocl.cl",
    password: "Francisco5420@",
    role: "admin",
  },
  {
    username: "Isabel Quiroz",
    email: "Isabel.quiroz@ocl.cl",
    password: "Isabelquiroz5420@",
    role: "admin",
  },
  {
    username: "Claudia Soto",
    email: "Claudia.soto@ocl.cl",
    password: "Claudia123",
    role: "user",
  },
  {
    username: "Valentina Robles",
    email: "Valentina.robles@ocl.cl",
    password: "Valentina123",
    role: "user",
  },
];

const connnection = mysql2.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "banco_gastos",
  port: 3306,
});

app.get("/clientes", (req, res) => {
  connnection.query("SELECT * FROM clientes", (err, results) => {
    if (err) {
      console.error("Error al obtener los clientes:", err);
      return res.status(500).json({ error: "Error al obtener los clientes" });
    }
    res.json(results);
  });
});

app.post("/clientes", (req, res) => {
  const { nombre, rut, correo, telefono, direccion, giro, dinero } = req.body;
  if (!nombre || !rut || !correo || !telefono) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }
  const dineroValue =
    dinero !== undefined && dinero !== null && dinero !== ""
      ? Number(dinero)
      : 0;
  const sql =
    "INSERT INTO clientes (nombre, rut, correo, telefono, direccion, giro, dinero) VALUES (?, ?, ?, ?, ?, ?, ?)";
  connnection.query(
    sql,
    [
      nombre,
      rut,
      correo,
      telefono,
      direccion !== undefined && direccion !== null ? direccion : "",
      giro !== undefined && giro !== null ? giro : "",
      dineroValue,
    ],
    (err, result) => {
      if (err) {
        console.error("Error al agregar cliente:", err);
        return res.status(500).json({ error: "Error al agregar cliente" });
      }
      res.status(201).json({
        message: "Cliente agregado correctamente",
        id: result.insertId,
      });
    }
  );
});

app.put("/clientes/:id", (req, res) => {
  const { id } = req.params;
  const { nombre, rut, correo, telefono, direccion, giro, dinero } = req.body;
  if (!nombre || !rut || !correo || !telefono) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }
  const dineroValue =
    dinero !== undefined && dinero !== null && dinero !== ""
      ? Number(dinero)
      : 0;
  const sql =
    "UPDATE clientes SET nombre = ?, rut = ?, correo = ?, telefono = ?, direccion = ?, giro = ?, dinero = ? WHERE id = ?";
  connnection.query(
    sql,
    [
      nombre,
      rut,
      correo,
      telefono,
      direccion !== undefined && direccion !== null ? direccion : "",
      giro !== undefined && giro !== null ? giro : "",
      dineroValue,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error("Error al actualizar cliente:", err);
        return res.status(500).json({ error: "Error al actualizar cliente" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Cliente no encontrado" });
      }
      res.json({ message: "Cliente actualizado correctamente" });
    }
  );
});

// Ruta de login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Buscar el usuario en el arreglo
  const user = users.find(
    (u) => u.username === username || u.email === username
  );
  if (!user) return res.status(400).json({ message: "Usuario no encontrado" });

  // Verificar la contraseña
  if (user.password !== password) {
    return res.status(400).json({ message: "Contraseña incorrecta" });
  }

  // Crear el JWT (Access Token)
  const accessToken = jwt.sign(
    { username: user.username, role: user.role },
    "mi_secreto", // Aquí está el secreto fijo
    { expiresIn: "1h" } // El access token caduca en 1 hora
  );

  // Crear el Refresh Token
  const refreshToken = jwt.sign(
    { username: user.username, role: user.role },
    "mi_secreto_refresh", // Un secreto diferente para el refresh token
    { expiresIn: "7d" } // El refresh token caduca en 7 días
  );

  // Guardar el refresh token en las cookies
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: false, // Esto debería ser true en producción si usas HTTPS
    maxAge: 604800000, // 7 días
  });

  // Guardar el access token en las cookies
  res.cookie("token", accessToken, {
    httpOnly: true,
    secure: false, // Esto debería ser true en producción si usas HTTPS
    maxAge: 3600000, // 1 hora
  });

  // Redirigir al usuario según el rol
  if (user.role === "admin") {
    res.json({ message: "Bienvenido, administrador!", role: "admin" });
  } else {
    res.json({ message: "Bienvenido, usuario!", role: "user" });
  }
});

// Ruta protegida (requiere autenticación)
app.get("/dashboard", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(403).json({ message: "Acceso denegado" });

  jwt.verify(token, "mi_secreto", (err, decoded) => {
    if (err) {
      // Si el token está expirado, podemos devolver un error para que el cliente haga un request de refresh token
      return res.status(403).json({ message: "Token expirado" });
    }

    res.json({ message: "Acceso permitido", user: decoded });
  });
});

// Ruta para obtener un nuevo Access Token usando el Refresh Token
app.post("/refresh-token", (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  if (!refreshToken)
    return res.status(403).json({ message: "Acceso denegado" });

  jwt.verify(refreshToken, "mi_secreto_refresh", (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token inválido" });

    // Crear un nuevo Access Token
    const accessToken = jwt.sign(
      { username: decoded.username, role: decoded.role },
      "mi_secreto", // Aquí está el secreto fijo
      { expiresIn: "1h" } // El nuevo access token caduca en 1 hora
    );

    // Enviar el nuevo Access Token
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: false, // Esto debería ser true en producción si usas HTTPS
      maxAge: 3600000, // 1 hora
    });

    res.json({ message: "Nuevo token generado" });
  });
});

// Ruta de logout
app.post("/logout", (req, res) => {
  res.clearCookie("token"); // Eliminar la cookie del token
  res.clearCookie("refresh_token"); // Eliminar la cookie del refresh token
  res.json({ message: "Has cerrado sesión con éxito" });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
