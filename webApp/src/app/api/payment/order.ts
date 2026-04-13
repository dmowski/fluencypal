import { getDB } from '../config/firebase';
import { Order, OrderStatus } from './type';

export const createOrder = async (order: Order): Promise<Order> => {
  const db = getDB();
  await db.collection('orders').doc(order.id).set(order);
  return order;
};

export const getOrders = async ({
  userId,
  status,
}: {
  userId: string;
  status: OrderStatus;
}): Promise<Order[]> => {
  const db = getDB();
  const ordersDocs = await db
    .collection('orders')
    .where('userId', '==', userId)
    .where('status', '==', status)
    .get();

  const orders: Order[] = ordersDocs.docs.map((doc) => {
    const data: Order = doc.data() as Order;
    return data;
  });
  return orders;
};

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  const db = getDB();
  const orderRef = db.collection('orders').doc(orderId);
  const orderSnapshot = await orderRef.get();
  return orderSnapshot.exists ? (orderSnapshot.data() as Order) : null;
};

export const updateOrder = async (
  orderId: string,
  updates: Partial<Order>,
): Promise<Order | null> => {
  const db = getDB();
  const orderRef = db.collection('orders').doc(orderId);
  await orderRef.update(updates);
  const updatedOrder = await getOrderById(orderId);
  return updatedOrder;
};

export const getOrderByComment = async (comment: string): Promise<Order | null> => {
  const db = getDB();
  const ordersDocs = await db.collection('orders').where('comment', '==', comment).get();

  const orders: Order[] = ordersDocs.docs.map((doc) => {
    const data: Order = doc.data() as Order;
    return data;
  });

  return orders.length > 0 ? orders[0] : null;
};
