const express = require("express");
const router = express.Router();
const productsController = require("../controllers/productsController");

router
  .route("/")
  .get(productsController.getAllProducts)
  .post(productsController.createProduct);

router
  .route("/:id")
  .get(productsController.getProductById)
  .delete(productsController.deleteProduct)
  .put(productsController.updateProduct);

router.route("/category").get(productsController.getProductByCategory);
// router.post("/categories");
// router.get("/categories/:id");

module.exports = router;
