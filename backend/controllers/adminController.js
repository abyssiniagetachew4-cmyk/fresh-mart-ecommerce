const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

/* =========================================================
   ADMIN DASHBOARD STATS
========================================================= */
exports.getDashboardStats = async (req, res) => {
  try {
    console.log('📊 Fetching admin dashboard stats...');
    
    /* ---------- BASIC COUNTS ---------- */
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' }); // FIXED: lowercase 'pending'
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    console.log(`📊 Counts - Orders: ${totalOrders}, Pending: ${pendingOrders}, Products: ${totalProducts}, Customers: ${totalCustomers}`);

    /* ---------- TOTAL REVENUE ---------- */
    const revenueResult = await Order.aggregate([
      { $match: { orderStatus: 'delivered' } }, // FIXED: lowercase 'delivered'
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;
    console.log(`💰 Total revenue: $${totalRevenue}`);

    /* ---------- LOW STOCK ---------- */
    const LOW_STOCK_THRESHOLD = 10;
    const lowStockCount = await Product.countDocuments({
      stock: { $lte: LOW_STOCK_THRESHOLD }
    });
    console.log(`⚠️ Low stock items: ${lowStockCount}`);

    /* ---------- RECENT ORDERS ---------- */
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name email')
      .select('orderNumber total orderStatus createdAt');

    console.log(`📦 Recent orders found: ${recentOrders.length}`);

    /* ---------- CUSTOMER ACTIVITY ---------- */
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newCustomersToday = await User.countDocuments({
      role: 'customer',
      createdAt: { $gte: today }
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeCustomersLast7Days = await Order.distinct('userId', {
      createdAt: { $gte: sevenDaysAgo }
    });

    console.log(`👥 New customers today: ${newCustomersToday}, Active last 7 days: ${activeCustomersLast7Days.length}`);

    /* ---------- RESPONSE ---------- */
    const response = {
      success: true,
      data: {
        totals: {
          totalOrders,
          totalProducts,
          totalCustomers,
          totalRevenue
        },
        alerts: {
          pendingOrders,
          lowStockCount
        },
        customerActivity: {
          newCustomersToday,
          activeCustomersLast7Days: activeCustomersLast7Days.length
        },
        recentOrders: recentOrders.map(order => ({
          _id: order._id,
          orderNumber: order.orderNumber,
          total: order.total,
          orderStatus: order.orderStatus,
          createdAt: order.createdAt,
          customer: order.userId ? {
            name: order.userId.name,
            email: order.userId.email
          } : null
        })),
        pendingTasks: {
          pendingOrders,
          lowStockProducts: lowStockCount
        }
      }
    };

    console.log('✅ Dashboard data prepared successfully');
    res.json(response);

  } catch (error) {
    console.error('❌ Dashboard error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard data: ' + error.message
    });
  }
};

/* =========================================================
   SALES DATA (DAILY / WEEKLY / MONTHLY)
========================================================= */
exports.getSalesData = async (req, res) => {
  try {
    const period = req.query.period || 'daily';
    console.log(`📈 Fetching sales data for period: ${period}`);
    
    const now = new Date();
    let startDate;
    let groupFormat;

    if (period === 'daily') {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      groupFormat = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
    } else if (period === 'weekly') {
      startDate = new Date();
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      groupFormat = {
        year: { $year: '$createdAt' },
        week: { $isoWeek: '$createdAt' }
      };
    } else if (period === 'monthly') {
      startDate = new Date();
      startDate.setMonth(now.getMonth() - 1);
      startDate.setHours(0, 0, 0, 0);
      groupFormat = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid period'
      });
    }

    const rawSales = await Order.aggregate([
      { $match: { orderStatus: 'delivered', createdAt: { $gte: startDate } } }, // FIXED: lowercase 'delivered'
      {
        $group: {
          _id: groupFormat,
          total: { $sum: '$total' },
          ordersCount: { $sum: 1 }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.week': 1,
          '_id.day': 1
        }
      }
    ]);

    console.log(`📈 Raw sales data points: ${rawSales.length}`);

    const salesData = rawSales.map(item => {
      let date = '';
      if (period === 'daily') {
        date = `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`;
      } else if (period === 'weekly') {
        date = `Week ${item._id.week}, ${item._id.year}`;
      } else {
        date = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      }

      return {
        date,
        total: item.total,
        ordersCount: item.ordersCount
      };
    });

    res.json({
      success: true,
      data: salesData
    });
  } catch (error) {
    console.error('❌ Sales data error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to load sales data: ' + error.message
    });
  }
};