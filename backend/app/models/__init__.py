from app.core.database import Base
from app.models.auth import Role, Permission, RolePermission, User, UserRole, RefreshToken, AuditLog
from app.models.profile import StudentProfile
from app.models.catalog import University, Faculty, Major, UniversityMajor, Career, MajorCareer
from app.models.scholarship import Scholarship, ScholarshipMajor
from app.models.assessment import (
    PersonalityQuestion,
    PersonalityOption,
    PersonalityAssessment,
    PersonalityAnswer,
    PersonalityResult,
    RiasecQuestion,
    RiasecAssessment,
    RiasecAnswer,
    RiasecResult,
)
from app.models.preferences import AcademicPreferences
from app.models.recommendation import RecommendationRule, MajorRecommendation
from app.models.favorites import (
    FavoriteUniversity,
    FavoriteMajor,
    FavoriteCareer,
    FavoriteScholarship,
    UserActivity,
)
from app.models.plan import ApplicationPlan, ApplicationPlanDocument
from app.models.notifications import (
    InAppNotification,
    NotificationLog,
    NotificationPreference,
)

__all__ = [
    "Base",
    "Role",
    "Permission",
    "RolePermission",
    "User",
    "UserRole",
    "RefreshToken",
    "AuditLog",
    "StudentProfile",
    "University",
    "Faculty",
    "Major",
    "UniversityMajor",
    "Career",
    "MajorCareer",
    "Scholarship",
    "ScholarshipMajor",
    "PersonalityQuestion",
    "PersonalityOption",
    "PersonalityAssessment",
    "PersonalityAnswer",
    "PersonalityResult",
    "RiasecQuestion",
    "RiasecAssessment",
    "RiasecAnswer",
    "RiasecResult",
    "AcademicPreferences",
    "RecommendationRule",
    "MajorRecommendation",
    "FavoriteUniversity",
    "FavoriteMajor",
    "FavoriteCareer",
    "FavoriteScholarship",
    "UserActivity",
    "ApplicationPlan",
    "ApplicationPlanDocument",
    "NotificationPreference",
    "NotificationLog",
    "InAppNotification",
]

