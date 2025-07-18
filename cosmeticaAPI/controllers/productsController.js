//

const Product = require("../model/Product");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

// --- Cloudinary Configuration ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Use .fields() for multiple input fields, some single, some array
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit individual file size to 5MB
  },
});

// --- Helper function to upload an image to Cloudinary ---
async function uploadToCloudinary(file) {
  if (!file) return null;
  const result = await cloudinary.uploader.upload(
    `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
    {
      folder: "products", // Optional: specify a folder
    }
  );
  return { imageUrl: result.secure_url, imageId: result.public_id };
}

// --- Helper function to delete an image from Cloudinary ---
async function deleteFromCloudinary(imageId) {
  if (!imageId) return;
  try {
    await cloudinary.uploader.destroy(imageId);
    console.log(`Deleted image ${imageId} from Cloudinary.`);
  } catch (error) {
    console.error(`Failed to delete Cloudinary image ${imageId}:`, error);
  }
}

// --- Product Controllers ---

// Get all products controller (no changes needed)
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    if (products.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: `No product was found at this time` });
    }
    res
      .status(200)
      .json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.error("Error in getAllProducts:", error);
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// Get single product controller (no changes needed)
const getProductById = async (req, res) => {
  const { id } = req.params;
  if (!Product.base.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: `A valid product ID is required for this operation`,
    });
  }
  try {
    const product = await Product.findOne({ _id: id });
    if (!product)
      return res.status(404).json({
        success: false,
        message: `Cannot find product with ID ${id} provided`,
      });

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
  const { name, brand, category } = req.body;

  const duplicate = await Product.findOne({
    name: name,
    category: category,
    brand: brand,
  });
  if (duplicate) {
    return res.status(409).json({
      success: false,
      message: `Product with the name '${name}' already exists`,
    });
  }

  let thumbnailData = { imageUrl: "", imageId: "" };
  const galleryImagesData = [];
  const uploadedImageIds = []; // To track all uploaded IDs for cleanup

  try {
    // Handle thumbnail upload
    if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
      const result = await uploadToCloudinary(req.files.thumbnail[0]);
      if (result) {
        thumbnailData = result;
        uploadedImageIds.push(result.imageId);
      }
    }

    // Handle gallery images upload
    if (req.files && req.files.images && req.files.images.length > 0) {
      for (const file of req.files.images) {
        const result = await uploadToCloudinary(file);
        if (result) {
          galleryImagesData.push(result);
          uploadedImageIds.push(result.imageId);
        }
      }
    }

    // Create new product with image data
    const newProduct = new Product({
      name,
      brand,
      category,
      thumbnail: thumbnailData, // Assign thumbnail object
      images: galleryImagesData, // Assign array of gallery image objects
      ...req.body, // Spread any other fields from req.body
    });

    const product = await newProduct.save();
    res.status(201).json({
      success: true,
      message: "Product successfully created",
      data: product,
    });
  } catch (error) {
    console.error("Error creating product:", error);

    // If any images were uploaded but saving to DB failed, delete them from Cloudinary
    for (const id of uploadedImageIds) {
      await deleteFromCloudinary(id);
      console.warn(`Cleaned up Cloudinary image ${id} due to DB save failure.`);
    }

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

  if (!Product.base.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: `A valid product ID is required for this operation`,
    });
  }

  const updates = { ...req.body };
  const newlyUploadedImageIds = []; // To track new uploads for cleanup

  try {
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res
        .status(404)
        .json({ success: false, message: `No product found with ID ${id}` });
    }

    // --- Handle Thumbnail Update ---
    if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
      // Delete old thumbnail if it exists
      if (existingProduct.thumbnail && existingProduct.thumbnail.imageId) {
        await deleteFromCloudinary(existingProduct.thumbnail.imageId);
      }
      // Upload new thumbnail
      const result = await uploadToCloudinary(req.files.thumbnail[0]);
      if (result) {
        updates.thumbnail = result;
        newlyUploadedImageIds.push(result.imageId);
      }
    }

    // --- Handle Gallery Images Update ---
    // This logic ASSUMES that if new images are sent, they REPLACE the old gallery.
    // If you need to ADD/REMOVE individual images, the logic here will be more complex,
    // requiring client to send which images to keep/delete/add.
    if (req.files && req.files.images && req.files.images.length > 0) {
      // Delete ALL old gallery images
      if (existingProduct.images && existingProduct.images.length > 0) {
        for (const img of existingProduct.images) {
          await deleteFromCloudinary(img.imageId);
        }
      }
      // Upload new gallery images
      const newGalleryImagesData = [];
      for (const file of req.files.images) {
        const result = await uploadToCloudinary(file);
        if (result) {
          newGalleryImagesData.push(result);
          newlyUploadedImageIds.push(result.imageId);
        }
      }
      updates.images = newGalleryImagesData; // Set the new array of gallery images
    }

    // Perform the database update
    const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ success: false, message: `No product found with ID ${id}` });
    }

    res.status(200).json({
      success: true,
      message: `Product with the ID ${id} is successfully updated`,
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Error in updateProduct:", error);

    // If new images were uploaded but DB update failed, delete them
    for (const id of newlyUploadedImageIds) {
      await deleteFromCloudinary(id);
      console.warn(
        `Cleaned up newly uploaded Cloudinary image ${id} due to DB update failure.`
      );
    }

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

    res.status(500).json({
      success: false,
      message: `Server error during product update: ${error.message}`,
    });
  }
};

// Delete product controller
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: `An ID is required for this operation`,
    });
  }

  if (!Product.base.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: `A valid product ID is required for this operation`,
    });
  }

  try {
    const foundProduct = await Product.findById(id);
    if (!foundProduct) {
      return res.status(404).json({
        success: false,
        message: `Cannot find product with the ID ${id} to delete`,
      });
    }

    // Delete thumbnail image from Cloudinary
    if (foundProduct.thumbnail && foundProduct.thumbnail.imageId) {
      await deleteFromCloudinary(foundProduct.thumbnail.imageId);
    }

    // Delete ALL associated gallery images from Cloudinary
    if (foundProduct.images && foundProduct.images.length > 0) {
      for (const img of foundProduct.images) {
        await deleteFromCloudinary(img.imageId);
      }
    }

    // Delete product from database
    await foundProduct.deleteOne();

    res.status(200).json({
      success: true,
      message: `Product with the ID ${id} has been successfully deleted`,
    });
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    res.status(500).json({
      success: false,
      message: `Error deleting product: ${error.message}`,
    });
  }
};

// Get | Post |  by categories (no changes needed)
const getProductByCategory = async (req, res) => {
  const { category } = req.query;
  if (!category)
    return res.status(400).json({
      success: false,
      message: `Category query parameter is required`,
    });

  try {
    const productByCategory = await Product.find({ category: category });

    if (productByCategory.length === 0) {
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

const getOneProductInCategory = async (req, res) => {
  const { id, category } = req.query;
  if (!category)
    return res.status(400).json({
      success: false,
      message: `Category query parameter is required`,
    });

  try {
    const productInCategory = await Product.findOne({
      category: category,
      _id: id,
    });

    if (!productInCategory) {
      return res.status(404).json({
        success: false,
        message: `No product in this category matches ID ${id}`,
      });
    }

    res.status(200).json({ success: true, data: productInCategory });
  } catch (error) {
    console.error("Error in getOneProductInCategory", error);
    res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductByCategory,
  getOneProductInCategory,
  upload,
};
