const Product = require("../model/Product");

//  Get all products controller

const getAllProducts = async (req, res) => {
  const products = await Product.find();
  try {
    if (products.length === 0 || !products) {
      return res
        .status(404)
        .json({ success: false, message: `No product was found at this time` });
    }
    res
      .status(200)
      .json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.log("Error in getAllProducts", error);
    res.status(500).json({ message: `Server error ${error.message}` });
  }
};

//  Get single product controller

const getProductById = async (req, res) => {
  const { id } = req.params;
  if (!id || !Product.base.Types.ObjectId.isValid(id)) {
    res.status(400).json({
      success: false,
      message: `A valid product ID is required for this operation`,
    });
  }
  try {
    const product = await Product.findOne({ _id: id });
    if (!product)
      return res.status(404).json({
        success: false,
        messsage: `Cannot find product with ID ${id} provided`,
      }); // Not Found!

    // Send Product
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error("Error in getProductById:", error);
    res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};

// Create product controller
const createProduct = async (req, res) => {
  try {
    // Instantiate new product or "const product = await Product.create(req.body)" this will also validate all fields for us.
    const newProduct = new Product(req.body);
    const product = await newProduct.save();
    res.status(201).json({
      success: true,
      message: "Product successfully created",
      data: product,
    });
  } catch (error) {
    console.error("Error creating product:", error);

    // Handle Mongoose validation errors specifically
    if (error.name === "ValidationError") {
      const errors = {};
      for (let field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      });
    }

    // Handle other types of errors
    res.status(500).json({
      success: false,
      message: "Failed to create product due to server error",
      details: error.message,
    });
  }
};

// Update product controller
const updateProduct = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: `An ID is required for update`,
    });
  }

  // Ensure the ID is a valid MongoDB ObjectId
  if (!Product.base.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: `A valid product ID is required for this operation`,
    });
  }

  const updates = req.body;

  // If req.body is empty, there's nothing to update
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      message: `No update data provided.`,
    });
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ success: false, message: `No product found with ID ${id}` });
    }

    // Send updated product
    res.status(200).json({
      success: true,
      message: `Product with the ID ${id} is successfully updated`,
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Error in updateProduct:", error); // Use more specific error message
    // Handle Mongoose validation errors specifically
    if (error.name === "ValidationError") {
      const errors = {};
      for (let field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({
        success: false,
        message: "Validation failed during update",
        errors: errors,
      });
    }

    // 3. Corrected error message in catch block
    res.status(500).json({
      success: false,
      message: `Server error during product update: ${error.message}`,
    });
  }
};

// Delete product controller

const deleteProduct = async (req, res) => {
  const { id } = req.params;

  //   check if body or params has an ID
  if (!id) {
    res.status(400).json({
      success: false,
      message: `An ID is required for this operation`,
    });
  }

  try {
    // Find product
    const foundProduct = await Product.findById(id);
    if (!foundProduct) {
      res.status(404).json({
        success: false,
        message: `Cannot find product with the ID ${id} to delete`,
      });
    }
    // Delete product
    const deletedProduct = await foundProduct.deleteOne();

    res.status(204).json({
      success: true,
      message: `Product with the ID ${id} has been successfully deleted`,
      data: deletedProduct,
    });
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    res.status(500).json({
      success: false,
      message: `Error deleting product: ${error.message}`,
    });
  }
};

// Get | Post |  by categories

const getProductByCategory = async (req, res) => {
  const { category } = req.query;
  if (!category)
    return res
      .status(400)
      .json({ success: false, message: `This field is required` });

  try {
    const productByCategory = await Product.find({ category: category });

    if (productByCategory.length === 0 || !productByCategory) {
      return res.status(404).json({
        success: false,
        message: `No product found in the selected category: ${category}`,
      });
    }

    res.status(200).json({
      success: true,
      message: `${productByCategory.length} Products found `,
      data: productByCategory,
    });
  } catch (error) {
    console.error("Error in getProductByCategory", error);
    res.status(500).json({
      success: false,
      message: `Error fetching products: ${error.message}`,
    });
  }
};

const getOneProductInCategory = async (req, res) => {};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,

  // Products by category

  getProductByCategory,
};
