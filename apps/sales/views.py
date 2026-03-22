from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated

from .models import Category, Product, SaleTransaction
from .serializers import CategorySerializer, ProductSerializer, SaleTransactionSerializer
from .filters import SaleTransactionFilter


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name']


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('category').all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['name', 'category__name']
    ordering_fields = ['name', 'price', 'created_at']


class SaleTransactionViewSet(viewsets.ModelViewSet):
    queryset = SaleTransaction.objects.select_related('product__category').all()
    serializer_class = SaleTransactionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = SaleTransactionFilter
    search_fields = ['product__name', 'region']
    ordering_fields = ['sale_date', 'total_amount', 'quantity']
