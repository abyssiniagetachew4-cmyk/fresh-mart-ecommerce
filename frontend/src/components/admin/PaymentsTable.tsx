import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function PaymentsTable() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/admin/payments');
      setPayments(data.payments || []);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const { data } = await axios.put(`http://localhost:5000/api/admin/orders/${orderId}/status`, { status: newStatus });
      console.log(data.message);
      fetchPayments(); // Refresh table
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  if (loading) return <p>Loading payments...</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Payments & Orders</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Order #</th>
            <th className="p-2 border">Customer</th>
            <th className="p-2 border">Amount ($)</th>
            <th className="p-2 border">Payment Status</th>
            <th className="p-2 border">Order Status</th>
            <th className="p-2 border">Change Status</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p._id}>
              <td className="p-2 border">{p.orderId?.orderNumber || '-'}</td>
              <td className="p-2 border">{p.orderId?.userId?.name || 'Guest'}</td>
              <td className="p-2 border">{p.amount.toFixed(2)}</td>
              <td className="p-2 border">{p.status}</td>
              <td className="p-2 border">{p.orderId?.orderStatus}</td>
              <td className="p-2 border">
                <select
                  value={p.orderId?.orderStatus}
                  onChange={(e) => handleStatusChange(p.orderId._id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
