const express = require("express");
const app = express();
require("dotenv").config();
const { createClient } = require("@libsql/client");
const PORT = process.env.PORT || 3000;

const cors = require("cors");

app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] }));
app.use(express.json()); // Middleware para parsear JSON

// Initialize the Turso client
const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_TOKEN,
});

// Ruta para obtener mensajes
app.get("/messages", async (req, res) => {
  try {
    const result = await client.execute("SELECT * FROM messages");
    res.json(result.rows); // Devolver las filas del resultado
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Ruta para agregar datos
app.post("/add", async (req, res) => {
  // Validar si los campos necesarios están presentes
  if (!req.body.name || !req.body.content) {
    return res.status(400).json({ message: "Name and content are required" });
  }

  try {
    // Insertar mensaje de manera segura usando parámetros preparados
    const query = "INSERT INTO messages (author, content) VALUES (?, ?)";
    await client.execute(query, [req.body.name, req.body.content]);

    // Responder solo después de que la inserción sea exitosa
    res.json({ message: "Data received and inserted successfully" });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ message: "Failed to insert data into the database" });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Server running on ${PORT} port`);
});
