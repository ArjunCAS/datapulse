from rest_framework import serializers
from .models import Category, Product, SaleTransaction


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = Category
        fields = ('id', 'name', 'description', 'product_count')


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = ('id', 'name', 'category', 'category_name', 'price', 'description', 'created_at')


class SaleTransactionSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    category_name = serializers.CharField(source='product.category.name', read_only=True)

    class Meta:
        model = SaleTransaction
        fields = (
            'id', 'product', 'product_name', 'category_name',
            'quantity', 'unit_price', 'total_amount', 'region', 'sale_date', 'created_at'
        )
        read_only_fields = ('total_amount',)
