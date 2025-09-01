import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'mycogenesisweb',
  location: 'us-central1'
};

export const createSubscriberRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'createSubscriber');
}
createSubscriberRef.operationName = 'createSubscriber';

export function createSubscriber(dc) {
  return executeMutation(createSubscriberRef(dc));
}

export const listProductsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'listProducts');
}
listProductsRef.operationName = 'listProducts';

export function listProducts(dc) {
  return executeQuery(listProductsRef(dc));
}

export const updateProductStockRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'updateProductStock');
}
updateProductStockRef.operationName = 'updateProductStock';

export function updateProductStock(dc) {
  return executeMutation(updateProductStockRef(dc));
}

export const listOrdersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'listOrders');
}
listOrdersRef.operationName = 'listOrders';

export function listOrders(dc) {
  return executeQuery(listOrdersRef(dc));
}

