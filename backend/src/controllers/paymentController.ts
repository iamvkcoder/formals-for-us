import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Order } from '../models/Order.js';
import { PaymentService } from '../services/paymentService.js';

export async function createPayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      res.status(400).json({ success: false, message: 'orderId is required' });
      return;
    }

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    const paymentDetails = await PaymentService.createPaymentOrder(order.orderNumber, order.pricing.total);

    res.status(200).json({
      success: true,
      data: paymentDetails,
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyPayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { orderId, paymentId, signature, internalOrderId } = req.body;

    const isValid = PaymentService.verifyPayment({
      orderId,
      paymentId,
      signature,
    });

    if (!isValid) {
      res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Verification failed.',
      });
      return;
    }

    // Update order
    const order = await Order.findById(internalOrderId);
    if (!order) {
      res.status(404).json({ success: false, message: 'Internal order not found' });
      return;
    }

    order.payment.status = 'completed';
    order.payment.transactionId = paymentId;
    order.payment.paymentDate = new Date();
    order.orderStatus = 'Confirmed';
    order.statusHistory.push({
      status: 'Confirmed',
      timestamp: new Date(),
      comment: `Payment verified successfully via ${order.payment.simulated ? 'SIMULATED TEST ADAPTER' : 'ONLINE GATEWAY'} (Txn: ${paymentId})`,
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified and order confirmed successfully.',
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

export async function simulatedPay(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { orderId } = req.body; // Internal MongoDB order ID
    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    const simulatedGatewayOrderId = `sim_gw_${order.orderNumber}`;
    const payload = PaymentService.generateSimulatedSuccessPayload(simulatedGatewayOrderId);

    // Verify and update
    order.payment.status = 'completed';
    order.payment.transactionId = payload.paymentId;
    order.payment.paymentDate = new Date();
    order.payment.simulated = true;
    order.orderStatus = 'Confirmed';
    order.statusHistory.push({
      status: 'Confirmed',
      timestamp: new Date(),
      comment: `Payment settled via Development Simulated Adapter (Txn: ${payload.paymentId})`,
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Simulated payment succeeded.',
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

export async function paymentWebhook(_req: any, res: Response): Promise<void> {
  // Webhook handler for external payment callbacks
  res.status(200).json({ status: 'ok', received: true });
}
