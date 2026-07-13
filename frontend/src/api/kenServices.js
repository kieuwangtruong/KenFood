import axiosClient from './axiosClient';

/**
 * Sends a GET request to /admin/zone-analytics to fetch active order density maps.
 * @returns {Promise<any>} Response data containing active order density maps.
 */
export const getZoneAnalytics = async () => {
  const response = await axiosClient.get('/admin/zone-analytics');
  return response.data;
};

/**
 * Sends a GET request to /batch/merchant-aggregation to fetch kitchen prep compilation.
 * Maps backend product-aggregated fields to UI compatible names.
 * @param {string|number} merchantId - Unused (inferred by backend token), kept for compatibility.
 * @returns {Promise<any>} Formatted array of kitchen bulk prep items.
 */
export const getMerchantBatchSummary = async (merchantId) => {
  const response = await axiosClient.get('/batch/merchant-aggregation');
  if (response.data && response.data.aggregated_items) {
    return response.data.aggregated_items.map(item => ({
      food_name: item.product_name,
      quantity: item.total_quantity,
      raw_revenue: item.total_revenue
    }));
  }
  return response.data || [];
};

/**
 * Sends a POST request to /order/${orderId}/complete to complete an individual order manually.
 * @param {string|number} orderId - The unique identifier of the order.
 * @param {string|number} driverId - Unused (inferred by backend token), kept for compatibility.
 * @returns {Promise<any>} Response data indicating settlement status.
 */
export const completeBatchOrder = async (orderId, driverId) => {
  const response = await axiosClient.post(`/order/${orderId}/complete`);
  return response.data;
};

/**
 * Sends a POST request to /wallet/deposit to request a PayOS payment top-up link.
 * @param {string|number} userId - Unused (inferred by backend token), kept for compatibility.
 * @param {number} amount - The top-up amount.
 * @returns {Promise<any>} Response containing PayOS checkout URL and order code.
 */
export const topupWallet = async (userId, amount) => {
  const response = await axiosClient.post('/wallet/deposit', {
    amount: amount
  });
  return response.data;
};

/**
 * Sends a GET request to /buildings to fetch active building destination lists.
 * @returns {Promise<any>} Response data containing list of buildings.
 */
export const getBuildings = async () => {
  const response = await axiosClient.get('/buildings');
  return response.data;
};

/**
 * Sends a GET request to /wallet to fetch user wallet balance and ký quỹ information.
 * @returns {Promise<any>} Response data containing wallet information.
 */
export const getWalletInfo = async () => {
  const response = await axiosClient.get('/wallet');
  return response.data;
};

/**
 * Sends a GET request to /batch/active to list active delivery batches.
 * @returns {Promise<any>} Active batches.
 */
export const getActiveBatches = async () => {
  const response = await axiosClient.get('/batch/active');
  return response.data;
};

/**
 * Sends a POST request to /batch/${batchId}/accept to assign a batch to the current driver.
 * @param {string|number} batchId - The unique identifier of the batch.
 * @returns {Promise<any>} Details of accepted batch.
 */
export const acceptBatch = async (batchId) => {
  const response = await axiosClient.post(`/batch/${batchId}/accept`);
  return response.data;
};

/**
 * Sends a POST request to /batch/${batchId}/complete to settle the batch.
 * @param {string|number} batchId - The unique identifier of the batch.
 * @returns {Promise<any>} Settle result details.
 */
export const completeBatch = async (batchId) => {
  const response = await axiosClient.post(`/batch/${batchId}/complete`);
  return response.data;
};

/**
 * Sends a GET request to /batch/my-batches to list batches assigned to the current driver.
 * @returns {Promise<any>} Driver's batches list.
 */
export const getMyBatches = async () => {
  const response = await axiosClient.get('/batch/my-batches');
  return response.data;
};

/**
 * Sends a GET request to /products to fetch available products from the database.
 * @returns {Promise<any>} Response data containing the list of products.
 */
export const getProducts = async () => {
  const response = await axiosClient.get('/products');
  return response.data;
};

/**
 * Sends a GET request to /order to list orders.
 * @returns {Promise<any>} Response containing list of orders.
 */
export const getOrders = async () => {
  const response = await axiosClient.get('/order');
  return response.data;
};

/**
 * Sends a POST request to /batch/compile to compile all orders before 10:00 AM into batches.
 * @returns {Promise<any>} List of compiled batches.
 */
export const compileBatches = async () => {
  const response = await axiosClient.post('/batch/compile');
  return response.data;
};
