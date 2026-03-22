import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatSnackBarModule, MatProgressSpinnerModule, MatIconModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {
  form = { username: '', email: '', first_name: '', last_name: '', password: '' };
  loading = false;
  hidePassword = true;

  constructor(private auth: AuthService, private router: Router, private snack: MatSnackBar) {}

  submit(): void {
    if (!this.form.username || !this.form.password) {
      this.snack.open('Username and password are required', 'Dismiss', { duration: 3000, panelClass: 'error-snack' });
      return;
    }
    this.loading = true;
    this.auth.register(this.form).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        const msg = err.error?.username?.[0] || err.error?.email?.[0] || 'Registration failed';
        this.snack.open(msg, 'Dismiss', { duration: 4000, panelClass: 'error-snack' });
        this.loading = false;
      }
    });
  }
}
