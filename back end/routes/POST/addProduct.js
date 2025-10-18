import express from "express";
import multer from "multer";
import path from "path"; 
import fs from "fs"; 
import { db } from "../../config/firebase.js"; 
import { v4 as uuidv4 } from "uuid"; 

const router = express.Router();

const uploadDir = "public/uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); 
  },
  filename: function (req, file, cb) {
    
    const uniqueSuffix = uuidv4() + path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

router.post("/products", upload.single("image"), async (req, res) => {
  try {
    const {
      price,
      category,
      brand,
      name,
      color,
      isLimited,
      isNew,
      isHot,
      isCollection,
    } = req.body;

    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "Imagem obrigatória" });
    }

    const url = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;

    const product = {
      image: url,
      price: parseFloat(price),
      category,
      brand,
      name,
      color,
      isLimited: isLimited === "true",
      isNew: isNew === "true",
      isHot: isHot === "true",
      isCollection: isCollection === "true",
    };

    const docRef = await db.collection("products").add(product);

    res.status(201).json({ id: docRef.id, ...product });
  } catch (error) {
    console.error("Erro ao adicionar produto:", error);

    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error("Falha ao remover arquivo após erro:", unlinkErr);
      }
    }

    res.status(500).json({ error: "Erro interno ao adicionar produto" });
  }
});

export default router;