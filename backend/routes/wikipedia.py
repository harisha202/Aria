from fastapi import APIRouter, Depends, Query
from middleware.rate_limit import rate_limit
from services.wikipedia import wikipedia_service

router = APIRouter(prefix="/api/v1/wikipedia", tags=["wikipedia"])

@router.get("/search")
async def search_wikipedia(
    q: str = Query(..., description="The query to search on Wikipedia"),
    _=Depends(rate_limit(20, 60))
):
    """
    Look up a query on Wikipedia and return a plain-text extract.
    Rate limited to 20 requests per minute.
    """
    return wikipedia_service(q)
