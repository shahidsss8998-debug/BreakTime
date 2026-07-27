/**
 * Stats Service
 * Provides dashboard statistics for the admin panel.
 * Queries orders for today's metrics: revenue, order counts by status.
 */
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

const ordersRef = collection(db, 'orders');

/**
 * Get today's start and end timestamps
 */
function getTodayRange() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  return {
    start: Timestamp.fromDate(startOfDay),
    end: Timestamp.fromDate(endOfDay)
  };
}

/**
 * Fetch today's order statistics
 * @returns {Object} { totalOrders, totalRevenue, statusCounts, recentOrders }
 */
export async function getTodayStats() {
  const { start, end } = getTodayRange();

  try {
    const q = query(
      ordersRef,
      where('createdAt', '>=', start),
      where('createdAt', '<=', end)
    );
    const snapshot = await getDocs(q);

    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + (order.total || 0), 0);

    const statusCounts = {
      placed: 0,
      confirmed: 0,
      preparing: 0,
      ready: 0,
      out_for_delivery: 0,
      delivered: 0,
      cancelled: 0
    };

    orders.forEach(order => {
      if (statusCounts[order.status] !== undefined) {
        statusCounts[order.status]++;
      }
    });

    return {
      totalOrders,
      totalRevenue,
      statusCounts,
      orders
    };
  } catch (error) {
    console.error('Error fetching today stats:', error);
    return {
      totalOrders: 0,
      totalRevenue: 0,
      statusCounts: {},
      orders: []
    };
  }
}
