from django.urls import path
from . import views

app_name = 'templates_app'

urlpatterns = [
    # Placeholder URL patterns for templates_app
    # These can be expanded as the app functionality is developed
    path('', views.template_list, name='template_list'),
    path('<int:template_id>/', views.template_detail, name='template_detail'),
] 