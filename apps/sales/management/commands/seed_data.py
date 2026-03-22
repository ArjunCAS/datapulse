import random
from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from apps.sales.models import Category, Product, SaleTransaction


CATEGORIES = [
    ('Electronics', 'Gadgets, devices, and tech accessories'),
    ('Software', 'Licenses, SaaS subscriptions, and tools'),
    ('Services', 'Consulting, support, and managed services'),
    ('Hardware', 'Servers, networking gear, and peripherals'),
    ('Cloud', 'Cloud infrastructure and platform services'),
]

PRODUCTS = {
    'Electronics': [
        ('Laptop Pro 15"', 1299.99),
        ('Wireless Headphones X1', 149.99),
        ('4K Monitor 27"', 499.99),
        ('USB-C Hub Pro', 79.99),
        ('Mechanical Keyboard', 129.99),
    ],
    'Software': [
        ('DataPulse Analytics Suite', 2499.99),
        ('CRM Enterprise License', 1999.99),
        ('Security Suite Annual', 899.99),
        ('Dev Tools Bundle', 499.99),
        ('BI Dashboard Pro', 1299.99),
    ],
    'Services': [
        ('Implementation Consulting', 5000.00),
        ('Premium Support Package', 1200.00),
        ('Data Migration Service', 3500.00),
        ('Training Workshop', 800.00),
        ('Custom Integration', 4500.00),
    ],
    'Hardware': [
        ('Server Rack Unit', 3999.99),
        ('Network Switch 48-Port', 799.99),
        ('NAS Storage 20TB', 1299.99),
        ('Firewall Appliance', 2499.99),
        ('Backup Drive Array', 899.99),
    ],
    'Cloud': [
        ('Cloud Compute Annual', 1800.00),
        ('Managed Database Service', 1200.00),
        ('CDN Enterprise Plan', 600.00),
        ('Object Storage 50TB', 400.00),
        ('Load Balancer Pro', 900.00),
    ],
}

REGIONS = ['north', 'south', 'east', 'west', 'central']


class Command(BaseCommand):
    help = 'Seed database with realistic sales data'

    def add_arguments(self, parser):
        parser.add_argument('--transactions', type=int, default=500)
        parser.add_argument('--days', type=int, default=365)
        parser.add_argument('--clear', action='store_true', help='Clear existing data first')

    def handle(self, *args, **options):
        if options['clear']:
            SaleTransaction.objects.all().delete()
            Product.objects.all().delete()
            Category.objects.all().delete()
            self.stdout.write('Cleared existing data.')

        # Create superuser if none exists
        if not User.objects.filter(is_superuser=True).exists():
            User.objects.create_superuser('admin', 'admin@datapulse.com', 'admin123')
            self.stdout.write(self.style.SUCCESS('Created superuser: admin / admin123'))

        # Create categories
        cat_objs = {}
        for name, desc in CATEGORIES:
            cat, _ = Category.objects.get_or_create(name=name, defaults={'description': desc})
            cat_objs[name] = cat
        self.stdout.write(f'Categories: {len(cat_objs)}')

        # Create products
        prod_objs = []
        for cat_name, products in PRODUCTS.items():
            for prod_name, price in products:
                prod, _ = Product.objects.get_or_create(
                    name=prod_name,
                    defaults={'category': cat_objs[cat_name], 'price': Decimal(str(price))}
                )
                prod_objs.append(prod)
        self.stdout.write(f'Products: {len(prod_objs)}')

        # Create transactions
        n = options['transactions']
        end_date = date.today()
        start_date = end_date - timedelta(days=options['days'])
        delta = (end_date - start_date).days

        transactions = []
        for _ in range(n):
            product = random.choice(prod_objs)
            quantity = random.randint(1, 10)
            # Slight price variation ±10%
            variation = Decimal(str(random.uniform(0.9, 1.1)))
            unit_price = (product.price * variation).quantize(Decimal('0.01'))
            sale_date = start_date + timedelta(days=random.randint(0, delta))
            region = random.choice(REGIONS)
            transactions.append(SaleTransaction(
                product=product,
                quantity=quantity,
                unit_price=unit_price,
                total_amount=quantity * unit_price,
                region=region,
                sale_date=sale_date,
            ))

        SaleTransaction.objects.bulk_create(transactions, ignore_conflicts=True)
        self.stdout.write(self.style.SUCCESS(
            f'Created {n} transactions. DB is ready!\n'
            f'Login: admin / admin123'
        ))
