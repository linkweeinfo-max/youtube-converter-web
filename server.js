const express = require("express");
const cors = require("cors");
const ytdl = require("ytdl-core");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(cors());

// Carpeta temporal donde Render sí permite escribir
const outputFolder = "/tmp";
app.use(express.static(outputFolder));

const PORT = process.env.PORT || 3000;

app.post("/convert", async (req, res) => {
  const { url, format = "mp3" } = req.body;

  if (!url) {
    return res.status(400).json({ error: "No URL provided" });
  }

  try {
    const timestamp = Date.now();
    const filePath = `${outputFolder}/video_${timestamp}.${format}`;

    const stream = ytdl(url, {
      filter: format === "mp3" ? "audioonly" : "audioandvideo"
    });

    const file = fs.createWriteStream(filePath);
    stream.pipe(file);

    file.on("finish", () => {
      const downloadUrl = `${req.protocol}://${req.get("host")}/video_${timestamp}.${format}`;
      return res.json({ downloadUrl });
    });

    stream.on("error", () => {
      return res.status(500).json({ error: "Failed to download" });
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
