import { getDB } from "../config/firebase";
import { Invoice } from "./type";

export const createInvoice = async (invoice: Invoice): Promise<Invoice> => {
  const db = getDB();
  await db.collection("invoices").add(invoice);
  return invoice;
};

export const getInvoices = async (userId: string): Promise<Invoice[]> => {
  const db = getDB();
  const invoicesDocs = await db.collection("invoices").where("userId", "==", userId).get();

  const invoices: Invoice[] = invoicesDocs.docs.map((doc) => {
    const data: Invoice = doc.data() as Invoice;
    return data;
  });
  return invoices;
};
