const express = require("express");
const router = express.Router();

// isProtected
const isProtected = require("../middlewares/verifyJWT");

// product handler
const productsController = require("../controllers/productsController");

// verifying user roles before accessing some routes in our app
const userRoles = require("../middlewares/verifyRoles");
const ROLES_LIST = require("../utils/availableRoles");

router
  .route("/")
  .get(productsController.getAllProducts)
  .post(
    isProtected,
    userRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
    productsController.upload.single("image"),
    productsController.createProduct
  );

router.get(
  "/category",
  isProtected,
  userRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User),
  productsController.getProductByCategory
);
router.get(
  "/category/:id",
  isProtected,
  userRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User),
  productsController.getOneProductInCategory
);
// router.post("/category");

router
  .route("/:id")
  .get(productsController.getProductById)
  .delete(
    isProtected,
    userRoles(ROLES_LIST.Admin),
    productsController.deleteProduct
  )
  .put(
    isProtected,
    userRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
    productsController.upload.single("image"),
    productsController.updateProduct
  );

module.exports = router;
