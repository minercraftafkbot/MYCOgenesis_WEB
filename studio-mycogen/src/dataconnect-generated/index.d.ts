import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface BlogPost_Key {
  id: UUIDString;
  __typename?: 'BlogPost_Key';
}

export interface Category_Key {
  id: UUIDString;
  __typename?: 'Category_Key';
}

export interface CreateSubscriberData {
  subscriber_insert: Subscriber_Key;
}

export interface ListOrdersData {
  orders: ({
    id: UUIDString;
    orderNumber: string;
    customerName?: string | null;
  } & Order_Key)[];
}

export interface ListProductsData {
  products: ({
    id: UUIDString;
    name: string;
    price: number;
  } & Product_Key)[];
}

export interface OrderItem_Key {
  id: UUIDString;
  __typename?: 'OrderItem_Key';
}

export interface Order_Key {
  id: UUIDString;
  __typename?: 'Order_Key';
}

export interface Product_Key {
  id: UUIDString;
  __typename?: 'Product_Key';
}

export interface Subscriber_Key {
  id: UUIDString;
  __typename?: 'Subscriber_Key';
}

export interface UpdateProductStockData {
  product_update?: Product_Key | null;
}

interface CreateSubscriberRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateSubscriberData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateSubscriberData, undefined>;
  operationName: string;
}
export const createSubscriberRef: CreateSubscriberRef;

export function createSubscriber(): MutationPromise<CreateSubscriberData, undefined>;
export function createSubscriber(dc: DataConnect): MutationPromise<CreateSubscriberData, undefined>;

interface ListProductsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListProductsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListProductsData, undefined>;
  operationName: string;
}
export const listProductsRef: ListProductsRef;

export function listProducts(): QueryPromise<ListProductsData, undefined>;
export function listProducts(dc: DataConnect): QueryPromise<ListProductsData, undefined>;

interface UpdateProductStockRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<UpdateProductStockData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<UpdateProductStockData, undefined>;
  operationName: string;
}
export const updateProductStockRef: UpdateProductStockRef;

export function updateProductStock(): MutationPromise<UpdateProductStockData, undefined>;
export function updateProductStock(dc: DataConnect): MutationPromise<UpdateProductStockData, undefined>;

interface ListOrdersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListOrdersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListOrdersData, undefined>;
  operationName: string;
}
export const listOrdersRef: ListOrdersRef;

export function listOrders(): QueryPromise<ListOrdersData, undefined>;
export function listOrders(dc: DataConnect): QueryPromise<ListOrdersData, undefined>;

