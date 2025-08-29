const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const isCryptoPaid = async (comment: string): Promise<boolean> => {
  // const orders = await getOrders({ userId, status: "paid" });
  // return orders.length > 0;
  console.log("isCryptoPaid comment=", comment);
  await sleep(1000);

  return true;

  if (comment === "order:95f9b1ba4c3f") {
    //console.log("YESSS");
    return true;
  }

  return false;
};
