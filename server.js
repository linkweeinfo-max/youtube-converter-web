const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/convert", async (req, res) => {
try {
const videoUrl = req.body.url;
const videoId = new URL(videoUrl).searchParams.get("v");

```
if (!videoId) {
  return res.status(400).json({ error: "No se pudo leer el ID del video" });
}

const apiRes = await fetch(
  `https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`,
  {
    headers: {
      "X-RapidAPI-Key": process.env.RAPID_KEY,
      "X-RapidAPI-Host": "youtube-mp36.p.rapidapi.com"
    }
  }
);

const data = await apiRes.json();
return res.json(data);
```

} catch (error) {
console.error(error);
return res.status(500).json({ error: "Error en el servidor" });
}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API corriendo en el puerto ${PORT}`));
