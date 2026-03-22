from datetime import date, timedelta

from django.db.models import Sum, Count, Avg, F
from django.db.models.functions import TruncMonth, TruncDay
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.sales.models import SaleTransaction


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def summary(request):
    qs = SaleTransaction.objects.all()
    total_revenue = qs.aggregate(total=Sum('total_amount'))['total'] or 0
    total_transactions = qs.count()
    total_units = qs.aggregate(total=Sum('quantity'))['total'] or 0
    avg_order_value = qs.aggregate(avg=Avg('total_amount'))['avg'] or 0

    return Response({
        'total_revenue': float(total_revenue),
        'total_transactions': total_transactions,
        'total_units_sold': total_units,
        'avg_order_value': float(avg_order_value),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def revenue_by_category(request):
    data = (
        SaleTransaction.objects
        .values('product__category__name')
        .annotate(
            category=F('product__category__name'),
            revenue=Sum('total_amount'),
            transactions=Count('id'),
            units=Sum('quantity'),
        )
        .order_by('-revenue')
    )
    return Response([{
        'category': d['product__category__name'],
        'revenue': float(d['revenue']),
        'transactions': d['transactions'],
        'units': d['units'],
    } for d in data])


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def revenue_over_time(request):
    data = (
        SaleTransaction.objects
        .annotate(month=TruncMonth('sale_date'))
        .values('month')
        .annotate(revenue=Sum('total_amount'), transactions=Count('id'))
        .order_by('month')
    )

    points = [{'month': d['month'].strftime('%Y-%m'), 'revenue': float(d['revenue']), 'transactions': d['transactions']} for d in data]

    trend = None
    if len(points) >= 2:
        n = len(points)
        x_vals = list(range(n))
        y_vals = [p['revenue'] for p in points]
        x_mean = sum(x_vals) / n
        y_mean = sum(y_vals) / n
        numerator = sum((x_vals[i] - x_mean) * (y_vals[i] - y_mean) for i in range(n))
        denominator = sum((x_vals[i] - x_mean) ** 2 for i in range(n))
        slope = numerator / denominator if denominator != 0 else 0
        intercept = y_mean - slope * x_mean

        trend_line = [round(intercept + slope * x, 2) for x in x_vals]
        forecast = [round(intercept + slope * (n + i), 2) for i in range(3)]
        trend = {'slope': round(slope, 2), 'intercept': round(intercept, 2), 'trend_line': trend_line, 'forecast': forecast}

    return Response({'data': points, 'trend': trend})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def top_products(request):
    limit = int(request.query_params.get('limit', 10))
    data = (
        SaleTransaction.objects
        .values('product__id', 'product__name', 'product__category__name')
        .annotate(
            revenue=Sum('total_amount'),
            units=Sum('quantity'),
            transactions=Count('id'),
        )
        .order_by('-revenue')[:limit]
    )
    return Response([{
        'product_id': d['product__id'],
        'product': d['product__name'],
        'category': d['product__category__name'],
        'revenue': float(d['revenue']),
        'units': d['units'],
        'transactions': d['transactions'],
    } for d in data])


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def revenue_by_region(request):
    data = (
        SaleTransaction.objects
        .values('region')
        .annotate(revenue=Sum('total_amount'), transactions=Count('id'), units=Sum('quantity'))
        .order_by('-revenue')
    )
    return Response([{
        'region': d['region'].capitalize(),
        'revenue': float(d['revenue']),
        'transactions': d['transactions'],
        'units': d['units'],
    } for d in data])


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def daily_sales(request):
    end = date.today()
    start = end - timedelta(days=30)

    data = (
        SaleTransaction.objects
        .filter(sale_date__range=[start, end])
        .annotate(day=TruncDay('sale_date'))
        .values('day')
        .annotate(revenue=Sum('total_amount'), transactions=Count('id'))
        .order_by('day')
    )
    return Response([{
        'date': d['day'].strftime('%Y-%m-%d'),
        'revenue': float(d['revenue']),
        'transactions': d['transactions'],
    } for d in data])
