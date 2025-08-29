import { getDB } from "../config/firebase";
import { Order } from "./type";

export const createOrder = async (order: Order): Promise<Order> => {
  const db = getDB();
  await db.collection("orders").add(order);
  return order;
};

export const getOrders = async (userId: string): Promise<Order[]> => {
  const db = getDB();
  const ordersDocs = await db.collection("orders").where("userId", "==", userId).get();

  const orders: Order[] = ordersDocs.docs.map((doc) => {
    const data: Order = doc.data() as Order;
    return data;
  });
  return orders;
};
