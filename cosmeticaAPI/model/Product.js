const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required."],
      trim: true,
      minlength: [3, "Product name must be at least 3 characters long."],
      maxlength: [120, "Product name cannot exceed 120 characters."],
    },
    description: {
      type: String,
      required: [true, "Product description is required."],
      trim: true,
      minlength: [
        20,
        "Product description must be at least 20 characters long.",
      ],
      maxlength: [1000, "Product description cannot exceed 1000 characters."],
    },
    designer: {
      type: String,
      required: [true, "Designer name is required."],
      trim: true,
      maxlength: [70, "Designer name cannot exceed 70 characters."],
    },
    category: {
      type: String,
      ref: "Category",
      required: [true, "Product category is required."],
    },
    subCategory: {
      type: String,
      trim: true,
      maxlength: [70, "Sub-category name cannot exceed 70 characters."],
    },
    gender: {
      type: String,
      enum: ["Men", "Women", "Unisex", "Kids"],
      default: "Unisex",
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
    sizes: {
      // E.g., ['S', 'M', 'L', 'XL'], ['One Size'], ['EU 38', 'EU 40']
      type: [String],
      enum: ["XS", "S", "M", "L", "XL", "XXL", "One Size", "Custom"],
      default: [], // Or consider a more flexible structure for size charts
    },
    colors: {
      // E.g., ['Red', 'Blue', 'Black']
      type: [String],
      default: [],
    },
    materials: {
      // E.g., ['Cotton', 'Silk', 'Leather', 'Polyester blend']
      type: [String],
      default: [],
    },
    style: {
      // E.g., 'Bohemian', 'Minimalist', 'Streetwear', 'Formal'
      type: [String],
      default: [],
    },
    collection: {
      // E.g., 'Spring/Summer 2025', 'Limited Edition', 'Bridal Collection'
      type: String,
      trim: true,
      maxlength: [80, "Collection name cannot exceed 80 characters."],
    },
    season: {
      type: [String],
      enum: ["Spring", "Summer", "Autumn", "Winter", "All-Season"],
      default: ["All-Season"],
    },
    careInstructions: {
      type: String,
      trim: true,
      maxlength: [300, "Care instructions cannot exceed 300 characters."],
    },
    images: [
      {
        url: { type: String, trim: true, required: true }, // Store image URLs
        altText: { type: String, trim: true, maxlength: 100 },
      },
    ],
    thumbnail: {
      // Primary image for listings
      type: String,
      trim: true,
      required: [true, "Thumbnail image is required."],
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
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds `createdAt` and `updatedAt` fields automatically
  }
);

productSchema.index({ name: 1 });
productSchema.index({ designer: 1 });
productSchema.index({ category: 1 });
productSchema.index({ subCategory: 1 });
productSchema.index({ price: 1 }); // Useful for sorting by price

productSchema.pre("save", function (next) {
  next();
});

const products = mongoose.model("FashionProduct", productSchema);
module.exports = products;
