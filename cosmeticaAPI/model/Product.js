const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required."],
      trim: true,
      minlength: [3, "Product name must be at least 3 characters long."],
      maxlength: [100, "Product name cannot exceed 100 characters."],
    },
    description: {
      type: String,
      required: [true, "Product description is required."],
      trim: true,
      minlength: [
        10,
        "Product description must be at least 10 characters long.",
      ],
    },
    brand: {
      type: String,
      required: [true, "Brand name is required."],
      trim: true,
      maxlength: [50, "Brand name cannot exceed 50 characters."],
    },
    category: {
      type: String,
      ref: "Category", // The name of the Category model
      required: [true, "Product category is required."],
    },

    price: {
      type: Number,
      required: [true, "Price is required."],
      min: [0, "Price cannot be negative."],
    },
    currency: {
      type: String,
      default: "USD",
    },
    countInStock: {
      type: Number,
      required: [true, "Stock count is required."],
      min: [0, "Stock count cannot be negative."],
      default: 0,
    },

    images: [
      {
        type: [] || String, // Store image URLs (e.g., from a CDN like Cloudinary, AWS S3)
        trim: true,
      },
    ],
    thumbnail: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      min: [0, "Rating cannot be less than 0."],
      max: [5, "Rating cannot exceed 5."],
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    skinType: {
      type: [String],
      enum: ["Normal", "Dry", "Oily", "Combination", "Sensitive", "All"],
      default: ["All"],
    },
    concerns: {
      type: [String],
      enum: [
        "Acne",
        "Aging",
        "Redness",
        "Dullness",
        "Hydration",
        "Oil Control",
        "Dark Spots",
      ],
      default: [],
    },
    ingredients: {
      type: [String],
      default: [],
    },
    volume: {
      type: String,
      trim: true,
    },
    shade: {
      type: String,
      trim: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    dateAdded: {
      type: Date,
      default: Date.now, // Automatically set creation date
    },
  },
  {
    timestamps: true, // Adds `createdAt` and `updatedAt` fields automatically
  }
);

productSchema.index({ name: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ category: 1 });

productSchema.pre("save", function (next) {
  next();
});

const product = mongoose.model("Product", productSchema);
module.exports = product;
