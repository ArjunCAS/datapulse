from django.urls import path
from . import views

urlpatterns = [
    path('summary/', views.summary, name='analytics-summary'),
    path('revenue-by-category/', views.revenue_by_category, name='revenue-by-category'),
    path('revenue-over-time/', views.revenue_over_time, name='revenue-over-time'),
    path('top-products/', views.top_products, name='top-products'),
    path('revenue-by-region/', views.revenue_by_region, name='revenue-by-region'),
    path('daily-sales/', views.daily_sales, name='daily-sales'),
]
