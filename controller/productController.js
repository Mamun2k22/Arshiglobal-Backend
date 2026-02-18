// controllers/product.controller.js
import mongoose from "mongoose";  
import { Product, Category } from "../model/index.model.js";

// ---- helpers ----
const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;
const toNumber = (v, def = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};
const isBlank = (v) =>
  v == null || (typeof v === "string" && v.trim() === "");

// -------------------- CREATE --------------------
// export const addProduct = async (req, res) => {
//   try {
//     const {
//       sku,
//       productName,
//       categoryIds = [], 
//       categoryName = "",   // 👈 main + child IDs array
//       color = [],
//       productImage = [],
//       brand = "",
//       price,
//       discount = 0,
//       status = "available",
//       stock = 0,
//       sizeWeight = [],
//       details,
//       longDetails,
//     } = req.body;

//     const errors = {};

//     if (!isNonEmptyString(sku)) errors.sku = { message: "SKU is required" };
//     if (!isNonEmptyString(productName)) errors.productName = { message: "Product name is required" };

//     // 🔍 validate categoryIds
//     if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
//       errors.categories = { message: "At least one category is required" };
//     } else if (!categoryIds.every((id) => mongoose.isValidObjectId(id))) {
//       errors.categories = { message: "Invalid category id(s)" };
//     } else {
//       // optionally check all exist
//       const count = await Category.countDocuments({ _id: { $in: categoryIds } });
//       if (count !== categoryIds.length) {
//         errors.categories = { message: "Some categories do not exist" };
//       }
//     }

//     if (!Array.isArray(productImage) || productImage.length === 0)
//       errors.productImage = { message: "At least one product image is required" };

//     const parsedPrice = Number(price);
//     if (!Number.isFinite(parsedPrice) || parsedPrice <= 0)
//       errors.price = { message: "Price must be a positive number" };

//     const parsedDiscount = Number(discount) || 0;
//     if (parsedDiscount < 0) errors.discount = { message: "Discount cannot be negative" };

//     const parsedStock = Number(stock) || 0;
//     if (parsedStock < 0) errors.stock = { message: "Stock cannot be negative" };

//     if (!isNonEmptyString(details)) errors.details = { message: "Product info is required" };
//     if (!isNonEmptyString(longDetails)) errors.longDetails = { message: "Additional info is required" };

//     const parsedSizeWeight = (Array.isArray(sizeWeight) ? sizeWeight : []).map((sw) => ({
//       size: String(sw?.size ?? "").trim(),
//       weight: Number(sw?.weight ?? 0) || 0,
//     }));

//     if (Object.keys(errors).length > 0) {
//       return res.status(422).json({ message: "Validation error", errors });
//     }

//     const doc = new Product({
//       sku: String(sku).trim(),
//       productName: String(productName).trim(),

//       // 🔥 একসাথে main + child সব save হচ্ছে
//       categories: categoryIds,                           // main + child ids
//   categoryName: String(categoryName || "").trim(),   // "Women Collection"

//       color: Array.isArray(color) ? color : [],
//       productImage,
//       brand: String(brand || "").trim(),
//       price: parsedPrice,
//       discount: parsedDiscount,
//       status,
//       stock: parsedStock,
//       sizeWeight: parsedSizeWeight,
//       details: String(details).trim(),
//       longDetails: String(longDetails).trim(),
//     });

//     await doc.save();
//     return res.status(201).json({ message: "Product created successfully", product: doc });
//   } catch (error) {
//     if (error?.code === 11000 && (error.keyPattern?.sku || error.keyValue?.sku)) {
//       return res.status(409).json({ message: "SKU already exists", errors: { sku: { message: "Duplicate SKU" } } });
//     }
//     if (error?.name === "ValidationError" && error?.errors) {
//       const errors = {};
//       for (const [k, v] of Object.entries(error.errors)) errors[k] = { message: v.message };
//       return res.status(422).json({ message: "Validation error", errors });
//     }
//     console.error("Error adding product:", error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };
// export const addProduct = async (req, res) => {
//   try {
//     const {
//       sku,
//       productName,
//       categoryIds = [],   // শুধু IDs নেবো
//       color = [],
//       productImage = [],
//       brand = "",
//       price,
//       discount = 0,
//       status = "available",
//       stock = 0,
//       sizeWeight = [],
//       details,
//       longDetails,
//     } = req.body;

//     const errors = {};

//     if (!isNonEmptyString(sku)) errors.sku = { message: "SKU is required" };
//     if (!isNonEmptyString(productName)) errors.productName = { message: "Product name is required" };

//     // 🔍 validate categoryIds
//     if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
//       errors.categories = { message: "At least one category is required" };
//     } else if (!categoryIds.every((id) => mongoose.isValidObjectId(id))) {
//       errors.categories = { message: "Invalid category id(s)" };
//     }

//     if (!Array.isArray(productImage) || productImage.length === 0)
//       errors.productImage = { message: "At least one product image is required" };

//     const parsedPrice = Number(price);
//     if (!Number.isFinite(parsedPrice) || parsedPrice <= 0)
//       errors.price = { message: "Price must be a positive number" };

//     const parsedDiscount = Number(discount) || 0;
//     if (parsedDiscount < 0) errors.discount = { message: "Discount cannot be negative" };

//     const parsedStock = Number(stock) || 0;
//     if (parsedStock < 0) errors.stock = { message: "Stock cannot be negative" };

//     if (!isNonEmptyString(details)) errors.details = { message: "Product info is required" };
//     if (!isNonEmptyString(longDetails)) errors.longDetails = { message: "Additional info is required" };

//     const parsedSizeWeight = (Array.isArray(sizeWeight) ? sizeWeight : []).map((sw) => ({
//       size: String(sw?.size ?? "").trim(),
//       weight: Number(sw?.weight ?? 0) || 0,
//     }));

//     if (Object.keys(errors).length > 0) {
//       return res.status(422).json({ message: "Validation error", errors });
//     }

//     // 🔥 এখান থেকে মূল পার্ট: categoryIds → primary category name
//     const cats = await Category.find({ _id: { $in: categoryIds } }).select("name parent");

//     if (!cats.length) {
//       return res.status(422).json({
//         message: "Validation error",
//         errors: { categories: { message: "Some categories do not exist" } },
//       });
//     }

//     // main category বের করি: parent == null হলে সেইটা, না থাকলে প্রথমটা
//     const primaryCat = cats.find((c) => !c.parent) || cats[0];
//     const primaryCategoryName = primaryCat?.name || "";

//     const doc = new Product({
//       sku: String(sku).trim(),
//       productName: String(productName).trim(),

//       // main + child সব save হচ্ছে
//       categories: categoryIds,
//       categoryName: primaryCategoryName,   // ✅ backend নিজে সেট করল

//       color: Array.isArray(color) ? color : [],
//       productImage,
//       brand: String(brand || "").trim(),
//       price: parsedPrice,
//       discount: parsedDiscount,
//       status,
//       stock: parsedStock,
//       sizeWeight: parsedSizeWeight,
//       details: String(details).trim(),
//       longDetails: String(longDetails).trim(),
//     });

//     await doc.save();

//     console.log("created product:", doc); // debug এর জন্য, ইচ্ছা হলে রাখো

//     return res.status(201).json({ message: "Product created successfully", product: doc });
//   } catch (error) {
//     if (error?.code === 11000 && (error.keyPattern?.sku || error.keyValue?.sku)) {
//       return res
//         .status(409)
//         .json({ message: "SKU already exists", errors: { sku: { message: "Duplicate SKU" } } });
//     }
//     if (error?.name === "ValidationError" && error?.errors) {
//       const errors = {};
//       for (const [k, v] of Object.entries(error.errors)) errors[k] = { message: v.message };
//       return res.status(422).json({ message: "Validation error", errors });
//     }
//     console.error("Error adding product:", error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };

const ALLOWED_DELIVERY_TYPES = new Set(["cash_on_delivery", "free_delivery"]);
const ALLOWED_FREE_DELIVERY_AREAS = new Set([
  "inside_dhaka",
  "outside_dhaka",
  "all_bangladesh",
]);

export const addProduct = async (req, res) => {
  try {
    const {
      sku,
      productName,
      categoryIds = [],
      color = [],
      productImage = [],
      brand = "",

      // ✅ 3 prices
      buyPrice = 0,
      regularPrice,
      price, // sell price (existing)

      // ✅ delivery
      delivery = {}, // { type, area }

      status = "available",
      stock = 0,
      sizeWeight = [],
      details,
      longDetails,
    } = req.body;

    const errors = {};

    if (!isNonEmptyString(sku)) errors.sku = { message: "SKU is required" };
    if (!isNonEmptyString(productName))
      errors.productName = { message: "Product name is required" };

    // categoryIds validate
    if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
      errors.categories = { message: "At least one category is required" };
    } else if (!categoryIds.every((id) => mongoose.isValidObjectId(id))) {
      errors.categories = { message: "Invalid category id(s)" };
    }

    if (!Array.isArray(productImage) || productImage.length === 0) {
      errors.productImage = { message: "At least one product image is required" };
    }

    // ✅ parse prices
    const parsedBuyPrice = Number(buyPrice) || 0;
    if (parsedBuyPrice < 0) {
      errors.buyPrice = { message: "Buying price cannot be negative" };
    }

    const parsedRegularPrice = Number(regularPrice);
    if (!Number.isFinite(parsedRegularPrice) || parsedRegularPrice <= 0) {
      errors.regularPrice = { message: "Regular price must be a positive number" };
    }

    const parsedSellPrice = Number(price);
    if (!Number.isFinite(parsedSellPrice) || parsedSellPrice <= 0) {
      errors.price = { message: "Sell price must be a positive number" };
    }

    const parsedStock = Number(stock) || 0;
    if (parsedStock < 0) errors.stock = { message: "Stock cannot be negative" };

    if (!isNonEmptyString(details)) errors.details = { message: "Product info is required" };
    if (!isNonEmptyString(longDetails))
      errors.longDetails = { message: "Additional info is required" };

    // ✅ delivery validation
    const deliveryType = String(delivery?.type || "cash_on_delivery");
    const deliveryAreaRaw = delivery?.area;

    if (!ALLOWED_DELIVERY_TYPES.has(deliveryType)) {
      errors.delivery = { message: "Invalid delivery type" };
    } else if (deliveryType === "free_delivery") {
      const area = String(deliveryAreaRaw || "");
      if (!ALLOWED_FREE_DELIVERY_AREAS.has(area)) {
        errors.delivery = { message: "Invalid free delivery area" };
      }
    }

    // ✅ size parsing
    const parsedSizeWeight = (Array.isArray(sizeWeight) ? sizeWeight : [])
      .map((sw) => {
        const size = String(sw?.size ?? "").trim();
        if (!size) return null;
        return { size };
      })
      .filter(Boolean);

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ message: "Validation error", errors });
    }

    // categories check
    const cats = await Category.find({ _id: { $in: categoryIds } }).select("name parent");
    if (!cats.length) {
      return res.status(422).json({
        message: "Validation error",
        errors: { categories: { message: "Some categories do not exist" } },
      });
    }

    const primaryCat = cats.find((c) => !c.parent) || cats[0];
    const primaryCategoryName = primaryCat?.name || "";

    const doc = new Product({
      sku: String(sku).trim(),
      productName: String(productName).trim(),

      categories: categoryIds,
      categoryName: primaryCategoryName,

      color: Array.isArray(color) ? color : [],
      productImage,
      brand: String(brand || "").trim(),

      // ✅ prices
      buyPrice: parsedBuyPrice,
      regularPrice: parsedRegularPrice,
      price: parsedSellPrice, // sell price

      // ✅ delivery
      delivery: {
        type: deliveryType,
        area: deliveryType === "free_delivery" ? String(deliveryAreaRaw) : null,
      },

      status,
      stock: parsedStock,

      sizeWeight: parsedSizeWeight,

      details: String(details).trim(),
      longDetails: String(longDetails).trim(),
    });

    await doc.save();

    return res.status(201).json({
      message: "Product created successfully",
      product: doc,
    });
  } catch (error) {
    if (error?.code === 11000 && (error.keyPattern?.sku || error.keyValue?.sku)) {
      return res.status(409).json({
        message: "SKU already exists",
        errors: { sku: { message: "Duplicate SKU" } },
      });
    }
    if (error?.name === "ValidationError" && error?.errors) {
      const errors = {};
      for (const [k, v] of Object.entries(error.errors)) {
        errors[k] = { message: v.message };
      }
      return res.status(422).json({ message: "Validation error", errors });
    }
    console.error("Error adding product:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};




// -------------------- PUBLIC FEED BY CATEGORY (HOME SECTION) --------------------
const HOME_CATEGORY_MAP = {
  men: "Men Collection",
  women: "Women Collection",
  kids: "Kids Collection",
};

export const getPublicProductsByHomeCategory = async (req, res) => {
  try {
    const { slug } = req.params;      // men / women / kids
    const categoryName = HOME_CATEGORY_MAP[slug];

    if (!categoryName) {
      return res.status(400).json({ message: "Invalid category slug" });
    }

    const all = req.query.all === "true";
    const limitParam = parseInt(req.query.limit);
    const limit = all ? 0 : Math.min(limitParam || 12, 100);

    let query = Product.find(
      { categoryName },
      "productName productImage price discount brand categories"
    ).sort({ createdAt: -1 });

    if (limit > 0) {
      query = query.limit(limit);
    }

    const products = await query.lean();
    return res.json(products);   // শুধু array send করলাম
  } catch (e) {
    console.error("Error fetching home category products:", e);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};



// -------------------- PUBLIC FEED --------------------
export const getPublicProducts = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const products = await Product.find({}, "productName productImage price brand", { lean: true })
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json(products);
  } catch (e) {
    console.error("Error fetching public products:", e);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// -------------------- SINGLE --------------------
export const singleProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send({ message: "Product not found" });
    res.status(200).send(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

// -------------------- LIST (ADMIN) --------------------
export const getAllProducts = async (req, res) => {
  try {
    const page  = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const q     = (req.query.q || "").trim();

    let filter = {};
    if (q) {
      filter = { $text: { $search: q } };
      // fallback regex version available if you remove text index
    }

    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort(q ? { score: { $meta: "textScore" } } : { createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("sku productName price productImage updatedAt createdAt status")
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// -------------------- UPDATE (patched) --------------------
export const updateProductById = async (req, res) => {
  try {
    const id = req.params.id;

    // allowlist (same)
    const allowed = new Set([
      "sku",
      "productName",
      "categoryName",
      "price",
      "discount",
      "brand",
      "sizeWeight",
      "color",
      "details",
      "longDetails",
      "status",
      "stock",
      "productImage",
    ]);

    const body = req.body || {};
    const update = {};

    // strings → trim, but IGNORE if blank (so we don't wipe required fields with "")
    if ("sku" in body && isNonEmptyString(body.sku)) {
      update.sku = String(body.sku).trim();
    }
    if ("productName" in body && isNonEmptyString(body.productName)) {
      update.productName = String(body.productName).trim();
    }
    if ("categoryName" in body) {
      if (isNonEmptyString(body.categoryName)) {
        update.categoryName = String(body.categoryName).trim();
      }
      // else: ignore blank to avoid violating required:true
    }
    if ("brand" in body) {
      // brand required নয়, তাই ফাঁকা দিলে clear করাও যেতে পারে
      update.brand = isBlank(body.brand) ? "" : String(body.brand).trim();
    }
    if ("details" in body) {
      if (isNonEmptyString(body.details)) update.details = String(body.details).trim();
      // details schema-তে required—blank এলে ignore করাই নিরাপদ
    }
    if ("longDetails" in body) {
      if (isNonEmptyString(body.longDetails)) update.longDetails = String(body.longDetails).trim();
    }
    if ("status" in body && isNonEmptyString(body.status)) {
      update.status = String(body.status).trim();
    }

    // numbers → cast smartly
    // price: only set when a finite number is sent; blank means don't touch
    if ("price" in body && body.price !== "" && body.price != null) {
      const n = Number(body.price);
      update.price = n;
    }
    // discount/stock: allow 0; treat blank as "do not update"
    if ("discount" in body && body.discount !== "" && body.discount != null) {
      update.discount = toNumber(body.discount, 0);
    }
    if ("stock" in body && body.stock !== "" && body.stock != null) {
      update.stock = toNumber(body.stock, 0);
    }

    // arrays
    if ("productImage" in body) {
      const arr = Array.isArray(body.productImage) ? body.productImage : [];
      // productImage schema-তে required; কিন্তু update-এ না পাঠালে আগেরটাই থাকবে।
      // এখানে কেবল তখনই সেট করবো যখন client ইচ্ছাকৃতভাবে পাঠাবে।
      if (arr.length > 0) {
        update.productImage = arr.map((u) => String(u));
      } else if (Array.isArray(body.productImage) && body.productImage.length === 0) {
        // চাইলে clear করার সুযোগ রাখতে পারো; না চাইলে এই শাখা বাদ দাও
        update.productImage = [];
      }
    }

    if ("color" in body) {
      // রং খালি অ্যারে পাঠালে clear করবে; না পাঠালে আগেরটি থাকবে
      update.color = Array.isArray(body.color) ? body.color.map(String) : [];
    }

    if ("sizeWeight" in body) {
      const swInput = Array.isArray(body.sizeWeight) ? body.sizeWeight : [];
      // map + clean
      const mapped = swInput.map((x) => ({
        size: String(x?.size ?? "").trim(),
        // মিডলওয়্যারে নম্বর কাস্ট – ফাঁকা থাকলে 0
        weight: toNumber(x?.weight, 0),
      }));

      // completely empty rows বাদ
      const cleaned = mapped.filter(
        (row) => row.size !== "" || (Number.isFinite(row.weight) && row.weight > 0)
      );

      if (Array.isArray(body.sizeWeight) && body.sizeWeight.length === 0) {
        // explicit clear
        update.sizeWeight = [];
      } else if (cleaned.length > 0) {
        update.sizeWeight = cleaned;
      }
      // only-blank rows এলে (e.g., [{size:"", weight:""}]) -> ignore করে দিচ্ছি
    }

    // drop unknown keys (optional guard – রাখছি)
    for (const k of Object.keys(body)) {
      if (!allowed.has(k)) delete body[k];
    }

    // quick guards (only when keys exist in update)
    if ("price" in update && !(Number.isFinite(update.price) && update.price > 0)) {
      return res
        .status(422)
        .json({ message: "Validation error", errors: { price: { message: "Price must be > 0" } } });
    }
    if ("discount" in update && update.discount < 0) {
      return res
        .status(422)
        .json({ message: "Validation error", errors: { discount: { message: "Discount cannot be negative" } } });
    }
    if ("stock" in update && update.stock < 0) {
      return res
        .status(422)
        .json({ message: "Validation error", errors: { stock: { message: "Stock cannot be negative" } } });
    }

    // যদি update একেবারেই ফাঁকা পড়ে (সবকিছু ignore হয়ে যায়) — সেক্ষেত্রে 400 দেবো
    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true, context: "query" }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    if (error?.code === 11000 && (error.keyPattern?.sku || error.keyValue?.sku)) {
      return res.status(409).json({
        message: "SKU already exists",
        errors: { sku: { message: "Duplicate SKU" } },
      });
    }
    if (error?.name === "ValidationError" && error?.errors) {
      const errors = {};
      for (const [k, v] of Object.entries(error.errors)) errors[k] = { message: v.message };
      return res.status(422).json({ message: "Validation error", errors });
    }
    console.error("Error updating product:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
// -------------------- DELETE --------------------
export const deleteProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) return res.status(404).send({ message: "Product not found" });
    res.status(200).send({ message: "Product deleted successfully", product });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};


// -------------------- SEARCH (typeahead) --------------------

export const searchQuery = async (req, res) => {
  try {
    // frontend থেকে ?q=mouse বা ?query=mouse — দুটোই চলবে
    const qRaw = (req.query.q ?? req.query.query ?? "").toString().trim();
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);

    if (!qRaw) return res.status(400).json({ message: "Search query missing" });

    // বেস ফিল্টার (প্রয়োজনে status/useActive রাখো)
    const baseFilter = {}; // e.g., { status: "available" }

      let filter;
    let sort;

    // সহজ হিউরিস্টিক: text search ব্যবহার করতে চাইলে কোট/স্পেস থাকলেও ঠিক কাজ দেয়
    const useText = true; // চাইলে env/config দিয়ে কন্ট্রোল করো

    if (useText) {
      filter = {
        ...baseFilter,
        $text: { $search: qRaw },
      };
      sort = { score: { $meta: "textScore" } };
    } else {
      const rx = new RegExp(qRaw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter = {
        ...baseFilter,
        $or: [
          { productName: rx },
          { brand: rx },
          { categoryName: rx },
          { details: rx },
          { longDetails: rx },
        ],
      };
      sort = { createdAt: -1 };
    }

    const docs = await Product.find(filter)
      .sort(sort)
      .limit(limit)
      .select("_id productName productImage price brand categoryName") // ফ্রন্টএন্ড সাজেশনের দরকারি ফিল্ড
      .lean();

    return res.status(200).json(Array.isArray(docs) ? docs : []);
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({ message: "Error searching products" });
  }
};

// typeahead (title suggestions) — lightweight, 8 ta max
export const typeaheadSuggestions = async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.json([]);

  try {
    // 1) text index thakle $text use korte paro
    // const docs = await Product.find({ $text: { $search: q } })
    //   .select("productName -_id")
    //   .limit(8)
    //   .lean();

    // 2) regex fallback (case-insensitive)
    const docs = await Product.find(
      { productName: { $regex: q, $options: "i" } },
      { productName: 1, _id: 0 }
    )
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    res.json(docs.map(d => d.productName));
  } catch (e) {
    console.error("Typeahead error:", e);
    res.status(500).json({ message: "Error generating suggestions" });
  }
};


// -------------------- RELATED --------------------
export const getRelatedProducts = async (req, res) => {
  const { category } = req.params;
  const { excludeId } = req.query;

  try {
    const filter = { categoryName: category };
    if (excludeId && excludeId.match(/^[0-9a-fA-F]{24}$/)) {
      filter._id = { $ne: excludeId };
    }
    const relatedProducts = await Product.find(filter).limit(4);
    res.status(200).json(relatedProducts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching related products", error });
  }
};

// ---- NEW: stock table for dashboard ----
export const listStockTable = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 50), 200);

    // থ্রেশহোল্ড কনফিগ; চাইলে .env এ LOW_STOCK_THRESHOLD বসাও
    const lowThreshold = Number(process.env.LOW_STOCK_THRESHOLD || 50);
    const outThreshold = 0;

    // তোমার Product মডেলের ফিল্ড অনুযায়ী সিলেক্ট:
    // sku, productName, price, stock, createdAt
    const docs = await Product.find(
      {},
      "productName sku price stock createdAt",
      { lean: true }
    )
      .sort({ stock: 1 }) // কম স্টক আগে
      .limit(limit)
      .lean();

    // createdAt না থাকলে ObjectId থেকে timestamp বার করি
    const tsOf = (doc) =>
      doc?.createdAt ||
      new Date(parseInt(String(doc?._id).substring(0, 8), 16) * 1000);

    const items = (docs || []).map((p) => {
      const qty = Number(p.stock || 0);
      const status =
        qty <= outThreshold
          ? "Out of Stock"
          : qty <= lowThreshold
          ? "Low Stock"
          : "In Stock";

      return {
        id: p._id,
        name: p.productName,
        sku: p.sku || "#PFR-1045",
        price: Number(p.price || 0),
        qty,
        status,
        createdAt: tsOf(p),
      };
    });

    res.json({ items, thresholds: { low: lowThreshold, out: outThreshold } });
  } catch (e) {
    console.error("listStockTable error:", e);
    res.status(500).json({ message: "Failed to load stock table" });
  }
};
