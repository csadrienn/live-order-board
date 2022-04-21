import {
  placeOrder,
  SELL,
  BUY,
  IOrder,
  IOrderContent,
  cancelOrder,
  getOrderInformation
} from '../main';

const generateRandomNumberId = () => {
  return Math.floor(Math.random() * 10000 + 1).toString();
};

const buildOrder = (orderProperties: Partial<IOrder> = {}): IOrder => {
  const userId = generateRandomNumberId();
  const orderId = generateRandomNumberId();
  const defaultOrder: IOrder = {
    orderType: SELL,
    price: 15.5,
    quantity: 100,
    coinType: 'Ethereum',
    userId,
    orderId
  };
  return {
    ...defaultOrder,
    ...orderProperties
  };
};

const testOrders = [
  buildOrder(),
  buildOrder({ price: 23.6, quantity: 102.5 }),
  buildOrder({ quantity: 441.8 }),
  buildOrder({ orderType: BUY }),
  buildOrder({ orderType: BUY, quantity: 23.6 }),
  buildOrder({ orderType: BUY, price: 4.2, quantity: 33.5 })
];

describe('Placing an order', () => {
  const newOrder: IOrderContent = {
    orderType: SELL,
    price: 8.6,
    quantity: 120.2,
    coinType: 'Ethereum',
    userId: 'user10'
  };

  it('The new array should have one more item than the original', () => {
    const newOrders = placeOrder(testOrders, newOrder);
    expect(newOrders.length).toBe(testOrders.length + 1);
  });

  it("The new array's last item should contain the all of the data of the added order", () => {
    const newOrders = placeOrder(testOrders, newOrder);
    const lastItem: IOrder = newOrders[newOrders.length - 1];
    const keys = Object.keys(newOrder) as (keyof IOrderContent)[];
    keys.forEach((key) => {
      expect(lastItem[key]).toBe(newOrder[key]);
    });
  });

  it("The new array's last item should contain a randomly generated order id", () => {
    const newOrders = placeOrder(testOrders, newOrder);
    const lastItem = newOrders[newOrders.length - 1];
    expect(lastItem.orderId).not.toBeUndefined();
    expect(lastItem.orderId).toEqual(expect.any(String));
  });
});

describe('Cancelling an order from an empty array of orders', () => {
  it("The array's length should remain 0", () => {
    const testOrders: IOrder[] = [];
    const newOrders = cancelOrder(testOrders, 'order0');
    expect(newOrders.length).toBe(0);
  });
});

describe('Calling the cancelOrder function with not existing orderId', () => {
  it('The new array length should remain the same', () => {
    const newOrders = cancelOrder(testOrders, 'wrongId');
    expect(newOrders.length).toBe(testOrders.length);
  });
  it('The new array should be equal to the original one.', () => {
    const newOrders = cancelOrder(testOrders, 'wrongId');
    expect(newOrders).toEqual(testOrders);
  });
});

describe('Order cancellation', () => {
  const orderToCancel = buildOrder();
  const cancelTestOrders = [orderToCancel, ...testOrders];

  it('The new array should have one less item than the original', () => {
    const newOrders = cancelOrder(cancelTestOrders, orderToCancel.orderId);
    expect(newOrders.length).toBe(cancelTestOrders.length - 1);
  });
  it(`The new array should not contain the element with the id ${orderToCancel.orderId} (the first item in the original array)`, () => {
    const newOrders = cancelOrder(cancelTestOrders, orderToCancel.orderId);
    const firstElement = cancelTestOrders.shift();
    expect(newOrders[0]).not.toEqual(firstElement);
  });
  it(`The new array should contain the items of the original array except the one with the id ${orderToCancel.orderId} (the first item in the original array)`, () => {
    const orders = [orderToCancel, ...testOrders];
    const newOrders = cancelOrder(orders, orderToCancel.orderId);
    orders.shift();
    expect(newOrders).toEqual(orders);
  });
});

describe('Displaying the summary of the BUY orders where all the orders have the same coin type', () => {
  it('The returned array should not contain SELL orders', () => {
    const buyBoard = getOrderInformation(testOrders, BUY);
    const orderTypes = buyBoard.map((order) => order.orderType);
    expect(orderTypes.includes(SELL)).toBe(false);
  });

  it('The returned array should only contain BUY orders', () => {
    const buyBoard = getOrderInformation(testOrders, BUY);
    const orderTypes = buyBoard.map((order) => order.orderType);
    orderTypes.forEach((type) => {
      expect(type).toBe(BUY);
    });
  });

  it('The returned array should contain two items when the original one has three items with the same price (out of four)', () => {
    const buyBoard = getOrderInformation(testOrders, BUY);
    expect(buyBoard.length).toBe(2);
  });

  it('The returned array should contain the summary quantity of the items with the same price', () => {
    const buyBoard = getOrderInformation(testOrders, BUY);
    const samePriceItem = buyBoard.find(
      (boardItem) => boardItem.price === 15.5
    );
    expect(samePriceItem?.quantity).toBe(123.6);
  });

  it('The items in the array should be in descending order by price', () => {
    const buyBoard = getOrderInformation(testOrders, BUY);
    const isSortedDesc = buyBoard.every(
      (element, index, array) => !index || array[index - 1] <= element
    );
    expect(isSortedDesc).toBe(true);
  });
});

describe('Displaying the summary of the SELL orders where all the orders have the same coin type', () => {
  it('The returned array should not contain BUY orders', () => {
    const buyBoard = getOrderInformation(testOrders, SELL);
    const orderTypes = buyBoard.map((order) => order.orderType);
    expect(orderTypes.includes(BUY)).toBe(false);
  });

  it('The returned array should only contain SELL orders', () => {
    const buyBoard = getOrderInformation(testOrders, SELL);
    const orderTypes = buyBoard.map((order) => order.orderType);
    orderTypes.forEach((type) => {
      expect(type).toBe(SELL);
    });
  });

  it('The returned array should contain three items when the original one has two items with the same price (out of four)', () => {
    const buyBoard = getOrderInformation(testOrders, SELL);
    expect(buyBoard.length).toBe(2);
  });

  it('The returned array should contain the summary quantity of the items with the same price', () => {
    const buyBoard = getOrderInformation(testOrders, SELL);
    const samePriceItem = buyBoard.find(
      (boardItem) => boardItem.price === 15.5
    );
    expect(samePriceItem?.quantity).toBe(541.8);
  });

  it('The items in the array should be in ascending order by price', () => {
    const buyBoard = getOrderInformation(testOrders, SELL);
    const isSortedAsc = buyBoard.every(
      (element, index, array) => !index || array[index - 1] <= element
    );
    expect(isSortedAsc).toBe(true);
  });
});
