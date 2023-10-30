from django.urls import path
from rest_framework.routers import SimpleRouter

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from server.api.views import RecipeViewSet, RecipeSaveViewSet, RecipeCreateViewSet, RecipeFilterViewSet, \
    RecipeSearchViewSet

router = SimpleRouter()
router.register(r'recipe', RecipeViewSet, basename='recipe')
router.register(r'create-recipe', RecipeCreateViewSet, basename='recipe')
router.register(r'save-recipe', RecipeSaveViewSet, basename='recipe')
router.register(r'recipe-filter', RecipeFilterViewSet, basename='recipe')
router.register(r'recipe-search', RecipeSearchViewSet, basename='recipe')


urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

urlpatterns += router.urls
