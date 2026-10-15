from typing import List, Optional
from pydantic import BaseModel, Field

class ProductFeature(BaseModel):
    id: str
    name: str
    category: str
    colors: List[str] = Field(default_factory=list)
    material: str = ""
    price: float = Field(ge=0)
    tags: List[str] = Field(default_factory=list)

class RecommendationRequest(BaseModel):
    target_product: ProductFeature
    candidate_products: List[ProductFeature]
    limit: Optional[int] = Field(default=4, ge=1, le=20)

class RecommendationResult(BaseModel):
    product_id: str
    product_name: str
    score: float
    reason: str

class RecommendationResponse(BaseModel):
    target_product_id: str
    recommendations: List[RecommendationResult]
    total_evaluated: int

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
