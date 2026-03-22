import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { SalesService, Transaction, Category, TransactionFilters } from '../../core/services/sales.service';
import { AuthService } from '../../core/services/auth.service';
import { TransactionDialogComponent } from './transaction-dialog';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MatToolbarModule, MatButtonModule, MatIconModule,
    MatTableModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatPaginatorModule, MatDialogModule,
    MatSnackBarModule, MatTooltipModule, MatProgressSpinnerModule,
    MatDatepickerModule, MatNativeDateModule
  ],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss'
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  categories: Category[] = [];
  loading = false;
  totalCount = 0;
  pageSize = 20;
  currentPage = 0;

  filters: TransactionFilters = {
    search: '',
    region: '',
    product__category: undefined,
    ordering: '-sale_date',
  };

  dateFrom: Date | null = null;
  dateTo: Date | null = null;

  regions = ['', 'north', 'south', 'east', 'west', 'central'];
  tableColumns = ['sale_date', 'product', 'category', 'region', 'quantity', 'unit_price', 'total_amount', 'actions'];

  constructor(
    public auth: AuthService,
    private sales: SalesService,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.sales.getCategories().subscribe(res => this.categories = res.results);
    this.load();
  }

  private formatDate(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  load(): void {
    this.loading = true;
    const params: TransactionFilters = {
      ...this.filters,
      page: this.currentPage + 1,
      page_size: this.pageSize,
      date_from: this.dateFrom ? this.formatDate(this.dateFrom) : '',
      date_to: this.dateTo ? this.formatDate(this.dateTo) : '',
    };
    this.sales.getTransactions(params).subscribe({
      next: (res) => {
        this.transactions = res.results;
        this.totalCount = res.count;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.load();
  }

  clearFilters(): void {
    this.filters = { search: '', region: '', product__category: undefined, ordering: '-sale_date' };
    this.dateFrom = null;
    this.dateTo = null;
    this.currentPage = 0;
    this.load();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.load();
  }

  openDialog(transaction: Transaction | null): void {
    const ref = this.dialog.open(TransactionDialogComponent, {
      width: '520px',
      data: { transaction }
    });

    ref.afterClosed().subscribe(result => {
      if (!result) return;
      if (transaction) {
        this.sales.updateTransaction(transaction.id, result).subscribe({
          next: () => { this.snack.open('Transaction updated', '', { duration: 2500 }); this.load(); },
          error: () => this.snack.open('Update failed', '', { duration: 2500, panelClass: 'error-snack' })
        });
      } else {
        this.sales.createTransaction(result).subscribe({
          next: () => { this.snack.open('Transaction added', '', { duration: 2500 }); this.currentPage = 0; this.load(); },
          error: () => this.snack.open('Create failed', '', { duration: 2500, panelClass: 'error-snack' })
        });
      }
    });
  }

  delete(transaction: Transaction): void {
    if (!confirm('Delete this transaction?')) return;
    this.sales.deleteTransaction(transaction.id).subscribe({
      next: () => { this.snack.open('Deleted', '', { duration: 2500 }); this.load(); },
      error: () => this.snack.open('Delete failed', '', { duration: 2500, panelClass: 'error-snack' })
    });
  }
}
