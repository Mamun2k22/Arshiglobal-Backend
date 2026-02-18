import { User, Order, Product } from "../model/index.model.js";
import Invoice from "../model/invoice.model.js";
import ShippingSettings from "../model/shippingSettings.model.js";
import { buildProductsMap, priceCart, computeShipping } from "../utils/pricing.js"; // <- add computeShipping

export const placeOrder = async (req, res) => {
  try {
    const {
      cartItems,                 // [{ productId, quantity, selectedSize, ... }]
      shippingOption,            // "inside" | "outside"
      paymentMethod,
      customer,
      userId,
      address,
      district,                  // ✅ frontend থেকে পাঠাবে
    } = req.body;

    // --- guard ---
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // --- DB থেকে প্রোডাক্ট ও প্রাইস ---
    const ids = cartItems.map((x) => x.productId);
    const products = await Product.find({ _id: { $in: ids } }).lean();
    const map = buildProductsMap(products);

    // --- priceCart দিয়ে subtotal/discount/total (product only) ---
    const priced = priceCart({
      items: cartItems.map((x) => ({ productId: x.productId, quantity: x.quantity })), // ⚠️ ফ্রন্টএন্ডের price ব্যবহার করছি না
      productsById: map,
      // চাইলে future-এ coupon object পাঠিয়ে এখানে ডিসকাউন্টও ভ্যালিডেট করতে পারো
    });

    // --- Shipping settings নিয়ে server-side shipping হিসাব ---
    const settings = (await ShippingSettings.findOne().lean()) || {};
    const ship = computeShipping({
      subtotal: priced.total,           // product total after coupon
      selectedOption: shippingOption,
      district: district || "",
      settings,
    });

    const shippingCost = ship.shippingFinal;           // ⚠️ server authoritative
    const totalCost    = priced.total + shippingCost;  // ⚠️ server authoritative

    // --- Order.products বানাও (DB প্রাইস জানা না থাকলে priced.lines থেকে নিতে পারো) ---
    const productsPayload = cartItems.map((item) => {
      const p = products.find((pp) => String(pp._id) === String(item.productId));
      if (!p) throw new Error(`Product ${item.productId} not found`);
      // লকড প্রাইস হিসেবে priced.lines থেকে value নিতে চাইলে:
      const ln = priced.lines.find((l) => String(l.productId) === String(item.productId));
      const unit = ln ? Math.round(ln.unit) : Number(p.price || 0);
      return {
        product: p._id,
        quantity: Number(item.quantity) || 1,
        price: unit,                          // unit price at order time
        selectedSize: item.selectedSize || null,
        selectedWeight: item.selectedWeight || null,
        selectedColor: item.selectedColor || null,
      };
    });

    const newOrder = new Order({
      user: userId,
      products: productsPayload,
      totalPrice: totalCost,                // ⚠️ server computed
      shippingCost,
      shippingOption,
      paymentMethod,
      district: district || undefined,      // চাইলে মডেলে এ ফিল্ড যোগ করো
      customer: {
        name: customer?.name || user.name,
        email: customer?.email || user.email,
        mobile: customer?.mobile || user.mobile,
      },
      address,
      pricing: {
        // ইচ্ছা করলে order doc-এ pricing snapshot রেখে দাও
        subtotal: priced.subtotal,
        couponTotal: priced.couponTotal,
        productTotalAfterDiscount: priced.total,
        shippingBase: ship.shippingBase,
        freeThresholdUsed: ship.thresholdUsed || 0,
        inCampaign: ship.inCampaign || false,
      },
    });

    await newOrder.save();

    // --- Auto-invoice (unchanged) ---
    (async () => {
      try {
        const exists = await Invoice.findOne({ orderId: newOrder._id }).lean();
        if (exists) return;

        const items = (newOrder.products || []).map((it) => {
          const qty = it?.quantity ?? 1;
          const price = it?.price ?? 0;
          return {
            productId: it?.product,
            name: "",
            qty,
            price,
            subtotal: qty * price,
          };
        });
        const itemsTotal = items.reduce((s, x) => s + (x.subtotal || 0), 0);
        const totalAmount = itemsTotal + (newOrder.shippingCost || 0);

        await Invoice.create({
          orderId: newOrder._id,
          userId: newOrder.user,
          items,
          totalAmount,
          status: "unpaid",
          issuedAt: new Date(),
        });
      } catch (e) {
        console.error("auto-invoice failed:", e?.message);
      }
    })();

    res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    res.status(500).json({ message: "Error placing order", error: error.message });
  }
};


// Get all orders for a user
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params; // Get userId from URL params

    // Populate 'products.product' and include 'productName' and 'productImage' from the Product schema
    const orders = await Order.find({ user: userId }).populate({
      path: "products.product",
      select: "productName productImage", // Selecting specific fields to populate
    });

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    res.status(200).json(orders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching orders", error: error.message });
  }
};

// Get a specific order by ID
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate("products.product");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching order", error: error.message });
  }
};

// Get all orders (admin or for dashboard)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate({
        path: "products.product",
        select: "productName productImage",
      })
      .populate({
        path: "user",
        select: "name email mobile",
      });

    res.status(200).json(orders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching all orders", error: error.message });
  }
};

// Update an order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    await order.save();
    res.status(200).json({ message: "Order updated successfully", order });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating order", error: error.message });
  }
};

export const getPendingOrders = async (req, res) => {
  try {
    const orders = await Order.find({ orderStatus: "pending" })
      .populate({ path: "products.product", select: "productName productImage sku" })
      .populate({ path: "user", select: "name email mobile" })
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pending orders", error: error.message });
  }
};

export const getConfirmedOrders = async (req, res) => {
  try {
    const orders = await Order.find({ orderStatus: "processing" })
      .populate({ path: "products.product", select: "productName productImage sku" })
      .populate({ path: "user", select: "name email mobile" })
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching confirmed orders", error: error.message });
  }
};

export const getCancelledOrders = async (req, res) => {
  try {
    const orders = await Order.find({ orderStatus: "cancelled" })
      .populate({ path: "products.product", select: "productName productImage sku" })
      .populate({ path: "user", select: "name email mobile" })
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cancelled orders", error: error.message });
  }
};
export const getDeliveredOrders = async (req, res) => {
  try {
    const orders = await Order.find({ orderStatus: "delivered" })
      .populate({ path: "products.product", select: "productName productImage sku" })
      .populate({ path: "user", select: "name email mobile" })
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching delivered orders", error: error.message });
  }
};

// Cancel or delete an order
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.orderStatus = "cancelled";
    await order.save();

    res.status(200).json({ message: "Order cancelled successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling order", error: error.message });
  }
};

export const getSalesReport = async (req, res) => {
  try {
    const {
      from,          // YYYY-MM-DD
      to,            // YYYY-MM-DD
      status,        // delivered | processing | pending | cancelled | all
      paymentStatus, // paid | unpaid | partial | refunded | all
      groupBy = "day" // day | month
    } = req.query;

    const match = {};

    // date range (createdAt)
    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(`${from}T00:00:00.000Z`);
      if (to) match.createdAt.$lte = new Date(`${to}T23:59:59.999Z`);
    }

    if (status && status !== "all") match.orderStatus = status;
    if (paymentStatus && paymentStatus !== "all") match.paymentStatus = paymentStatus;

    const fmt = groupBy === "month" ? "%Y-%m" : "%Y-%m-%d";

    const rows = await Order.aggregate([
      { $match: match },
      {
        $addFields: {
          itemsCount: {
            $sum: {
              $map: {
                input: "$products",
                as: "p",
                in: { $ifNull: ["$$p.quantity", 0] }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: fmt, date: "$createdAt" } },
          orders: { $sum: 1 },
          grossSales: { $sum: { $ifNull: ["$totalPrice", 0] } },      // includes shipping (your system)
          shipping: { $sum: { $ifNull: ["$shippingCost", 0] } },
          itemsSold: { $sum: { $ifNull: ["$itemsCount", 0] } },
          uniqueCustomers: { $addToSet: "$customer.mobile" },
        }
      },
      {
        $project: {
          _id: 0,
          period: "$_id",
          orders: 1,
          grossSales: 1,
          shipping: 1,
          itemsSold: 1,
          uniqueCustomers: { $size: { $setDifference: ["$uniqueCustomers", [null, ""]] } },
        }
      },
      { $sort: { period: 1 } }
    ]);

    // overall summary
    const summaryAgg = await Order.aggregate([
      { $match: match },
      {
        $addFields: {
          itemsCount: {
            $sum: {
              $map: { input: "$products", as: "p", in: { $ifNull: ["$$p.quantity", 0] } }
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          orders: { $sum: 1 },
          grossSales: { $sum: { $ifNull: ["$totalPrice", 0] } },
          shipping: { $sum: { $ifNull: ["$shippingCost", 0] } },
          itemsSold: { $sum: { $ifNull: ["$itemsCount", 0] } },
          uniqueCustomers: { $addToSet: "$customer.mobile" },
        }
      },
      {
        $project: {
          _id: 0,
          orders: 1,
          grossSales: 1,
          shipping: 1,
          itemsSold: 1,
          uniqueCustomers: { $size: { $setDifference: ["$uniqueCustomers", [null, ""]] } },
        }
      }
    ]);

    const summary = summaryAgg?.[0] || {
      orders: 0, grossSales: 0, shipping: 0, itemsSold: 0, uniqueCustomers: 0
    };

    res.status(200).json({ summary, rows });
  } catch (error) {
    res.status(500).json({ message: "Error generating sales report", error: error.message });
  }
};

// export const getDashboardSummary = async (req, res) => {
//   try {
//     // status mapping:
//     // pending   -> New Orders
//     // processing-> Confirm Orders
//     // delivered -> Delivery Orders
//     // cancelled -> Cancel Orders

//     const [rows] = await Order.aggregate([
//       {
//         $group: {
//           _id: null,
//           totalOrders: { $sum: 1 },
//           pendingOrders: {
//             $sum: { $cond: [{ $eq: ["$orderStatus", "pending"] }, 1, 0] },
//           },
//           confirmOrders: {
//             $sum: { $cond: [{ $eq: ["$orderStatus", "processing"] }, 1, 0] },
//           },
//           deliveredOrders: {
//             $sum: { $cond: [{ $eq: ["$orderStatus", "delivered"] }, 1, 0] },
//           },
//           cancelledOrders: {
//             $sum: { $cond: [{ $eq: ["$orderStatus", "cancelled"] }, 1, 0] },
//           },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           totalOrders: 1,
//           pendingOrders: 1,
//           confirmOrders: 1,
//           deliveredOrders: 1,
//           cancelledOrders: 1,
//         },
//       },
//     ]);

//     const data = rows || {
//       totalOrders: 0,
//       pendingOrders: 0,
//       confirmOrders: 0,
//       deliveredOrders: 0,
//       cancelledOrders: 0,
//     };

//     res.status(200).json({ success: true, data });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Error fetching dashboard summary",
//       error: error.message,
//     });
//   }
// };
export const getDashboardSummary = async (req, res) => {
  try {
    // Users + Products count
    const [totalUsers, totalProducts] = await Promise.all([
      User.countDocuments({}),
      Product.countDocuments({}),
    ]);

    // Orders + Status counts + Total Sales
    const [rows] = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },

          pendingOrders: {
            $sum: { $cond: [{ $eq: ["$orderStatus", "pending"] }, 1, 0] },
          },
          confirmOrders: {
            $sum: { $cond: [{ $eq: ["$orderStatus", "processing"] }, 1, 0] },
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ["$orderStatus", "delivered"] }, 1, 0] },
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ["$orderStatus", "cancelled"] }, 1, 0] },
          },

          // ✅ Sales = sum(totalPrice)
          totalSales: { $sum: { $ifNull: ["$totalPrice", 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          totalOrders: 1,
          pendingOrders: 1,
          confirmOrders: 1,
          deliveredOrders: 1,
          cancelledOrders: 1,
          totalSales: 1,
        },
      },
    ]);

    const agg = rows || {
      totalOrders: 0,
      pendingOrders: 0,
      confirmOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0,
      totalSales: 0,
    };

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        ...agg,
      },
    });
  } catch (error) {
    console.log("getDashboardSummary error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching dashboard summary",
      error: error.message,
    });
  }
};


export const getDashboardStats = async (req, res) => {
  try {
    const [totalProducts, totalUsers] = await Promise.all([
      Product.countDocuments({}),
      User.countDocuments({}),
    ]);

    const [agg] = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSales: { $sum: { $ifNull: ["$totalPrice", 0] } },
        },
      },
      { $project: { _id: 0, totalOrders: 1, totalSales: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalUsers,
        totalOrders: agg?.totalOrders || 0,
        totalSales: agg?.totalSales || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
