from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    students,
    assessments,
    recommendations,
    universities,
    majors,
    careers,
    scholarships,
    favorites,
    plans,
    notifications,
    admissions,
    admin,
    uploads,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(students.router, prefix="/students", tags=["Students & Profiles"])
api_router.include_router(assessments.router, prefix="/assessments", tags=["Assessments"])
api_router.include_router(recommendations.router, prefix="/recommendations", tags=["Recommendations"])
api_router.include_router(universities.router, prefix="/universities", tags=["Universities"])
api_router.include_router(majors.router, prefix="/majors", tags=["Majors"])
api_router.include_router(careers.router, prefix="/careers", tags=["Careers"])
api_router.include_router(scholarships.router, prefix="/scholarships", tags=["Scholarships"])
api_router.include_router(favorites.router, prefix="/favorites", tags=["Favorites"])
api_router.include_router(plans.router, prefix="/plans", tags=["Application plans"])
api_router.include_router(
    notifications.router, prefix="/notifications", tags=["Notifications"]
)
api_router.include_router(
    admissions.router, prefix="/admissions", tags=["Admissions"]
)
api_router.include_router(admin.router, prefix="/admin", tags=["Administration"])
api_router.include_router(uploads.router, prefix="/uploads", tags=["Content uploads"])

