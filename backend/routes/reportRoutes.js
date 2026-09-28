const express = require('express');
const router = express.Router();
const {
  getSalesReport,
  getCustomerReport,
  getInventoryReport,
  exportReport
} = require('../controllers/reportController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes are protected and admin-only
router.use(protect);
router.use(admin);

// Sales Reports
router.get('/sales', getSalesReport);
router.get('/sales/export', exportReport);

// Customer Reports
router.get('/customers', getCustomerReport);
router.get('/customers/export', exportReport);

// Inventory Reports
router.get('/inventory', getInventoryReport);
router.get('/inventory/export', exportReport);

module.exports = router;