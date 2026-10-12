import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { ApiService } from '../../core/api.service';
import { Movement, MovementType, Product } from '../../core/models';

@Component({
  selector: 'app-movements-page',
  imports: [ReactiveFormsModule, DatePipe, MatTableModule, MatPaginatorModule, MatFormFieldModule,
            MatInputModule, MatSelectModule, MatButtonModule, MatButtonToggleModule,
            MatIconModule, MatSnackBarModule],
  templateUrl: './movements.page.html',
  styleUrl: './movements.page.scss'
})
export class MovementsPage implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);

  products = signal<Product[]>([]);
  rows = signal<Movement[]>([]);
  total = signal(0);
  saving = signal(false);
  columns = ['date', 'produit', 'type', 'quantite', 'commentaire', 'utilisateur'];

  page = 0;
  size = 10;

  form = this.fb.group({
    productId: [null as number | null, Validators.required],
    type: ['ENTREE' as MovementType, Validators.required],
    quantite: [1, [Validators.required, Validators.min(1)]],
    commentaire: ['', Validators.maxLength(500)]
  });

  filters = this.fb.group({
    productId: [null as number | null],
    type: [null as MovementType | null],
    from: [''],
    to: ['']
  });

  get selectedProduct(): Product | undefined {
    return this.products().find(p => p.id === this.form.controls.productId.value);
  }

  ngOnInit() {
    this.loadProducts();
    this.filters.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.page = 0;
      this.load();
    });
    this.load();
  }

  private loadProducts() {
    this.api.productOptions().subscribe(res => this.products.set(res.content));
  }

  load() {
    const f = this.filters.getRawValue();
    this.api.movements({
      productId: f.productId, type: f.type,
      from: f.from || undefined, to: f.to || undefined,
      page: this.page, size: this.size
    }).subscribe({
      next: res => { this.rows.set(res.content); this.total.set(res.totalElements); },
      error: () => this.notify("Impossible de charger l'historique")
    });
  }

  onPage(e: PageEvent) { this.page = e.pageIndex; this.size = e.pageSize; this.load(); }

  clearFilters() { this.filters.reset({ productId: null, type: null, from: '', to: '' }); }

  submit() {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.saving.set(true);
    this.api.createMovement({
      productId: v.productId!, type: v.type!,
      quantite: Number(v.quantite), commentaire: v.commentaire?.trim() || null
    }).subscribe({
      next: m => {
        this.saving.set(false);
        this.notify(`${m.type === 'ENTREE' ? 'Entrée' : 'Sortie'} enregistrée : nouveau stock ${m.stockApres}`);
        this.form.patchValue({ quantite: 1, commentaire: '' });
        this.form.controls.commentaire.markAsUntouched();
        this.loadProducts();
        this.page = 0;
        this.load();
      },
      error: err => {
        this.saving.set(false);
        this.notify(this.errorMessage(err));
      }
    });
  }

  private errorMessage(err: any): string {
    const details = err.error?.details;
    if (details) return Object.values(details).join(' · ');
    return err.error?.message ?? 'Une erreur est survenue';
  }

  private notify(message: string) { this.snack.open(message, 'OK', { duration: 5000 }); }
}
