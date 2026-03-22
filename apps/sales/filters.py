import django_filters
from .models import SaleTransaction


class SaleTransactionFilter(django_filters.FilterSet):
    date_from = django_filters.DateFilter(field_name='sale_date', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='sale_date', lookup_expr='lte')
    min_amount = django_filters.NumberFilter(field_name='total_amount', lookup_expr='gte')
    max_amount = django_filters.NumberFilter(field_name='total_amount', lookup_expr='lte')

    class Meta:
        model = SaleTransaction
        fields = ['product', 'product__category', 'region', 'date_from', 'date_to', 'min_amount', 'max_amount']
