const express = require("express");
const router = express.Router();

// isAuthenticated
const isAuthenticated = require("../middlewares/verifyJWT");

// product handler
const productsController = require("../controllers/productsController");

// verifying user roles before accessing some routes in our app
const userRoles = require("../middlewares/verifyRoles");
const ROLES_LIST = require("../utils/availableRoles");

router
  .route("/")
  .get(productsController.getAllProducts)
  .post(
    isAuthenticated,
    userRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
    productsController.createProduct
  );

router.get(
  "/category",
  isAuthenticated,
  userRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User),
  productsController.getProductByCategory
);
router.get(
  "/category/:id",
  isAuthenticated,
  userRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User),
  productsController.getOneProductInCategory
);
// router.post("/category");

router
  .route("/:id")
  .get(productsController.getProductById)
  .delete(
    isAuthenticated,
    userRoles(ROLES_LIST.Admin),
    productsController.deleteProduct
  )
  .put(
    isAuthenticated,
    userRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
    productsController.updateProduct
  );

module.exports = router;
