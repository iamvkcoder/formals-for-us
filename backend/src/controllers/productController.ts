import { Request, Response, NextFunction } from 'express';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { productQuerySchema } from '../validators/index.js';
import { RecommendationService } from '../services/recommendationService.js';

export async function getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = productQuerySchema.parse(req.query);

    const filter: any = { isActive: true };

    if (query.category) {
      filter.categorySlug = query.category.toLowerCase();
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filter.basePrice = {};
      if (query.minPrice !== undefined) filter.basePrice.$gte = query.minPrice;
      if (query.maxPrice !== undefined) filter.basePrice.$lte = query.maxPrice;
    }

    if (query.size) {
      filter['variants.size'] = query.size;
    }

    if (query.color) {
      filter['variants.color'] = new RegExp(`^${query.color}$`, 'i');
    }

    if (query.inStock === 'true') {
      filter['variants.stock'] = { $gt: 0 };
    }

    if (query.search) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { tags: searchRegex },
        { brand: searchRegex },
      ];
    }

    // Determine sort
    let sortOption: any = { createdAt: -1 };
    if (query.sort === 'price-asc') {
      sortOption = { basePrice: 1 };
    } else if (query.sort === 'price-desc') {
      sortOption = { basePrice: -1 };
    } else if (query.sort === 'popularity') {
      sortOption = { salesCount: -1, viewCount: -1 };
    }

    const skip = (query.page - 1) * query.limit;

    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(query.limit)
        .populate('category', 'name slug'),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / query.limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { slug } = req.params;

    // Support lookup by slug or by 24-char hex ObjectId
    const isId = /^[0-9a-fA-F]{24}$/.test(slug);
    const query = isId ? { _id: slug, isActive: true } : { slug, isActive: true };

    const product = await Product.findOne(query).populate('category', 'name slug');
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    // Increment viewCount asynchronously
    Product.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } }).exec();

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRelatedProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const recommendations = await RecommendationService.getRecommendationsForProduct(id, 4);

    res.status(200).json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });

    // Count products per category
    const counts = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$categorySlug', count: { $sum: 1 } } },
    ]);

    const countMap = new Map(counts.map((c) => [c._id, c.count]));

    const categoriesWithCount = categories.map((cat) => ({
      _id: cat._id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      image: cat.image,
      productCount: countMap.get(cat.slug) || 0,
    }));

    res.status(200).json({
      success: true,
      data: categoriesWithCount,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSearchSuggestions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (!q || q.length < 2) {
      res.status(200).json({ success: true, data: [] });
      return;
    }

    const suggestions = await Product.find({
      isActive: true,
      name: { $regex: q, $options: 'i' },
    })
      .select('name slug basePrice salePrice images categorySlug')
      .limit(6)
      .lean();

    res.status(200).json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    next(error);
  }
}
