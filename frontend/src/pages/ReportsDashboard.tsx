import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Alert
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ReportsDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [salesData, setSalesData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const salesRes = await axios.get('/api/reports/sales');
        const categoryRes = await axios.get('/api/reports/categories');

        setSalesData(salesRes.data);
        setCategoryData(categoryRes.data);
      } catch (err) {
        setError('Failed to load reports');
      }
    };

    fetchReports();
  }, []);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" gutterBottom>
        Reports Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* SALES LINE CHART */}
        <Grid item xs={12} md={8} component="div">
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sales Over Time
            </Typography>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="totalSales"
                  stroke="#1976d2"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* CATEGORY PIE CHART */}
        <Grid item xs={12} md={4} component="div">
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sales by Category
            </Typography>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {categoryData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* ACTION BUTTON */}
        <Grid item xs={12} component="div">
          <Button
            variant="contained"
            onClick={() => navigate('/admin')}
          >
            Back to Admin Dashboard
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ReportsDashboard;
