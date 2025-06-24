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
    origin: ["http://localhost:5173", "http://192.168.0.122:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(cookieParser());

const connnection = mysql2.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "banco_gastos",
  port: 3306,
});

function authMiddleware(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "No autenticado" });
  jwt.verify(token, "mi_secreto", (err, decoded) => {
    if (err) return res.status(401).json({ message: "Token inválido" });
    req.user = decoded;
    next();
  });
}

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

  // Buscar el usuario en la base de datos (por username o email)
  const sql = "SELECT * FROM users WHERE username = ? OR email = ?";
  connnection.query(sql, [username, username], (err, results) => {
    if (err) return res.status(500).json({ message: "Error en el servidor" });
    if (results.length === 0)
      return res.status(400).json({ message: "Usuario no encontrado" });

    const user = results[0];
    // Verificar la contraseña (en producción usa bcrypt)
    if (user.password !== password) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    // Si el usuario debe cambiar su contraseña
    if (user.password_change === 0 || user.password_change === false) {
      // No crear token, solo avisar al frontend
      return res.json({
        requirePasswordChange: true,
        userId: user.id,
        role: user.role,
        username: user.username,
        email: user.email,
      });
    }

    // Crear el JWT (Access Token)
    const accessToken = jwt.sign(
      { username: user.username, role: user.role, email: user.email },
      "mi_secreto",
      { expiresIn: "1h" }
    );

    // Crear el Refresh Token
    const refreshToken = jwt.sign(
      { username: user.username, role: user.role, email: user.email },
      "mi_secreto_refresh",
      { expiresIn: "7d" }
    );

    // Guardar los tokens en cookies
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: false,
      maxAge: 604800000,
    });
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: false,
      maxAge: 3600000,
    });

    // Redirigir según el rol
    if (user.role === "admin") {
      res.json({ message: "Bienvenido, administrador!", role: "admin" });
    } else if (user.role === "abogado") {
      res.json({ message: "Bienvenido, abogado!", role: "abogado" });
    } else {
      res.json({ message: "Bienvenido, usuario!", role: "user" });
    }
  });
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

app.post("/rendiciones", authMiddleware, (req, res) => {
  const { clienteId, rendicion, totalAbonos, totalGastos, saldo } = req.body;
  const user = req.user;

  if (!clienteId || !rendicion) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  const estado = user.role === "abogado" ? "pendiente" : "aprobada";

  const sql =
    "INSERT INTO rendiciones (cliente_id, user_username, ingresos, gastos, total_abonos, total_gastos, saldo, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  connnection.query(
    sql,
    [
      clienteId,
      user.username, // Guarda el username en vez del id
      JSON.stringify(rendicion.ingresos),
      JSON.stringify(rendicion.gastos),
      totalAbonos,
      totalGastos,
      saldo,
      estado,
    ],
    (err, result) => {
      if (err) {
        console.error("Error al guardar la rendición:", err);
        return res.status(500).json({ error: "Error al guardar la rendición" });
      }
      res.status(201).json({
        message: "Rendición guardada correctamente",
        id: result.insertId,
      });
    }
  );
});

// Nueva ruta para consultar el historial de rendiciones
app.get("/rendiciones", (req, res) => {
  const sql = `
    SELECT id, cliente_id as clienteId, user_username, ingresos, gastos, total_abonos as totalAbonos, total_gastos as totalGastos, saldo, estado, fecha_creacion as createdAt
    FROM rendiciones
    WHERE estado = 'aprobada'
    ORDER BY id DESC
  `;
  connnection.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener las rendiciones:", err);
      return res
        .status(500)
        .json({ error: "Error al obtener las rendiciones" });
    }
    // Parsear ingresos y gastos de JSON
    const parsed = results.map((r) => ({
      ...r,
      ingresos: JSON.parse(r.ingresos),
      gastos: JSON.parse(r.gastos),
    }));
    res.json(parsed);
  });
});

// Ruta para eliminar una rendición por su ID
app.delete("/rendiciones/:id", (req, res) => {
  const { id } = req.params;
  connnection.query(
    "DELETE FROM rendiciones WHERE id = ?",
    [id],
    (err, result) => {
      if (err) {
        console.error("Error al eliminar la rendición:", err);
        return res
          .status(500)
          .json({ error: "Error al eliminar la rendición" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Rendición no encontrada" });
      }
      res.json({ message: "Rendición eliminada correctamente" });
    }
  );
});

app.get("/rendiciones-pendientes", (req, res) => {
  const sql = `
    SELECT id, cliente_id as clienteId, user_username, ingresos, gastos, total_abonos as totalAbonos, total_gastos as totalGastos, saldo, estado, fecha_creacion as createdAt
    FROM rendiciones
    WHERE estado = 'pendiente'
    ORDER BY id DESC
  `;
  connnection.query(sql, (err, results) => {
    if (err)
      return res.status(500).json({ error: "Error al obtener rendiciones" });
    const parsed = results.map((r) => ({
      ...r,
      ingresos: JSON.parse(r.ingresos),
      gastos: JSON.parse(r.gastos),
    }));
    res.json(parsed);
  });
});

app.put("/rendiciones/:id/aprobar", (req, res) => {
  const { id } = req.params;
  connnection.query(
    "UPDATE rendiciones SET estado = 'aprobada', motivo_rechazo = NULL WHERE id = ?",
    [id],
    (err) => {
      if (err) return res.status(500).json({ error: "Error al aprobar" });
      res.json({ message: "Rendición aprobada" });
    }
  );
});

app.put("/rendiciones/:id/rechazar", (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body;
  connnection.query(
    "UPDATE rendiciones SET estado = 'rechazada', motivo_rechazo = ? WHERE id = ?",
    [motivo, id],
    (err) => {
      if (err) return res.status(500).json({ error: "Error al rechazar" });
      res.json({ message: "Rendición rechazada" });
    }
  );
});

// Ruta de logout
app.post("/logout", (req, res) => {
  res.clearCookie("token"); // Eliminar la cookie del token
  res.clearCookie("refresh_token"); // Eliminar la cookie del refresh token
  res.json({ message: "Has cerrado sesión con éxito" });
});

// Ruta para actualizar una rendición por su ID
app.put("/rendiciones/:id", (req, res) => {
  const { id } = req.params;
  const { clienteId, rendicion, totalAbonos, totalGastos, saldo } = req.body;

  if (!clienteId || !rendicion) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  const sql =
    "UPDATE rendiciones SET cliente_id = ?, ingresos = ?, gastos = ?, total_abonos = ?, total_gastos = ?, saldo = ? WHERE id = ?";

  connnection.query(
    sql,
    [
      clienteId,
      JSON.stringify(rendicion.ingresos),
      JSON.stringify(rendicion.gastos),
      totalAbonos,
      totalGastos,
      saldo,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error("Error al actualizar la rendición:", err);
        return res
          .status(500)
          .json({ error: "Error al actualizar la rendición" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Rendición no encontrada" });
      }
      res.json({ message: "Rendición actualizada correctamente" });
    }
  );
});

app.get("/saldos-clientes", (req, res) => {
  const sql = `
    SELECT 
      c.id AS cliente_id,
      c.dinero - IFNULL(SUM(r.total_gastos), 0) AS saldo
    FROM clientes c
    LEFT JOIN rendiciones r ON c.id = r.cliente_id
    GROUP BY c.id
  `;
  connnection.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener los saldos de clientes:", err);
      return res
        .status(500)
        .json({ error: "Error al obtener los saldos de clientes" });
    }
    res.json(results);
  });
});

app.get("/users", (req, res) => {
  connnection.query(
    "SELECT id, username, email, role, password FROM users",
    (err, results) => {
      if (err)
        return res.status(500).json({ error: "Error al obtener usuarios" });
      res.json(results);
    }
  );
});

app.post("/users", (req, res) => {
  const { username, email, role } = req.body;
  // Solo permite crear abogados
  if (role !== "abogado")
    return res.status(400).json({ error: "Solo se pueden crear abogados" });
  // Generar contraseña temporal
  const tempPassword = Math.random().toString(36).slice(-8);
  const sql =
    "INSERT INTO users (username, email, password, role, password_change) VALUES (?, ?, ?, ?, false)";
  connnection.query(
    sql,
    [username, email, tempPassword, role],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Error al crear usuario" });
      res.status(201).json({
        user: { id: result.insertId, username, email, role },
        tempPassword,
      });
    }
  );
});

app.put("/users/:id/password", (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  // En producción, usa bcrypt para hashear la contraseña
  const sql =
    "UPDATE users SET password = ?, password_change = true WHERE id = ?";
  connnection.query(sql, [newPassword, id], (err, result) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Error al actualizar contraseña" });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ message: "Contraseña actualizada correctamente" });
  });
});

app.delete("/users/:id", (req, res) => {
  const { id } = req.params;
  connnection.query("DELETE FROM users WHERE id = ?", [id], (err, result) => {
    if (err)
      return res.status(500).json({ error: "Error al eliminar usuario" });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ message: "Usuario eliminado correctamente" });
  });
});

app.post("/viaticos", authMiddleware, (req, res) => {
  const {
    fechaSolicitud,
    socioAutoriza,
    fechaReembolso,
    totalReembolso,
    gastos,
  } = req.body;

  const abogadoUsername = req.user.username;

  if (
    !fechaSolicitud ||
    !socioAutoriza ||
    !fechaReembolso ||
    !totalReembolso ||
    !Array.isArray(gastos)
  ) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  const sqlInsertViatico = `
    INSERT INTO viaticos 
    (abogado_username, socio_autoriza, fecha_solicitud, fecha_reembolso, total_reembolso, estado)
    VALUES (?, ?, ?, ?, ?, 'pendiente')
  `;

  connnection.query(
    sqlInsertViatico,
    [
      abogadoUsername,
      socioAutoriza,
      fechaSolicitud,
      fechaReembolso,
      totalReembolso,
    ],
    (err, result) => {
      if (err) {
        console.error("Error al guardar el viático:", err);
        return res.status(500).json({ error: "Error al guardar el viático" });
      }

      const viaticoId = result.insertId;

      const gastosValues = gastos.map((g) => [
        viaticoId,
        g.fechaGasto,
        g.tramite,
        g.numeroBoleta,
        g.monto,
        g.cliente,
        g.cargo,
      ]);

      const sqlInsertGastos = `
        INSERT INTO viaticos_gastos
        (viatico_id, fecha_gasto, tramite, numero_boleta, monto, cliente_nombre, cargo)
        VALUES ?
      `;

      connnection.query(sqlInsertGastos, [gastosValues], (err2) => {
        if (err2) {
          console.error("Error al guardar los gastos:", err2);
          return res
            .status(500)
            .json({ error: "Error al guardar los gastos del viático" });
        }

        res.status(201).json({
          message: "Viático registrado con éxito",
          viaticoId,
        });
      });
    }
  );
});

app.get("/viaticos", authMiddleware, (req, res) => {
  const username = req.user.username;

  const sql = `
    SELECT v.*, vg.fecha_gasto, vg.tramite, vg.numero_boleta, vg.monto, vg.cliente_nombre, vg.cargo
    FROM viaticos v
    LEFT JOIN viaticos_gastos vg ON v.id = vg.viatico_id
    WHERE v.abogado_username = ?
    ORDER BY v.fecha_creacion DESC
  `;

  connnection.query(sql, [username], (err, results) => {
    if (err) {
      console.error("Error al obtener viáticos:", err);
      return res.status(500).json({ error: "Error al obtener viáticos" });
    }

    // Agrupar por viatico_id
    const agrupado = {};
    results.forEach((row) => {
      if (!agrupado[row.id]) {
        agrupado[row.id] = {
          id: row.id,
          abogado_username: row.abogado_username,
          socio_autoriza: row.socio_autoriza,
          fecha_solicitud: row.fecha_solicitud,
          fecha_reembolso: row.fecha_reembolso,
          total_reembolso: row.total_reembolso,
          estado: row.estado,
          gastos: [],
        };
      }

      if (row.fecha_gasto) {
        agrupado[row.id].gastos.push({
          fechaGasto: row.fecha_gasto,
          tramite: row.tramite,
          numeroBoleta: row.numero_boleta,
          monto: row.monto,
          cliente: row.cliente_nombre,
          cargo: row.cargo,
        });
      }
    });

    res.json(Object.values(agrupado));
  });
});

app.get("/admin/viaticos", authMiddleware, (req, res) => {
  // Solo permitimos acceso a admin
  if (req.user.username !== "Francisco Montero") {
    return res.status(403).json({ error: "Acceso denegado" });
  }

  const estadoFiltro = req.query.estado; // opcional: ?estado=pendiente/aprobada/rechazada

  let sql = `
    SELECT v.*, vg.fecha_gasto, vg.tramite, vg.numero_boleta, vg.monto, vg.cliente_nombre, vg.cargo
    FROM viaticos v
    LEFT JOIN viaticos_gastos vg ON v.id = vg.viatico_id
  `;

  const params = [];
  if (estadoFiltro) {
    sql += " WHERE v.estado = ?";
    params.push(estadoFiltro);
  }

  sql += " ORDER BY v.fecha_creacion DESC";

  connnection.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error al obtener viáticos admin:", err);
      return res.status(500).json({ error: "Error al obtener viáticos" });
    }

    // Agrupar gastos por viático
    const agrupado = {};
    results.forEach((row) => {
      if (!agrupado[row.id]) {
        agrupado[row.id] = {
          id: row.id,
          abogado_username: row.abogado_username,
          socio_autoriza: row.socio_autoriza,
          fecha_solicitud: row.fecha_solicitud,
          fecha_reembolso: row.fecha_reembolso,
          total_reembolso: row.total_reembolso,
          estado: row.estado,
          motivo_rechazo: row.motivo_rechazo || null,
          gastos: [],
        };
      }

      if (row.fecha_gasto) {
        agrupado[row.id].gastos.push({
          fechaGasto: row.fecha_gasto,
          tramite: row.tramite,
          numeroBoleta: row.numero_boleta,
          monto: row.monto,
          cliente: row.cliente_nombre,
          cargo: row.cargo,
        });
      }
    });

    res.json(Object.values(agrupado));
  });
});

app.put("/viaticos/:id/aprobar", authMiddleware, (req, res) => {
  const { id } = req.params;

  // Solo puede aprobar el admin Francisco
  if (req.user.username !== "Francisco Montero") {
    return res
      .status(403)
      .json({ error: "Solo el socio puede aprobar viáticos" });
  }

  const sql = `
    UPDATE viaticos
    SET estado = 'aprobada' 
    WHERE id = ?
  `;

  connnection.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error al aprobar viático:", err);
      return res.status(500).json({ error: "Error al aprobar viático" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Viático no encontrado" });
    }

    res.json({ message: "Viático aprobado correctamente" });
  });
});
app.put("/viaticos/:id/aprobar", (req, res) => {
  const { id } = req.params;

  const sql = `
    UPDATE viaticos 
    SET estado = 'aprobada' 
    WHERE id = ?
  `;

  connnection.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error al aprobar viático:", err);
      return res.status(500).json({ error: "Error al aprobar viático" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Viático no encontrado" });
    }

    res.json({ message: "Viático aprobado correctamente" });
  });
});

app.put("/viaticos/:id/rechazar", (req, res) => {
  const { id } = req.params;

  const sql = `
    UPDATE viaticos 
    SET estado = 'rechazada' 
    WHERE id = ?
  `;

  connnection.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error al rechazar viático:", err);
      return res.status(500).json({ error: "Error al rechazar viático" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Viático no encontrado" });
    }

    res.json({ message: "Viático rechazado correctamente" });
  });
});

// Iniciar el servidor
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
