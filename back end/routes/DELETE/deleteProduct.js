
import express from "express";
import { db } from "../../config/firebase.js";
import fs from "fs";
import path from "path";

const router = express.Router();


router.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const productRef = db.collection("products").doc(id);
    const doc = await productRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    const product = doc.data();

    if (product.image) {
      const filename = product.image.split("/").pop();
      const imagePath = path.join("public", "uploads", filename);

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await productRef.delete();

    res.status(200).json({ message: "Produto deletado com sucesso" });
  } catch (error) {

    console.error("Erro ao deletar produto:", error);
    res.status(500).json({ error: "Erro interno ao deletar produto" });
  }
});

export default router;