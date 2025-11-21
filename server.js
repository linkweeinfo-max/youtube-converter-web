const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(cors());

// === Render usa este puerto ===
const PORT = process.env.PORT || 3000;

// Carpeta donde se guardarán los archivos descargados
const outputFolder = path.join(__dirname, "downloads");
if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder);

app.use("/downloads", express.static(outputFolder));

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

  console.log("Executing:", cmd);

  exec(cmd, (error) => {
    if (error) {
      console.error("yt-dlp error:", error.message);
      return res.status(500).json({ error: "Error converting video" });
    }

    const files = fs.readdirSync(outputFolder);
    const resultFile = files.find(f => f.includes(timestamp));

    if (!resultFile) {
      return res.status(500).json({ error: "File not found" });
    }

    const downloadUrl = `${req.protocol}://${req.get("host")}/downloads/${resultFile}`;
    return res.json({ downloadUrl });
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
