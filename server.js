const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(cors());

// Servir archivos estáticos (HTML, CSS, JS)
app.use(express.static(__dirname));

// Servir archivos generados en /tmp (MP3, MP4)
app.use(express.static("/tmp"));

// Puerto para Render
const PORT = process.env.PORT || 3000;

// Carpeta donde Render permite escribir
const outputFolder = "/tmp";

// =============================
//     ENDPOINT DE CONVERSIÓN
// =============================
app.post("/convert", (req, res) => {
  const { url, format = "mp3", quality = "best" } = req.body;

  if (!url) {
    return res.status(400).json({ error: "No URL received" });
  }

  const timestamp = Date.now();
  const outputFile = `${outputFolder}/download_${timestamp}.%(ext)s`;

  let cmd;

  if (format === "mp3") {
    cmd = `yt-dlp -f bestaudio --extract-audio --audio-format mp3 --audio-quality ${quality} -o "${outputFile}" "${url}"`;
  } else {
    cmd = `yt-dlp -f bestvideo+bestaudio --merge-output-format mp4 -o "${outputFile}" "${url}"`;
  }

  console.log("Executing command:", cmd);

  exec(cmd, (error) => {
    if (error) {
      console.error("yt-dlp error:", error.message);
      return res.status(500).json({ error: "Error converting video" });
    }

    const files = fs.readdirSync(outputFolder);
    const resultFile = files.find((f) => f.includes(timestamp));

    if (!resultFile) {
      return res.status(500).json({ error: "File not found" });
    }

    // URL de descarga REAL
    const downloadUrl = `${req.protocol}://${req.get("host")}/${resultFile}`;
    return res.json({ downloadUrl });
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

