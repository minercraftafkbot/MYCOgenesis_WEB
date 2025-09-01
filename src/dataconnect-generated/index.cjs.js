const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'mycogenesisweb',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

const createSubscriberRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'createSubscriber');
}
createSubscriberRef.operationName = 'createSubscriber';
exports.createSubscriberRef = createSubscriberRef;

exports.createSubscriber = function createSubscriber(dc) {
  return executeMutation(createSubscriberRef(dc));
};

const listProductsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'listProducts');
}
listProductsRef.operationName = 'listProducts';
exports.listProductsRef = listProductsRef;

exports.listProducts = function listProducts(dc) {
  return executeQuery(listProductsRef(dc));
};

const updateProductStockRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'updateProductStock');
}
updateProductStockRef.operationName = 'updateProductStock';
exports.updateProductStockRef = updateProductStockRef;

exports.updateProductStock = function updateProductStock(dc) {
  return executeMutation(updateProductStockRef(dc));
};

const listOrdersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'listOrders');
}
listOrdersRef.operationName = 'listOrders';
exports.listOrdersRef = listOrdersRef;

exports.listOrders = function listOrders(dc) {
  return executeQuery(listOrdersRef(dc));
};
