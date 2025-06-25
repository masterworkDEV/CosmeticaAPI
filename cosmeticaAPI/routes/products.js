const express = require("express");
const router = express.Router();

// product handler
const productsController = require("../controllers/productsController");

// verifying user roles before accessing some routes in our app
const userRoles = require("../middlewares/verifyRoles");
const ROLES_LIST = require("../utils/availableRoles");

router
  .route("/")
  .get(productsController.getAllProducts)
  .post(
    userRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
    productsController.createProduct
  );

router.get("/category", productsController.getProductByCategory);
router.get("/category/:id", productsController.getOneProductInCategory);
// router.post("/category");

router
  .route("/:id")
  .get(productsController.getProductById)
  .delete(userRoles(ROLES_LIST.Admin), productsController.deleteProduct)
  .put(
    userRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
    productsController.updateProduct
  );

module.exports = router;
