const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const Category = require('../models/categoryModel');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

// @desc    Get sales report
// @route   GET /api/reports/sales
// @access  Private/Admin
const getSalesReport = asyncHandler(async (req, res) => {
  const {
    startDate,
    endDate,
    reportType = 'daily',
    categoryId,
    groupBy = 'day'
  } = req.query;

  // Set default date range if not provided (last 30 days)
  const defaultEndDate = new Date();
  const defaultStartDate = new Date();
  defaultStartDate.setDate(defaultStartDate.getDate() - 30);

  const filterStartDate = startDate ? new Date(startDate) : defaultStartDate;
  const filterEndDate = endDate ? new Date(endDate) : defaultEndDate;

  // Match stage for filtering
  const matchStage = {
    createdAt: {
      $gte: filterStartDate,
      $lte: filterEndDate
    },
    status: { $in: ['delivered', 'completed'] }
  };

  if (categoryId) {
    matchStage['items.category'] = categoryId;
  }

  try {
    // Aggregation pipeline for sales data
    const salesData = await Order.aggregate([
      { $match: matchStage },
      { $unwind: '$items' },
      {
        $group: {
          _id: getGroupByField(groupBy),
          totalSales: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
          totalOrders: { $sum: 1 },
          totalItems: { $sum: '$items.qty' },
          averageOrderValue: { $avg: '$totalPrice' },
          orders: { $push: '$$ROOT' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get overall metrics
    const overallMetrics = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' },
          totalOrdersCount: { $sum: 1 },
          avgOrderValue: { $avg: '$totalPrice' },
          minOrderValue: { $min: '$totalPrice' },
          maxOrderValue: { $max: '$totalPrice' }
        }
      }
    ]);

    // Get top selling products
    const topProducts = await Order.aggregate([
      { $match: matchStage },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.name' },
          totalQuantity: { $sum: '$items.qty' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
          avgPrice: { $avg: '$items.price' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);

    // Get sales by category
    const salesByCategory = await Order.aggregate([
      { $match: matchStage },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.category',
          categoryName: { $first: '$items.categoryName' },
          totalSales: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
          totalItems: { $sum: '$items.qty' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalSales: -1 } }
    ]);

    // Get sales by payment method
    const salesByPayment = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$paymentMethod',
          totalSales: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: '$totalPrice' }
        }
      },
      { $sort: { totalSales: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        timePeriod: {
          startDate: filterStartDate,
          endDate: filterEndDate
        },
        overallMetrics: overallMetrics[0] || {},
        salesTrend: salesData,
        topProducts,
        salesByCategory,
        salesByPayment,
        reportType,
        groupBy
      }
    });

  } catch (error) {
    res.status(500);
    throw new Error(`Error generating sales report: ${error.message}`);
  }
});

// @desc    Get customer report
// @route   GET /api/reports/customers
// @access  Private/Admin
const getCustomerReport = asyncHandler(async (req, res) => {
  const {
    startDate,
    endDate,
    customerType = 'all',
    minOrders = 1,
    limit = 10
  } = req.query;

  // Set default date range if not provided
  const defaultEndDate = new Date();
  const defaultStartDate = new Date();
  defaultStartDate.setMonth(defaultStartDate.getMonth() - 6); // Last 6 months

  const filterStartDate = startDate ? new Date(startDate) : defaultStartDate;
  const filterEndDate = endDate ? new Date(endDate) : defaultEndDate;

  try {
    // Customer acquisition over time
    const customerAcquisition = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: filterStartDate,
            $lte: filterEndDate
          },
          role: 'customer'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          newCustomers: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Get top customers by spending
    const topCustomers = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: filterStartDate,
            $lte: filterEndDate
          },
          status: { $in: ['delivered', 'completed'] }
        }
      },
      {
        $group: {
          _id: '$user',
          totalSpent: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 },
          firstOrderDate: { $min: '$createdAt' },
          lastOrderDate: { $max: '$createdAt' }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' },
      {
        $project: {
          userId: '$_id',
          name: '$userDetails.name',
          email: '$userDetails.email',
          totalSpent: 1,
          orderCount: 1,
          firstOrderDate: 1,
          lastOrderDate: 1,
          averageOrderValue: { $divide: ['$totalSpent', '$orderCount'] }
        }
      }
    ]);

    // Customer demographics
    const customerDemographics = await User.aggregate([
      {
        $match: {
          role: 'customer',
          createdAt: {
            $gte: filterStartDate,
            $lte: filterEndDate
          }
        }
      },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          activeCustomers: {
            $sum: {
              $cond: [{ $gt: ['$lastLogin', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] }, 1, 0]
            }
          }
        }
      }
    ]);

    // Customer lifetime value
    const clvData = await Order.aggregate([
      {
        $match: {
          status: { $in: ['delivered', 'completed'] }
        }
      },
      {
        $group: {
          _id: '$user',
          totalRevenue: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: '$totalPrice' },
          firstPurchaseDate: { $min: '$createdAt' },
          lastPurchaseDate: { $max: '$createdAt' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' },
      {
        $project: {
          customerId: '$_id',
          customerName: '$userDetails.name',
          totalRevenue: 1,
          orderCount: 1,
          avgOrderValue: 1,
          clv: '$totalRevenue',
          customerSince: '$firstPurchaseDate',
          daysAsCustomer: {
            $divide: [
              { $subtract: [new Date(), '$firstPurchaseDate'] },
              1000 * 60 * 60 * 24
            ]
          },
          purchaseFrequency: {
            $cond: [
              { $gt: ['$orderCount', 1] },
              {
                $divide: [
                  { $subtract: ['$lastPurchaseDate', '$firstPurchaseDate'] },
                  (1000 * 60 * 60 * 24 * ($orderCount - 1))
                ]
              },
              0
            ]
          }
        }
      },
      { $sort: { clv: -1 } },
      { $limit: 20 }
    ]);

    res.json({
      success: true,
      data: {
        timePeriod: {
          startDate: filterStartDate,
          endDate: filterEndDate
        },
        customerAcquisition,
        topCustomers,
        customerDemographics: customerDemographics[0] || {},
        clvData,
        customerType,
        metrics: {
          totalCustomers: customerDemographics[0]?.totalCustomers || 0,
          activeCustomers: customerDemographics[0]?.activeCustomers || 0,
          acquisitionRate: customerAcquisition.reduce((sum, day) => sum + day.newCustomers, 0)
        }
      }
    });

  } catch (error) {
    res.status(500);
    throw new Error(`Error generating customer report: ${error.message}`);
  }
});

// @desc    Get inventory report
// @route   GET /api/reports/inventory
// @access  Private/Admin
const getInventoryReport = asyncHandler(async (req, res) => {
  const { reportType = 'stock', lowStockThreshold = 10 } = req.query;

  try {
    let reportData;

    switch (reportType) {
      case 'stock':
        reportData = await getStockReport(lowStockThreshold);
        break;
      case 'expiry':
        reportData = await getExpiryReport();
        break;
      case 'movement':
        reportData = await getStockMovementReport();
        break;
      default:
        reportData = await getStockReport(lowStockThreshold);
    }

    res.json({
      success: true,
      data: {
        reportType,
        ...reportData
      }
    });

  } catch (error) {
    res.status(500);
    throw new Error(`Error generating inventory report: ${error.message}`);
  }
});

// @desc    Export report
// @route   GET /api/reports/:type/export
// @access  Private/Admin
const exportReport = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const { format = 'csv', ...filters } = req.query;

  try {
    let data;
    let filename;

    // Get data based on report type
    switch (type) {
      case 'sales':
        data = await getSalesDataForExport(filters);
        filename = `sales-report-${Date.now()}`;
        break;
      case 'customers':
        data = await getCustomerDataForExport(filters);
        filename = `customer-report-${Date.now()}`;
        break;
      case 'inventory':
        data = await getInventoryDataForExport(filters);
        filename = `inventory-report-${Date.now()}`;
        break;
      default:
        res.status(400);
        throw new Error('Invalid report type for export');
    }

    // Export in requested format
    switch (format.toLowerCase()) {
      case 'csv':
        exportToCSV(res, data, filename);
        break;
      case 'excel':
        exportToExcel(res, data, filename);
        break;
      case 'pdf':
        await exportToPDF(res, data, filename, type);
        break;
      default:
        res.status(400);
        throw new Error('Unsupported export format. Use csv, excel, or pdf');
    }

  } catch (error) {
    res.status(500);
    throw new Error(`Error exporting report: ${error.message}`);
  }
});

// Helper functions
const getGroupByField = (groupBy) => {
  switch (groupBy) {
    case 'hour':
      return {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' },
        hour: { $hour: '$createdAt' }
      };
    case 'day':
      return {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
    case 'week':
      return {
        year: { $year: '$createdAt' },
        week: { $week: '$createdAt' }
      };
    case 'month':
      return {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      };
    case 'year':
      return { year: { $year: '$createdAt' } };
    default:
      return {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
  }
};

const getStockReport = async (lowStockThreshold) => {
  const products = await Product.find()
    .populate('category', 'name')
    .sort({ stockQuantity: 1 });

  const totalProducts = products.length;
  const outOfStock = products.filter(p => p.stockQuantity <= 0).length;
  const lowStock = products.filter(p => 
    p.stockQuantity > 0 && p.stockQuantity <= lowStockThreshold
  ).length;
  const inStock = totalProducts - outOfStock - lowStock;

  const totalInventoryValue = products.reduce((sum, product) => {
    return sum + (product.stockQuantity * (product.costPrice || product.price * 0.7));
  }, 0);

  return {
    products,
    summary: {
      totalProducts,
      outOfStock,
      lowStock,
      inStock,
      totalInventoryValue,
      lowStockThreshold
    }
  };
};

const getExpiryReport = async () => {
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  const nextMonth = new Date();
  nextMonth.setMonth(today.getMonth() + 1);

  const products = await Product.find({
    expiryDate: { $exists: true, $ne: null }
  }).sort({ expiryDate: 1 });

  const expired = products.filter(p => new Date(p.expiryDate) < today);
  const expiringThisWeek = products.filter(p => {
    const expiry = new Date(p.expiryDate);
    return expiry >= today && expiry <= nextWeek;
  });
  const expiringThisMonth = products.filter(p => {
    const expiry = new Date(p.expiryDate);
    return expiry > nextWeek && expiry <= nextMonth;
  });

  return {
    products,
    summary: {
      total: products.length,
      expired: expired.length,
      expiringThisWeek: expiringThisWeek.length,
      expiringThisMonth: expiringThisMonth.length
    },
    categories: {
      expired,
      expiringThisWeek,
      expiringThisMonth
    }
  };
};

const getStockMovementReport = async () => {
  // This would require a stock movement/transaction model
  // For now, return basic product movement
  const products = await Product.find()
    .select('name stockQuantity price salesCount createdAt')
    .sort({ salesCount: -1 });

  return {
    products,
    summary: {
      totalProducts: products.length,
      topMoving: products.slice(0, 10),
      slowMoving: products.slice(-10).reverse()
    }
  };
};

const getSalesDataForExport = async (filters) => {
  // Implement based on your export needs
  return { message: 'Sales export data' };
};

const getCustomerDataForExport = async (filters) => {
  // Implement based on your export needs
  return { message: 'Customer export data' };
};

const getInventoryDataForExport = async (filters) => {
  // Implement based on your export needs
  return { message: 'Inventory export data' };
};

const exportToCSV = (res, data, filename) => {
  try {
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(data);
    
    res.header('Content-Type', 'text/csv');
    res.attachment(`${filename}.csv`);
    res.send(csv);
  } catch (error) {
    throw new Error(`CSV export failed: ${error.message}`);
  }
};

const exportToExcel = (res, data, filename) => {
  // For Excel export, you'd typically use a library like exceljs
  // This is a placeholder implementation
  res.json({
    success: true,
    message: 'Excel export requires exceljs library',
    data,
    filename: `${filename}.xlsx`
  });
};

const exportToPDF = async (res, data, filename, reportType) => {
  // For PDF export, you'd use pdfkit
  // This is a placeholder implementation
  res.json({
    success: true,
    message: 'PDF export requires pdfkit library',
    data,
    filename: `${filename}.pdf`,
    reportType
  });
};

module.exports = {
  getSalesReport,
  getCustomerReport,
  getInventoryReport,
  exportReport
};