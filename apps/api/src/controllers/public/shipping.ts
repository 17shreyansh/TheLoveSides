import type { Request, Response, NextFunction } from 'express';
import { Shipment } from '../../models/Shipment.js';
import { Order } from '../../models/Order.js';
import { Setting } from '../../models/Setting.js';
import { env } from '../../config/env.js';
import { isShiprocketConfigured } from '../../integrations/shiprocket/client.js';
import {
  checkPincodeServiceability,
  getShippingRates,
  trackAWB,
} from '../../integrations/shiprocket/shiprocket.service.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';

/**
 * Helper to get the active pickup/warehouse pincode
 */
async function getPickupPincode(): Promise<string> {
  try {
    const setting = await Setting.findOne({ key: 'shiprocket.pickup_pincode' }).lean();
    if (setting && setting.value) {
      return String(setting.value);
    }
  } catch (error) {
    // Ignore db error, fallback to env
  }
  return env.SHIPROCKET_PICKUP_PINCODE || '110001';
}

/**
 * Helper to get the default package weight
 */
export async function getDefaultWeight(): Promise<number> {
  try {
    const setting = await Setting.findOne({ key: 'shiprocket.default_weight' }).lean();
    if (setting && setting.value) {
      return parseFloat(String(setting.value)) || 0.5;
    }
  } catch (error) {
    // Ignore db error
  }
  return 0.5; // Default to 500g
}

/**
 * GET /shipping/check?pincode=110001
 * Check if delivery is available to a pincode.
 * Used on product pages to show delivery availability.
 *
 * Public endpoint — does not require authentication.
 */
export async function checkDeliveryAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!isShiprocketConfigured) {
      throw ApiError.badRequest('Delivery serviceability check is not configured');
    }

    const pincode = req.query.pincode as string;
    if (!pincode || !/^\d{6}$/.test(pincode)) {
      throw ApiError.badRequest('Valid 6-digit pincode is required');
    }

    const pickupPincode = await getPickupPincode();
    const defaultWeight = await getDefaultWeight();

    let data;
    try {
      data = await checkPincodeServiceability({
        pickupPincode,
        deliveryPincode: pincode,
        weight: defaultWeight,
        cod: false,
      });
    } catch (err) {
      throw ApiError.badRequest('Failed to check serviceability from Shiprocket');
    }

    sendSuccess({
      res,
      data: {
        pincode,
        serviceable: data.serviceable,
        estimatedDays: data.estimatedDays,
        codAvailable: data.codAvailable,
        courierCount: data.courierCount,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /shipping/rates?pincode=110001&weight=0.5&cod=false&declaredValue=500
 * Get shipping rates for checkout.
 *
 * Requires authentication — used during checkout flow.
 */
export async function getCheckoutShippingRates(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!isShiprocketConfigured) {
      throw ApiError.badRequest('Shipping rate calculation is not configured');
    }

    const pincode = req.query.pincode as string;
    if (!pincode || !/^\d{6}$/.test(pincode)) {
      throw ApiError.badRequest('Valid 6-digit pincode is required');
    }

    const weight = parseFloat(req.query.weight as string) || 0.5;
    const cod = req.query.cod === 'true' || req.query.cod === '1';
    const declaredValue = req.query.declaredValue ? parseFloat(req.query.declaredValue as string) : undefined;

    const pickupPincode = await getPickupPincode();
    const defaultWeight = await getDefaultWeight();
    
    // Use requested weight or fallback to default
    const finalWeight = req.query.weight ? weight : defaultWeight;

    let data;
    try {
      data = await getShippingRates({
        pickupPincode,
        deliveryPincode: pincode,
        weight: finalWeight,
        cod,
        declaredValue,
      });
    } catch (err) {
      throw ApiError.badRequest('Failed to fetch shipping rates from Shiprocket');
    }

    // Transform to a customer-friendly format
    const couriers = data?.data?.available_courier_companies || [];
    const rates = couriers.map((c: any) => ({
      courierId: c.courier_company_id,
      courierName: c.courier_name,
      rate: c.rate,
      estimatedDays: c.estimated_delivery_days,
      cod: c.cod === 1,
    }));

    sendSuccess({ res, data: { rates } });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /orders/:orderId/track
 * Track a shipment for a customer's order.
 *
 * Requires authentication — verifies order ownership.
 */
export async function trackMyShipment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const orderId = req.params.orderId;

    // Verify the order belongs to this customer
    const order = await Order.findOne({ _id: orderId, userId: req.user!.id });
    if (!order) {
      throw ApiError.notFound('Order');
    }

    // Find the shipment for this order
    const shipment = await Shipment.findOne({ orderId }).lean();
    if (!shipment) {
      throw ApiError.notFound('No shipment found for this order');
    }

    // Return local tracking data if Shiprocket isn't configured or no AWB
    if (!isShiprocketConfigured || !shipment.awbCode) {
      sendSuccess({
        res,
        data: {
          status: shipment.status,
          awbCode: shipment.awbCode || null,
          courierName: shipment.courierName || null,
          trackingUrl: shipment.trackingUrl || null,
          estimatedDeliveryDate: shipment.estimatedDeliveryDate || null,
          trackingHistory: shipment.trackingHistory || [],
        },
      });
      return;
    }

    // Fetch live tracking from Shiprocket
    const liveTracking = await trackAWB(shipment.awbCode);

    sendSuccess({
      res,
      data: {
        status: shipment.status,
        awbCode: shipment.awbCode,
        courierName: shipment.courierName || null,
        trackingUrl: shipment.trackingUrl || null,
        estimatedDeliveryDate: shipment.estimatedDeliveryDate || null,
        trackingHistory: shipment.trackingHistory || [],
        liveTracking,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /shipping/track/:awb
 * Public endpoint to track an AWB.
 */
export async function trackByAWB(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const awb = req.params.awb;
    
    if (!awb) {
      throw ApiError.badRequest('AWB is required');
    }

    if (!isShiprocketConfigured) {
      throw ApiError.badRequest('Shipping integration not configured');
    }

    const liveTracking = await trackAWB(awb as string);
    
    // Attempt to find local shipment to supplement info
    const shipment = await Shipment.findOne({ awbCode: awb }).lean();

    sendSuccess({
      res,
      data: {
        status: shipment?.status || 'UNKNOWN',
        awbCode: awb,
        courierName: shipment?.courierName || null,
        estimatedDeliveryDate: shipment?.estimatedDeliveryDate || null,
        liveTracking,
      },
    });
  } catch (error) {
    next(error);
  }
}
