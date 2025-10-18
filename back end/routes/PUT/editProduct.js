import express from "express";
import multer from "multer";
import { db } from "../../config/firebase.js"; 
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

const uploadDir = "public/uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4() + path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});
const upload = multer({ storage: storage });

router.put("/products/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;

    const productRef = db.collection("products").doc(id);
    const doc = await productRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    const data = req.body;
    const file = req.file;
    const oldData = doc.data();

    let updatedImageUrl = oldData.image;

    if (file) {
      updatedImageUrl = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;

      if (oldData.image) {
        const oldFilename = oldData.image.split("/").pop();
        const oldImagePath = path.join("public", "uploads", oldFilename);

        if (fs.existsSync(oldImagePath)) {
          try {
            fs.unlinkSync(oldImagePath);
          } catch (unlinkErr) {
            console.error("Falha ao remover imagem antiga:", unlinkErr);
          }
        }
      }
    }

    const updatedData = {
      ...data,
      price: data.price ? parseFloat(data.price) : oldData.price,
      isLimited: data.isLimited === "true",
      isNew: data.isNew === "true",
      isHot: data.isHot === "true",
      isCollection: data.isCollection === "true",
      image: updatedImageUrl,
    };

    await productRef.update(updatedData);

    res.status(200).json({ id, ...updatedData });
  } catch (error) {

    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error("Falha ao remover arquivo após erro:", unlinkErr);
      }
    }

    console.error("Erro ao editar produto:", error);
    res.status(500).json({ error: "Erro interno ao editar produto" });
  }
});

export default router;