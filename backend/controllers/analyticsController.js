const Order = require('../models/Order');
const Product = require('../models/Product');
const Accessory = require('../models/Accessory');

// Helper to get date range
function getDateRange(range) {
  const now = new Date();
  let start;
  if (range === 'day') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  } else if (range === 'week') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
  } else if (range === 'month') {
    start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  } else {
    start = new Date(0);
  }
  return { start, end: now };
}

exports.getSalesAnalytics = async (req, res) => {
  try {
    const { type = 'Product', category = '', brand = '', range = 'week' } = req.query;
    const { start, end } = getDateRange(range);
    // Fetch orders in date range, populate items.product
    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
      status: 'Delivered'
    }).populate('items.product');
    console.log('--- Delivered Orders in Range ---');
    orders.forEach(order => {
      console.log(`OrderID: ${order._id}, createdAt: ${order.createdAt}, status: ${order.status}`);
      (order.items || []).forEach(item => {
        console.log('  Item:', {
          name: item.name,
          productId: item.productId,
          price: item.price,
          quantity: item.quantity,
          product: item.product ? {
            _id: item.product._id,
            name: item.product.name,
            category: item.product.category,
            brand: item.product.brand
          } : null
        });
      });
    });
    // Aggregate sales by item
    const salesMap = {};
    // Preload all products and accessories for lookup
    const allProducts = await Product.find({});
    const allAccessories = await Accessory.find({});
    for (const order of orders) {
      for (const item of order.items || []) {
        let prod = null, acc = null;
        let key = item.product || item.id;
        // Try to resolve product or accessory from populated product ref
        if (item.product && item.product.category !== undefined) {
          // It's a Product
          prod = item.product;
        } else {
          prod = allProducts.find(p => String(p._id) === String(key));
          acc = allAccessories.find(a => String(a._id) === String(key));
          // If not found by ID, try by name for accessories
          if (!acc && item.name) {
            acc = allAccessories.find(a => a.name === item.name);
          }
        }
        let typeVal = prod ? 'Product' : acc ? 'Accessory' : (item.productType || type);
        if (acc) typeVal = 'Accessory';
        // Only count if type matches
        if ((typeVal === 'Product' && type === 'Product') || (typeVal === 'Accessory' && type === 'Accessory')) {
          // Always get name/category/brand from DB if possible
          let name = item.name;
          let category = item.category;
          let brand = item.brand;
          if (prod) {
            name = prod.name;
            category = prod.category;
            brand = prod.brand;
          } else if (acc) {
            name = acc.name;
            category = acc.category;
            brand = acc.brand;
          }
          if (req.query.category && category !== req.query.category) continue;
          if (req.query.brand && brand !== req.query.brand) continue;
          if (!salesMap[key]) {
            salesMap[key] = {
              id: key,
              name,
              category,
              brand,
              type: typeVal,
              totalSold: 0,
              totalRevenue: 0,
            };
          }
          salesMap[key].totalSold += item.quantity || 1;
          salesMap[key].totalRevenue += (item.price || 0) * (item.quantity || 1);
        }
      }
    }
    // Convert to array and sort by revenue
    const salesArr = Object.values(salesMap);
    salesArr.forEach(sale => {
      // Always set type to Accessory if found in accessories, else Product
      if (allAccessories.find(a => String(a._id) === String(sale.id) || a.name === sale.name)) {
        sale.type = 'Accessory';
      } else {
        sale.type = 'Product';
      }
    });
    salesArr.sort((a, b) => b.totalRevenue - a.totalRevenue);
    // Highest and lowest sale by revenue
    const highestSale = salesArr[0] || null;
    const lowestSale = salesArr.length > 0 ? salesArr[salesArr.length - 1] : null;
    res.json({
      success: true,
      data: {
        sales: salesArr,
        highestSale,
        lowestSale,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
