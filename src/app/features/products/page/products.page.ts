import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ApiService } from '../../../core/api.service';
import { AuthService } from '../../../core/auth.service';
import { Category, Product, ProductRequest, Supplier } from '../../../core/models';
import { ProductDialogComponent } from '../product-dialog/product-dialog.component';

@Component({
  selector: 'app-products-page',
  imports: [ReactiveFormsModule, CurrencyPipe, MatTableModule, MatPaginatorModule, MatSortModule,
            MatFormFieldModule, MatInputModule, MatSelectModule, MatCheckboxModule, MatButtonModule,
            MatIconModule, MatChipsModule, MatDialogModule, MatSnackBarModule],
  templateUrl:'./products.page.html',
  styleUrl:'./products.page.scss'
})
export class ProductsPage implements OnInit {
  private api = inject(ApiService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);
  auth = inject(AuthService);

  rows = signal<Product[]>([]);
  total = signal(0);
  categories = signal<Category[]>([]);
  suppliers = signal<Supplier[]>([]);

  search = new FormControl('', { nonNullable: true });
  category = new FormControl<number | null>(null);
  lowStock = new FormControl(false, { nonNullable: true });

  page = 0;
  size = 10;
  sort = 'nom';
  dir: 'asc' | 'desc' = 'asc';

  columns = () => this.auth.isAdmin()
    ? ['reference', 'nom', 'categoryNom', 'supplierNom', 'prix', 'quantite', 'actions']
    : ['reference', 'nom', 'categoryNom', 'supplierNom', 'prix', 'quantite'];

  ngOnInit() {
    this.api.categories().subscribe(c => this.categories.set(c));
    this.api.suppliers().subscribe(s => this.suppliers.set(s));

    this.search.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.resetAndLoad());
    this.category.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.resetAndLoad());
    this.lowStock.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.resetAndLoad());

    this.load();
  }

  private resetAndLoad() { this.page = 0; this.load(); }

  load() {
    this.api.products({
      q: this.search.value.trim(),
      categoryId: this.category.value,
      lowStock: this.lowStock.value,
      page: this.page, size: this.size, sort: this.sort, dir: this.dir
    }).subscribe({
      next: res => { this.rows.set(res.content); this.total.set(res.totalElements); },
      error: () => this.notify('Impossible de charger les produits')
    });
  }

  onPage(e: PageEvent) { this.page = e.pageIndex; this.size = e.pageSize; this.load(); }

  onSort(s: Sort) {
    this.sort = s.direction ? s.active : 'nom';
    this.dir = s.direction === 'desc' ? 'desc' : 'asc';
    this.page = 0;
    this.load();
  }

  openDialog(product: Product | null) {
    this.dialog.open(ProductDialogComponent, {
      data: { product, categories: this.categories(), suppliers: this.suppliers() }
    }).afterClosed().subscribe((body: ProductRequest | undefined) => {
      if (!body) return;
      const call = product ? this.api.updateProduct(product.id, body) : this.api.createProduct(body);
      call.subscribe({
        next: () => { this.notify(product ? 'Produit modifié' : 'Produit créé'); this.load(); },
        error: err => this.notify(this.errorMessage(err))
      });
    });
  }

  remove(p: Product) {
    if (!confirm(`Supprimer « ${p.nom} » ?`)) return;
    this.api.deleteProduct(p.id).subscribe({
      next: () => { this.notify('Produit supprimé'); this.load(); },
      error: err => this.notify(this.errorMessage(err))
    });
  }

  export() {
    this.api.exportProducts().subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'produits.csv';
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.notify("Échec de l'export")
    });
  }

  private errorMessage(err: any): string {
    const details = err.error?.details;
    if (details) return Object.values(details).join(' · ');
    return err.error?.message ?? 'Une erreur est survenue';
  }

  private notify(message: string) { this.snack.open(message, 'OK', { duration: 4000 }); }
}
