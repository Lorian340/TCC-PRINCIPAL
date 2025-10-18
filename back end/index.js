import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();
app.use(cors());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use('/uploads', express.static('public/uploads'));

const routeFolders = ["GET", "POST", "PUT", "DELETE"];

routeFolders.forEach((folder) => {
  const routePath = path.join(process.cwd(), "routes", folder);

  if (fs.existsSync(routePath)) {
    fs.readdirSync(routePath).forEach(async (file) => {
      const route = (await import(`./routes/${folder}/${file}`)).default;


      app.use("/", route);
    });
  }
});

const PORT = process.env.PORT || 5501;
app.listen(PORT, () => console.log(`✅ Servidor rodando na porta ${PORT}`));
