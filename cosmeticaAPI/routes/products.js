const express = require("express");
const router = express.Router();

// Import controllers or handlers.
const productsController = require("../controllers/productsController");

router
  .route("/")
  .get(productsController.getAllProducts)
  .post(productsController.createProduct)
  .put(productsController.updateProduct);

router
  .route("/:id")
  .get(productsController.getProductById)
  .put()
  .delete(productsController.deleteProduct);

router.get("/categories", productsController.getProductByCategory);
router.post("/categories");
router.get("/categories/:id");
