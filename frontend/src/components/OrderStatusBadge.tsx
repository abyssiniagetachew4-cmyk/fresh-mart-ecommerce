/**
 * OrderStatusBadge Component
 * Displays the order status with appropriate styling
 */

import React from 'react';
import { OrderStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Clock, Package, Truck, CheckCircle, XCircle } from 'lucide-react';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

// Status configuration with colors and icons
const statusConfig: Record<OrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType }> = {
  pending: {
    label: 'Pending',
    variant: 'outline',
    icon: Clock,
  },
  processing: {
    label: 'Processing',
    variant: 'secondary',
    icon: Package,
  },
  shipped: {
    label: 'Shipped',
    variant: 'default',
    icon: Truck,
  },
  delivered: {
    label: 'Delivered',
    variant: 'default',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'destructive',
    icon: XCircle,
  },
};

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
};

export default OrderStatusBadge;
