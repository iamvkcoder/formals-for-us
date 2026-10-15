import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Coupon } from '../models/Coupon.js';
import { updateOrderStatusSchema } from '../validators/index.js';

export async function getAnalytics(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const totalOrders = await Order.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalProducts = await Product.countDocuments({ isActive: true });

    // Calculate revenue from paid/delivered orders (excluding Cancelled/Refunded)
    const revenueAgg = await Order.aggregate([
      {
        $match: {
          orderStatus: { $nin: ['Cancelled', 'Refunded'] },
          'payment.status': { $in: ['completed', 'pending'] }, // Include COD confirmed/delivered or completed online
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$pricing.total' },
        },
      },
    ]);
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    // Count low stock products (any variant stock <= 5)
    const lowStockCount = await Product.countDocuments({
      isActive: true,
      'variants.stock': { $lte: 5 },
    });

    // Orders status distribution
    const statusDistribution = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
        },
      },
    ]);

    // Monthly / Daily revenue chart data (last 7 days or recent orders)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('orderNumber customerName pricing.total orderStatus payment.status createdAt');

    const salesByDate = await Order.aggregate([
      {
        $match: {
          orderStatus: { $nin: ['Cancelled', 'Refunded'] },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$pricing.total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 14 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalOrders,
          totalRevenue,
          totalCustomers,
          totalProducts,
          lowStockCount,
        },
        statusDistribution,
        salesByDate,
        recentOrders,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminOrders(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 15;
    const status = req.query.status as string;
    const search = req.query.search as string;

    const filter: any = {};
    if (status && status !== 'all') {
      filter.orderStatus = status;
    }
    if (search) {
      filter.$or = [
        { orderNumber: new RegExp(search.trim(), 'i') },
        { customerEmail: new RegExp(search.trim(), 'i') },
        { customerName: new RegExp(search.trim(), 'i') },
      ];
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateOrderStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { status, comment } = updateOrderStatusSchema.parse(req.body);

    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    const prevStatus = order.orderStatus;
    order.orderStatus = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      comment: comment || `Status updated from ${prevStatus} to ${status} by admin`,
    });

    if (status === 'Delivered' && order.payment.method === 'cod') {
      order.payment.status = 'completed';
      order.payment.paymentDate = new Date();
    }

    // If cancelled by admin, restore inventory
    if (status === 'Cancelled' && prevStatus !== 'Cancelled') {
      for (const item of order.items) {
        await Product.updateOne(
          { _id: item.product, 'variants.sku': item.sku },
          {
            $inc: {
              'variants.$.stock': item.quantity,
              salesCount: -item.quantity,
            },
          }
        );
      }
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminProducts(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;

    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: new RegExp(search.trim(), 'i') },
        { categorySlug: new RegExp(search.trim(), 'i') },
      ];
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('category', 'name slug'),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createProduct(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body;

    const slug =
      body.slug ||
      body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const existing = await Product.findOne({ slug });
    if (existing) {
      res.status(409).json({ success: false, message: 'A product with this slug already exists.' });
      return;
    }

    let categoryId = body.category;
    let categorySlug = body.categorySlug;

    if (!categorySlug && categoryId) {
      const cat = await Category.findById(categoryId);
      if (cat) categorySlug = cat.slug;
    } else if (categorySlug && !categoryId) {
      const cat = await Category.findOne({ slug: categorySlug });
      if (cat) categoryId = cat._id;
    }

    const product = await Product.create({
      ...body,
      slug,
      category: categoryId,
      categorySlug,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const body = req.body;

    const product = await Product.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    // Safe soft deletion / archiving
    const product = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Product archived successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function getCustomers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 15;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({ role: 'customer' })
        .select('name email phone createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments({ role: 'customer' }),
    ]);

    // Attach order summary to each customer
    const userIds = users.map((u) => u._id);
    const orderAgg = await Order.aggregate([
      { $match: { user: { $in: userIds }, orderStatus: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: '$user',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$pricing.total' },
        },
      },
    ]);

    const orderMap = new Map(orderAgg.map((o) => [o._id.toString(), o]));

    const enrichedUsers = users.map((u) => {
      const stats = orderMap.get(u._id.toString()) || { orderCount: 0, totalSpent: 0 };
      return {
        ...u,
        orderCount: stats.orderCount,
        totalSpent: stats.totalSpent,
      };
    });

    res.status(200).json({
      success: true,
      data: enrichedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getLowStockAlerts(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const products = await Product.find({
      isActive: true,
      'variants.stock': { $lte: 5 },
    }).select('name slug brand categorySlug variants images basePrice');

    const alerts = [];
    for (const p of products) {
      for (const v of p.variants) {
        if (v.stock <= 5) {
          alerts.push({
            productId: p._id,
            productName: p.name,
            productSlug: p.slug,
            image: p.images[0],
            sku: v.sku,
            size: v.size,
            color: v.color,
            stock: v.stock,
            isCritical: v.stock === 0,
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
}

export async function exportSalesReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(500);

    // Generate CSV string
    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Customer Email',
      'Items Count',
      'Subtotal',
      'Discount',
      'Shipping',
      'Tax',
      'Total',
      'Payment Method',
      'Payment Status',
      'Order Status',
    ];

    const rows = orders.map((o) => [
      o.orderNumber,
      o.createdAt.toISOString().split('T')[0],
      `"${o.customerName.replace(/"/g, '""')}"`,
      o.customerEmail,
      o.items.length,
      o.pricing.subtotal,
      o.pricing.discount,
      o.pricing.shippingFee,
      o.pricing.tax,
      o.pricing.total,
      o.payment.method,
      o.payment.status,
      o.orderStatus,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=formals_sales_report_${Date.now()}.csv`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
}
