import axios from 'axios';
import { ENV } from '../config/env.js';
import { Product, IProduct } from '../models/Product.js';

export interface RecommendationItem {
  product: IProduct;
  score: number;
  reason: string;
}

export class RecommendationService {
  public static async getRecommendationsForProduct(
    productId: string,
    limit: number = 4
  ): Promise<RecommendationItem[]> {
    try {
      const currentProduct = await Product.findById(productId);
      if (!currentProduct) {
        return [];
      }

      // Fetch all candidate active products from the authoritative MongoDB database
      const candidates = await Product.find({
        _id: { $ne: currentProduct._id },
        isActive: true,
      })
        .limit(40)
        .lean();

      if (candidates.length === 0) {
        return [];
      }

      // Try contacting the FastAPI Python service
      try {
        const response = await axios.post(
          `${ENV.PYTHON_API_URL}/api/recommendations/similar-products`,
          {
            target_product: {
              id: currentProduct._id.toString(),
              name: currentProduct.name,
              category: currentProduct.categorySlug,
              colors: currentProduct.colors,
              material: currentProduct.material,
              price: currentProduct.salePrice || currentProduct.basePrice,
              tags: currentProduct.tags,
            },
            candidate_products: candidates.map((p) => ({
              id: p._id.toString(),
              name: p.name,
              category: p.categorySlug,
              colors: p.colors,
              material: p.material,
              price: p.salePrice || p.basePrice,
              tags: p.tags,
            })),
            limit,
          },
          { timeout: 2500 }
        );

        if (response.data && response.data.recommendations) {
          const recResults: RecommendationItem[] = [];
          for (const rec of response.data.recommendations) {
            const prod = candidates.find((c) => c._id.toString() === rec.product_id);
            if (prod) {
              recResults.push({
                product: prod as unknown as IProduct,
                score: rec.score,
                reason: rec.reason,
              });
            }
          }
          if (recResults.length > 0) {
            return recResults;
          }
        }
      } catch (pythonError) {
        console.warn(
          '[RecommendationService] Python service unavailable, using built-in fallback:',
          (pythonError as Error).message
        );
      }

      // Graceful fallback: Match complementary category, tags or price range
      return this.computeLocalFallback(currentProduct, candidates, limit);
    } catch (error) {
      console.error('[RecommendationService] Error getting recommendations:', error);
      return [];
    }
  }

  private static computeLocalFallback(
    current: IProduct,
    candidates: any[],
    limit: number
  ): RecommendationItem[] {
    const scored = candidates.map((cand) => {
      let score = 0;
      let reason = 'Curated complementary formalwear';

      // Cross-category synergy (e.g. Shirts pair with Trousers or Blazers)
      if (
        (current.categorySlug === 'formal-shirts' &&
          (cand.categorySlug === 'formal-trousers' || cand.categorySlug === 'blazers')) ||
        (current.categorySlug === 'formal-trousers' &&
          (cand.categorySlug === 'formal-shirts' || cand.categorySlug === 'blazers')) ||
        (current.categorySlug === 'blazers' &&
          (cand.categorySlug === 'formal-shirts' || cand.categorySlug === 'formal-trousers'))
      ) {
        score += 0.5;
        reason = `Naturally coordinates with your ${current.name}`;
      } else if (cand.categorySlug === current.categorySlug) {
        score += 0.3;
        reason = `Alternative style in our ${cand.categorySlug.replace('-', ' ')} collection`;
      }

      // Tag overlap
      const sharedTags = cand.tags.filter((t: string) => current.tags.includes(t));
      if (sharedTags.length > 0) {
        score += sharedTags.length * 0.15;
        reason = `Matches your preference for ${sharedTags[0]}`;
      }

      // Material synergy
      if (cand.material.toLowerCase().includes('cotton') && current.material.toLowerCase().includes('cotton')) {
        score += 0.1;
      }

      return {
        product: cand as IProduct,
        score: Math.min(0.99, Number(score.toFixed(2))),
        reason,
      };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
  }
}
