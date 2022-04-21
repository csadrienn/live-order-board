import { v4 as uuidv4 } from 'uuid';

export const SELL = 'SELL';
export const BUY = 'BUY';

export type OrderType = 'SELL' | 'BUY';

export interface IBoardItem {
  quantity: number;
  price: number;
  orderType: OrderType;
}

export interface IOrderContent extends IBoardItem {
  userId: string;
  coinType: string;
}

export interface IOrder extends IOrderContent {
  orderId: string;
}

interface IOptions {
  precision?: number;
  maxListed?: number;
}

// returns a new array of orders containing the given order as well
export const placeOrder = (
  orderBoard: IOrder[],
  orderContent: IOrderContent
): IOrder[] => {
  const id = uuidv4();
  const order: IOrder = { ...orderContent, orderId: id };
  return [...orderBoard, order];
};

// returns a new array of orders without the order with the given id
export const cancelOrder = (
  orderBoard: IOrder[],
  orderId: string
): IOrder[] => {
  return orderBoard.filter((order) => order.orderId !== orderId);
};

//returns an array of board items with SELL or BUY order type
export const getOrderInformation = (
  orders: IOrder[],
  orderType: OrderType,
  options: IOptions = {}
): IBoardItem[] => {
  const funcOptions = { precision: 2, maxListed: 10, ...options };
  const precision = funcOptions.precision;
  const maxListed = funcOptions.maxListed;
  const initArr: IBoardItem[] = [];

  return orders
    .filter((order) => order.orderType === orderType) //filters by order type
    .reduce((res, order) => {
      //returns an array of board items
      const samePriceIndex = findSamePrice(res, order);
      const { orderType, price, quantity } = order;
      if (samePriceIndex === -1) {
        res.push({ orderType, quantity, price });
      } else {
        //increases the quantity if the prices are the same
        res[samePriceIndex].quantity = parseFloat(
          (res[samePriceIndex].quantity + order.quantity).toFixed(precision)
        );
      }
      return res;
    }, initArr)
    .sort((item1, item2) => {
      return orderType === SELL
        ? item1.price - item2.price
        : item2.price - item1.price;
    })
    .slice(0, maxListed);
};

const findSamePrice = (boardArray: IBoardItem[], order: IOrderContent) => {
  return boardArray.findIndex((boardItem) => boardItem.price === order.price);
};
