from typing import List, Tuple
from app.models.schemas import ProductFeature, RecommendationResult

# Complementary formal category pairings
CATEGORY_SYNERGY = {
    "formal-shirts": {
        "formal-trousers": 0.40,
        "blazers": 0.35,
        "belts-and-accessories": 0.25,
        "formal-shoes": 0.20,
        "waistcoats": 0.20,
    },
    "formal-trousers": {
        "formal-shirts": 0.40,
        "blazers": 0.35,
        "formal-shoes": 0.25,
        "belts-and-accessories": 0.20,
    },
    "blazers": {
        "formal-shirts": 0.35,
        "formal-trousers": 0.35,
        "formal-shoes": 0.20,
        "belts-and-accessories": 0.15,
    },
    "business-suits": {
        "formal-shirts": 0.40,
        "formal-shoes": 0.30,
        "belts-and-accessories": 0.25,
        "waistcoats": 0.20,
    },
    "waistcoats": {
        "formal-shirts": 0.40,
        "formal-trousers": 0.30,
        "blazers": 0.25,
    },
    "formal-shoes": {
        "formal-trousers": 0.35,
        "belts-and-accessories": 0.30,
        "business-suits": 0.25,
    },
    "belts-and-accessories": {
        "formal-shoes": 0.35,
        "formal-shirts": 0.30,
        "business-suits": 0.25,
    },
}

# Neutral / Versatile formal colors that complement almost anything
VERSATILE_COLORS = {"crisp white", "white", "sky blue", "navy blue", "navy", "charcoal grey", "jet black"}

def calculate_similarity(target: ProductFeature, candidate: ProductFeature) -> Tuple[float, str]:
    if target.id == candidate.id:
        return 0.0, "Same item"

    score = 0.0
    reason_parts = []

    # 1. Category synergy or same-category alternative
    target_cat = target.category.lower()
    cand_cat = candidate.category.lower()

    if target_cat in CATEGORY_SYNERGY and cand_cat in CATEGORY_SYNERGY[target_cat]:
        cat_bonus = CATEGORY_SYNERGY[target_cat][cand_cat]
        score += cat_bonus
        cat_name = cand_cat.replace("-", " ").title()
        reason_parts.append(f"Essential pairing from our {cat_name} collection")
    elif target_cat == cand_cat:
        score += 0.25
        reason_parts.append("Alternative cut in the same formal style")

    # 2. Tag synergy (e.g. executive, oxford, tailored)
    target_tags = set(t.lower() for t in target.tags)
    cand_tags = set(t.lower() for t in candidate.tags)
    shared_tags = target_tags.intersection(cand_tags)
    if shared_tags:
        tag_score = min(0.30, len(shared_tags) * 0.10)
        score += tag_score
        primary_tag = list(shared_tags)[0].replace("-", " ")
        reason_parts.append(f"Shares your preference for {primary_tag} styling")

    # 3. Color harmony
    target_colors = set(c.lower() for c in target.colors)
    cand_colors = set(c.lower() for c in candidate.colors)

    if target_colors and cand_colors:
        if bool(target_colors.intersection(VERSATILE_COLORS)) or bool(cand_colors.intersection(VERSATILE_COLORS)):
            score += 0.15
        elif bool(target_colors.intersection(cand_colors)):
            score += 0.10

    # 4. Material synergy
    target_mat = target.material.lower()
    cand_mat = candidate.material.lower()
    if ("wool" in target_mat and "wool" in cand_mat) or ("cotton" in target_mat and "cotton" in cand_mat):
        score += 0.10
        if "wool" in cand_mat:
            reason_parts.append("Complementary Italian wool drape")
        elif "cotton" in cand_mat:
            reason_parts.append("Breathable premium Egyptian cotton synergy")

    # 5. Price tier compatibility
    if target.price > 0 and candidate.price > 0:
        ratio = min(target.price, candidate.price) / max(target.price, candidate.price)
        if ratio >= 0.5:
            score += 0.05

    final_score = round(min(0.99, max(0.10, score)), 2)
    reason = " · ".join(reason_parts) if reason_parts else "Curated formal coordination"

    return final_score, reason

def rank_recommendations(
    target: ProductFeature,
    candidates: List[ProductFeature],
    limit: int = 4
) -> List[RecommendationResult]:
    scored_items = []

    for candidate in candidates:
        if candidate.id == target.id:
            continue
        score, reason = calculate_similarity(target, candidate)
        scored_items.append(
            RecommendationResult(
                product_id=candidate.id,
                product_name=candidate.name,
                score=score,
                reason=reason,
            )
        )

    # Deterministic sort: descending score, then alphabetically by product_name
    scored_items.sort(key=lambda x: (-x.score, x.product_name))
    return scored_items[:limit]
