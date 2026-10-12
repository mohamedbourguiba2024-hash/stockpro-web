import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { ApiService } from '../../../core/api.service';
import { AuthService } from '../../../core/auth.service';
import { Category, CategoryRequest } from '../../../core/models';
import { CategoryDialogComponent } from '.././category-dialog/category-dialog.component';

@Component({
  selector: 'app-categories-page',
  imports: [ReactiveFormsModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule,
            MatFormFieldModule, MatInputModule, MatSnackBarModule],
  templateUrl: './categories.page.html',
  styleUrl: './categories.page.scss'
})
export class CategoriesPage implements OnInit {
  private api = inject(ApiService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);
  auth = inject(AuthService);

  rows = signal<Category[]>([]);
  search = new FormControl('', { nonNullable: true });
  private term = toSignal(this.search.valueChanges, { initialValue: '' });

  filtered = computed(() => {
    const t = this.term().trim().toLowerCase();
    return t ? this.rows().filter(c => c.nom.toLowerCase().includes(t)) : this.rows();
  });

  columns = computed(() => this.auth.isAdmin() ? ['nom', 'actions'] : ['nom']);

  ngOnInit() { this.load(); }

  load() {
    this.api.categories().subscribe({
      next: c => this.rows.set(c),
      error: () => this.notify('Impossible de charger les catégories')
    });
  }

  openDialog(category: Category | null) {
    this.dialog.open(CategoryDialogComponent, { data: { category } })
      .afterClosed().subscribe((body: CategoryRequest | undefined) => {
        if (!body) return;
        const call = category ? this.api.updateCategory(category.id, body) : this.api.createCategory(body);
        call.subscribe({
          next: () => { this.notify(category ? 'Catégorie modifiée' : 'Catégorie créée'); this.load(); },
          error: err => this.notify(this.errorMessage(err))
        });
      });
  }

  remove(c: Category) {
    if (!confirm(`Supprimer la catégorie « ${c.nom} » ?`)) return;
    this.api.deleteCategory(c.id).subscribe({
      next: () => { this.notify('Catégorie supprimée'); this.load(); },
      error: err => this.notify(this.errorMessage(err))
    });
  }

  private errorMessage(err: any): string {
    const details = err.error?.details;
    if (details) return Object.values(details).join(' · ');
    return err.error?.message ?? 'Une erreur est survenue';
  }

  private notify(message: string) { this.snack.open(message, 'OK', { duration: 4000 }); }
}
