const express = require("express");
const router = express.Router();
const productsController = require("../controllers/productsController");

router
  .route("/")
  .get(productsController.getAllProducts)
  .post(productsController.createProduct);

router.get("/category", productsController.getProductByCategory);
router.get("/category/:id", productsController.getOneProductInCategory);
// router.post("/category");

router
  .route("/:id")
  .get(productsController.getProductById)
  .delete(productsController.deleteProduct)
  .put(productsController.updateProduct);

module.exports = router;
