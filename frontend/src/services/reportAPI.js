import axios from 'axios';

// Check if we're in development mode and backend is available
const isDevelopment = process.env.NODE_ENV === 'development';

// Use relative URL with proxy in development, absolute in production
const API_URL = isDevelopment ? '/api' : 'http://localhost:5000/api';

// Flag to check if backend is available
let isBackendAvailable = true;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling with mock data fallback
api.interceptors.response.use(
  (response) => {
    // If we get a successful response, backend is available
    isBackendAvailable = true;
    return response;
  },
  async (error) => {
    console.warn('API Error:', error.config?.url, error.message);
    
    // Check if backend is not available
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      isBackendAvailable = false;
      console.warn('Backend not available. Using mock data for:', error.config?.url);
      
      // Return mock data instead of throwing error
      return Promise.resolve({ 
        data: getMockResponse(error.config)
      });
    }
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Mock response generator
const getMockResponse = (config) => {
  const { url, params = {} } = config;
  
  // Generate mock data based on the endpoint
  if (url.includes('/reports/sales')) {
    return getMockSalesReport(params);
  }
  
  if (url.includes('/reports/customers')) {
    return getMockCustomerReport(params);
  }
  
  if (url.includes('/reports/inventory')) {
    return getMockInventoryReport(params);
  }
  
  if (url.includes('/reports/dashboard')) {
    return getMockDashboardSummary(params);
  }
  
  // Default mock response
  return {
    success: false,
    message: 'Backend not available - using mock data',
    data: {},
    mock: true
  };
};

// Mock sales report data
const getMockSalesReport = (params) => {
  const { startDate, endDate, reportType = 'daily' } = params;
  
  // Generate mock sales trend data
  const salesTrend = [];
  const days = reportType === 'daily' ? 30 : reportType === 'weekly' ? 12 : reportType === 'monthly' ? 12 : 5;
  
  for (let i = 0; i < days; i++) {
    salesTrend.push({
      _id: {
        year: 2024,
        month: Math.floor(i / 2) + 1,
        day: (i % 30) + 1
      },
      totalSales: Math.random() * 5000 + 1000,
      totalOrders: Math.floor(Math.random() * 50) + 10,
      totalItems: Math.floor(Math.random() * 200) + 50,
      averageOrderValue: Math.random() * 100 + 50
    });
  }
  
  return {
    success: true,
    data: {
      timePeriod: { startDate, endDate },
      overallMetrics: {
        totalRevenue: 125450.75,
        totalOrdersCount: 1245,
        avgOrderValue: 100.75,
        minOrderValue: 25.50,
        maxOrderValue: 1250.00
      },
      salesTrend,
      topProducts: [
        { _id: '1', productName: 'Organic Apples', totalQuantity: 450, totalRevenue: 2250.00, avgPrice: 5.00 },
        { _id: '2', productName: 'Fresh Milk', totalQuantity: 380, totalRevenue: 1520.00, avgPrice: 4.00 },
        { _id: '3', productName: 'Whole Wheat Bread', totalQuantity: 320, totalRevenue: 960.00, avgPrice: 3.00 }
      ],
      salesByCategory: [
        { _id: 'fruits', categoryName: 'Fruits & Vegetables', totalSales: 45000, totalItems: 9000, orderCount: 450 },
        { _id: 'dairy', categoryName: 'Dairy & Eggs', totalSales: 35000, totalItems: 7000, orderCount: 350 },
        { _id: 'bakery', categoryName: 'Bakery', totalSales: 25000, totalItems: 5000, orderCount: 250 }
      ],
      salesByPayment: [
        { _id: 'credit_card', totalSales: 75000, orderCount: 750, avgOrderValue: 100 },
        { _id: 'cash', totalSales: 25000, orderCount: 300, avgOrderValue: 83.33 },
        { _id: 'paypal', totalSales: 15000, orderCount: 150, avgOrderValue: 100 }
      ],
      reportType,
      mock: true
    }
  };
};

// Mock customer report data
const getMockCustomerReport = (params) => {
  const { startDate, endDate, customerType = 'all', limit = 10 } = params;
  
  // Generate mock customer acquisition data
  const customerAcquisition = [];
  for (let i = 0; i < 30; i++) {
    customerAcquisition.push({
      _id: {
        year: 2024,
        month: 3,
        day: i + 1
      },
      newCustomers: Math.floor(Math.random() * 10) + 2
    });
  }
  
  // Generate mock top customers
  const topCustomers = [];
  for (let i = 1; i <= limit; i++) {
    topCustomers.push({
      userId: `cust_${i}`,
      name: `Customer ${i}`,
      email: `customer${i}@example.com`,
      totalSpent: Math.random() * 5000 + 1000,
      orderCount: Math.floor(Math.random() * 50) + 5,
      averageOrderValue: Math.random() * 100 + 50,
      firstOrderDate: '2024-01-15T10:30:00Z',
      lastOrderDate: '2024-03-20T14:45:00Z'
    });
  }
  
  // Sort by total spent
  topCustomers.sort((a, b) => b.totalSpent - a.totalSpent);
  
  return {
    success: true,
    data: {
      timePeriod: { startDate, endDate },
      customerAcquisition,
      topCustomers,
      customerDemographics: {
        totalCustomers: 1250,
        activeCustomers: 890
      },
      clvData: topCustomers.map(cust => ({
        customerId: cust.userId,
        customerName: cust.name,
        totalRevenue: cust.totalSpent,
        orderCount: cust.orderCount,
        avgOrderValue: cust.averageOrderValue,
        clv: cust.totalSpent,
        customerSince: cust.firstOrderDate
      })),
      customerType,
      metrics: {
        totalCustomers: 1250,
        activeCustomers: 890,
        acquisitionRate: 145
      },
      mock: true
    }
  };
};

// Mock inventory report data
const getMockInventoryReport = (params) => {
  const { reportType = 'stock', lowStockThreshold = 10 } = params;
  
  const products = [
    { _id: '1', name: 'Organic Apples', category: 'Fruits', stockQuantity: 45, price: 5.00, costPrice: 3.50, expiryDate: '2024-04-15' },
    { _id: '2', name: 'Fresh Milk', category: 'Dairy', stockQuantity: 8, price: 4.00, costPrice: 2.50, expiryDate: '2024-03-25' },
    { _id: '3', name: 'Whole Wheat Bread', category: 'Bakery', stockQuantity: 3, price: 3.00, costPrice: 1.80, expiryDate: '2024-03-20' },
    { _id: '4', name: 'Bananas', category: 'Fruits', stockQuantity: 25, price: 2.50, costPrice: 1.50, expiryDate: '2024-03-22' },
    { _id: '5', name: 'Eggs', category: 'Dairy', stockQuantity: 15, price: 6.00, costPrice: 4.00, expiryDate: '2024-04-10' }
  ];
  
  if (reportType === 'stock') {
    return {
      success: true,
      data: {
        reportType,
        products,
        summary: {
          totalProducts: products.length,
          outOfStock: products.filter(p => p.stockQuantity <= 0).length,
          lowStock: products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= lowStockThreshold).length,
          inStock: products.filter(p => p.stockQuantity > lowStockThreshold).length,
          totalInventoryValue: products.reduce((sum, p) => sum + (p.stockQuantity * p.costPrice), 0),
          lowStockThreshold
        },
        mock: true
      }
    };
  }
  
  if (reportType === 'expiry') {
    const today = new Date();
    const expired = products.filter(p => new Date(p.expiryDate) < today);
    const expiringSoon = products.filter(p => {
      const expiryDate = new Date(p.expiryDate);
      const daysDiff = (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff >= 0 && daysDiff <= 7;
    });
    
    return {
      success: true,
      data: {
        reportType,
        products,
        summary: {
          total: products.length,
          expired: expired.length,
          expiringSoon: expiringSoon.length,
          totalExpiredValue: expired.reduce((sum, p) => sum + (p.stockQuantity * p.costPrice), 0)
        },
        categories: {
          expired,
          expiringSoon
        },
        mock: true
      }
    };
  }
  
  return {
    success: true,
    data: {
      reportType,
      products,
      summary: {
        totalProducts: products.length
      },
      mock: true
    }
  };
};

// Mock dashboard summary
const getMockDashboardSummary = () => {
  return {
    success: true,
    data: {
      salesMetrics: {
        totalRevenue: 125450.75,
        totalOrdersCount: 1245,
        avgOrderValue: 100.75
      },
      customerMetrics: {
        totalCustomers: 1250,
        activeCustomers: 890,
        acquisitionRate: 145
      },
      inventoryMetrics: {
        totalProducts: 150,
        outOfStock: 5,
        lowStock: 12,
        inStock: 133,
        totalInventoryValue: 45000
      },
      mock: true
    }
  };
};

const reportAPI = {
  // Sales Reports
  getSalesReport: async (params = {}) => {
    try {
      const response = await api.get('/reports/sales', { params });
      return response.data;
    } catch (error) {
      console.error('Sales report error:', error);
      return getMockSalesReport(params);
    }
  },

  // Customer Reports
  getCustomerReport: async (params = {}) => {
    try {
      const response = await api.get('/reports/customers', { params });
      return response.data;
    } catch (error) {
      console.error('Customer report error:', error);
      return getMockCustomerReport(params);
    }
  },

  // Inventory Reports
  getInventoryReport: async (params = {}) => {
    try {
      const response = await api.get('/reports/inventory', { params });
      return response.data;
    } catch (error) {
      console.error('Inventory report error:', error);
      return getMockInventoryReport(params);
    }
  },

  // Dashboard Summary
  getDashboardSummary: async (params = {}) => {
    try {
      const response = await api.get('/reports/dashboard', { params });
      return response.data;
    } catch (error) {
      console.error('Dashboard summary error:', error);
      return getMockDashboardSummary(params);
    }
  },

  // Export Reports (only works when backend is available)
  exportReport: async (type, format, params = {}) => {
    try {
      const response = await api.get(`/reports/${type}/export`, {
        params: { ...params, format },
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('Export error:', error);
      // Show notification that export requires backend
      alert('Export functionality requires backend server to be running.');
      throw error;
    }
  },

  // Helper function to download file
  downloadFile: (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Helper function to format params for API
  formatParams: (params) => {
    const formatted = { ...params };
    
    // Convert dates to ISO string if they are Date objects
    if (formatted.startDate instanceof Date) {
      formatted.startDate = formatted.startDate.toISOString().split('T')[0];
    }
    if (formatted.endDate instanceof Date) {
      formatted.endDate = formatted.endDate.toISOString().split('T')[0];
    }

    // Remove undefined/null values
    Object.keys(formatted).forEach(key => {
      if (formatted[key] === undefined || formatted[key] === null) {
        delete formatted[key];
      }
    });

    return formatted;
  },

  // Check if backend is available
  isBackendAvailable: () => isBackendAvailable
};

export default reportAPI;