import express from "express";
import { db } from "../../config/firebase.js";

const router = express.Router();


router.get("/products", async (req, res) => {
  try {

    const snapshot = await db.collection("products").get();


    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(products);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);

    res.status(500).json({ error: "Erro ao carregar produtos" });
  }
});

export default router;
