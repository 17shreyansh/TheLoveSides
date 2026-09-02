import { shiprocketFetch } from './client.js';
import { IOrder } from '../../models/Order.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';

export interface ShiprocketOrderResponse {
  order_id: number;
  shipment_id: number;
  status: string;
  status_code: number;
  onboarding_completed_now: number;
  awb_code: string;
  courier_company_id: string;
  courier_name: string;
}

/**
 * Pushes an order to Shiprocket for fulfillment.
 * Converts our internal Order model to Shiprocket's payload format.
 */
export async function createShiprocketOrder(order: IOrder, userEmail: string): Promise<ShiprocketOrderResponse> {
  try {
    const [firstName, ...lastNameParts] = order.shippingAddress.fullName.split(' ');
    const lastName = lastNameParts.join(' ') || '-';

    const orderItems = order.items.map(item => ({
      name: item.name,
      sku: item.sku,
      units: item.quantity,
      selling_price: item.price,
      discount: item.discount,
      tax: item.tax,
      hsn: '', // Add HSN if available
    }));

    // In a real production system, you'd calculate this based on the sum of variant weights
    // For now, we provide safe defaults
    const payload = {
      order_id: order.orderNumber,
      order_date: order.createdAt.toISOString().split('T')[0],
      pickup_location: 'Primary', // Needs to match Shiprocket dashboard configuration
      billing_customer_name: firstName,
      billing_last_name: lastName,
      billing_address: order.billingAddress?.addressLine1 || order.shippingAddress.addressLine1,
      billing_address_2: order.billingAddress?.addressLine2 || order.shippingAddress.addressLine2 || '',
      billing_city: order.billingAddress?.city || order.shippingAddress.city,
      billing_pincode: order.billingAddress?.pincode || order.shippingAddress.pincode,
      billing_state: order.billingAddress?.state || order.shippingAddress.state,
      billing_country: order.billingAddress?.country || order.shippingAddress.country,
      billing_email: userEmail,
      billing_phone: order.billingAddress?.phone || order.shippingAddress.phone,
      shipping_is_billing: !order.billingAddress ? 1 : 0,
      shipping_customer_name: firstName,
      shipping_last_name: lastName,
      shipping_address: order.shippingAddress.addressLine1,
      shipping_address_2: order.shippingAddress.addressLine2 || '',
      shipping_city: order.shippingAddress.city,
      shipping_pincode: order.shippingAddress.pincode,
      shipping_country: order.shippingAddress.country,
      shipping_state: order.shippingAddress.state,
      shipping_email: userEmail,
      shipping_phone: order.shippingAddress.phone,
      order_items: orderItems,
      payment_method: 'Prepaid', // Since we only ship after PAID status
      shipping_charges: order.shippingAmount,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: order.discountAmount,
      sub_total: order.grandTotal,
      length: 10, // cm
      breadth: 10, // cm
      height: 10, // cm
      weight: 0.5, // kg
    };

    const response = await shiprocketFetch('/orders/create/adhoc', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const data = await response.json() as any;

    if (!response.ok) {
      logger.error({ status: response.status, data }, 'Failed to create Shiprocket order');
      throw new Error(`Shiprocket API Error: ${data.message || response.statusText}`);
    }

    return data as ShiprocketOrderResponse;
  } catch (error) {
    logger.error({ err: error, orderId: order._id }, 'Shiprocket order creation failed');
    throw ApiError.internal('Shipping gateway error');
  }
}

/**
 * Generates an AWB for a shipment ID.
 */
export async function generateAWB(shipmentId: number, courierId?: string) {
  try {
    const payload: any = { shipment_id: shipmentId };
    if (courierId) {
      payload.courier_id = courierId;
    }

    const response = await shiprocketFetch('/courier/assign/awb', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const data = await response.json() as any;
    
    if (!response.ok) {
      throw new Error(`Shiprocket API Error: ${data.message || response.statusText}`);
    }
    
    return data;
  } catch (error) {
    logger.error({ err: error, shipmentId }, 'Failed to generate AWB');
    throw ApiError.internal('Shipping gateway error');
  }
}

/**
 * Tracks an AWB code.
 */
export async function trackAWB(awbCode: string) {
  try {
    const response = await shiprocketFetch(`/courier/track/awb/${awbCode}`);
    const data = await response.json() as any;
    
    if (!response.ok) {
      throw new Error(`Shiprocket API Error: ${data.message || response.statusText}`);
    }
    
    return data;
  } catch (error) {
    logger.error({ err: error, awbCode }, 'Failed to track AWB');
    throw ApiError.internal('Shipping gateway error');
  }
}
