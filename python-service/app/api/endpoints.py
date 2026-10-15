from fastapi import APIRouter, HTTPException, status
from app.models.schemas import (
    RecommendationRequest,
    RecommendationResponse,
    HealthResponse,
)
from app.algorithms.recommender import rank_recommendations

router = APIRouter()

@router.get("/recommendations/health", response_model=HealthResponse)
def get_recommendations_health():
    return HealthResponse(
        status="healthy",
        service="formals-for-us-recommendation-engine",
        version="1.0.0",
    )

@router.post("/recommendations/similar-products", response_model=RecommendationResponse)
def get_similar_products(req: RecommendationRequest):
    if not req.candidate_products:
        return RecommendationResponse(
            target_product_id=req.target_product.id,
            recommendations=[],
            total_evaluated=0,
        )

    results = rank_recommendations(
        target=req.target_product,
        candidates=req.candidate_products,
        limit=req.limit or 4,
    )

    return RecommendationResponse(
        target_product_id=req.target_product.id,
        recommendations=results,
        total_evaluated=len(req.candidate_products),
    )

@router.post("/recommendations", response_model=RecommendationResponse)
def get_recommendations_alias(req: RecommendationRequest):
    return get_similar_products(req)
