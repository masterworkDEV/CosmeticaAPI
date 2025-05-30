const express = require("express");
const router = express.Router();
const productsController = require("../controllers/productsController");

router
  .route("/")
  .get(productsController.getAllProducts)
  .post(productsController.createProduct)
  .put(productsController.updateProduct);

router
  .route("/:id")
  .get(productsController.getProductById)
  .put(productsController.updateProduct)
  .delete(productsController.deleteProduct);

router.get("/categories", productsController.getProductByCategory);
// router.post("/categories");
// router.get("/categories/:id");

module.exports = router;
