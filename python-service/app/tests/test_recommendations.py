import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "recommendation-engine" in data["service"]

def test_api_recommendations_health():
    response = client.get("/api/recommendations/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_recommendations_empty_candidates():
    payload = {
        "target_product": {
            "id": "prod_1",
            "name": "Oxford Shirt",
            "category": "formal-shirts",
            "colors": ["Crisp White"],
            "material": "Cotton",
            "price": 2499.0,
            "tags": ["cotton", "oxford"]
        },
        "candidate_products": [],
        "limit": 4
    }
    response = client.post("/api/recommendations/similar-products", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["recommendations"] == []
    assert data["total_evaluated"] == 0

def test_recommendations_ranking_and_synergy():
    payload = {
        "target_product": {
            "id": "prod_target",
            "name": "Royal Oxford Dress Shirt",
            "category": "formal-shirts",
            "colors": ["Crisp White"],
            "material": "100% Egyptian Giza Cotton",
            "price": 2499.0,
            "tags": ["cotton", "executive", "oxford"]
        },
        "candidate_products": [
            {
                "id": "cand_trousers",
                "name": "Tailored Wool Trousers",
                "category": "formal-trousers",
                "colors": ["Charcoal Grey"],
                "material": "Wool Blend",
                "price": 2999.0,
                "tags": ["executive", "tailored"]
            },
            {
                "id": "cand_blazer",
                "name": "Navy Wool Blazer",
                "category": "blazers",
                "colors": ["Navy Blue"],
                "material": "Super 110s Wool",
                "price": 7999.0,
                "tags": ["executive", "blazer"]
            },
            {
                "id": "cand_shoes",
                "name": "Oxford Brogues",
                "category": "formal-shoes",
                "colors": ["Jet Black"],
                "material": "Full-Grain Leather",
                "price": 4999.0,
                "tags": ["oxford", "leather"]
            }
        ],
        "limit": 3
    }
    response = client.post("/api/recommendations/similar-products", json=payload)
    assert response.status_code == 200
    data = response.json()
    recs = data["recommendations"]
    assert len(recs) == 3
    assert recs[0]["score"] >= recs[1]["score"]
    assert recs[1]["score"] >= recs[2]["score"]
    # Check that recommendation reasons are descriptive
    for rec in recs:
        assert len(rec["reason"]) > 5
        assert rec["product_id"] != "prod_target"

def test_recommendations_validation_error():
    # Negative price or missing name should fail validation
    invalid_payload = {
        "target_product": {
            "id": "prod_1",
            "name": "Oxford Shirt",
            "category": "formal-shirts",
            "price": -50.0  # Invalid price!
        },
        "candidate_products": []
    }
    response = client.post("/api/recommendations/similar-products", json=invalid_payload)
    assert response.status_code == 422
