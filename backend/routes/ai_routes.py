from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.ai.analyzer import APIAnalyzer

router = APIRouter(prefix="/ai", tags=["AI Insights"])


@router.get("/insights")
def get_insights(db: Session = Depends(get_db)):

    analyzer = APIAnalyzer(db)
    return analyzer.generate_insights()