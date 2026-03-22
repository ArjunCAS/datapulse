import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { SalesService, Transaction, Category, Product } from '../../core/services/sales.service';

@Component({
  selector: 'app-transaction-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatDatepickerModule, MatNativeDateModule
  ],
  templateUrl: './transaction-dialog.html',
})
export class TransactionDialogComponent implements OnInit {
  categories: Category[] = [];
  products: Product[] = [];
  regions = ['north', 'south', 'east', 'west', 'central'];

  form: Partial<Transaction> & { sale_date_obj?: Date } = {
    product: undefined,
    quantity: 1,
    unit_price: undefined,
    region: '',
    sale_date: '',
    sale_date_obj: new Date(),
  };

  constructor(
    public dialogRef: MatDialogRef<TransactionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { transaction: Transaction | null },
    private sales: SalesService
  ) {}

  ngOnInit(): void {
    this.sales.getCategories().subscribe(res => this.categories = res.results);
    this.sales.getProducts().subscribe(res => this.products = res.results);

    if (this.data.transaction) {
      const t = this.data.transaction;
      this.form = {
        ...t,
        sale_date_obj: new Date(t.sale_date),
      };
    }
  }

  onCategoryChange(categoryId: number): void {
    this.sales.getProducts(categoryId).subscribe(res => {
      this.products = res.results;
      this.form.product = undefined;
    });
  }

  get selectedCategoryId(): number | undefined {
    const product = this.products.find(p => p.id === this.form.product);
    return product?.category;
  }

  save(): void {
    if (!this.form.product || !this.form.quantity || !this.form.unit_price || !this.form.region || !this.form.sale_date_obj) return;
    const date = this.form.sale_date_obj;
    const payload = {
      product: this.form.product,
      quantity: this.form.quantity,
      unit_price: this.form.unit_price,
      region: this.form.region,
      sale_date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
    };
    this.dialogRef.close(payload);
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
