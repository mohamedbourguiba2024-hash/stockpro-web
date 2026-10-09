import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Category, Product, Supplier } from '../../core/models';

export interface ProductDialogData {
  product: Product | null;
  categories: Category[];
  suppliers: Supplier[];
}

@Component({
  selector: 'app-product-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule,
            MatInputModule, MatSelectModule],
  template: `
    <h2 mat-dialog-title>{{ data.product ? 'Modifier le produit' : 'Nouveau produit' }}</h2>
    <form [formGroup]="form" (ngSubmit)="save()">
      <mat-dialog-content class="content">
        <mat-form-field appearance="outline">
          <mat-label>Référence</mat-label>
          <input matInput formControlName="reference" />
          @if (form.controls.reference.invalid) { <mat-error>Obligatoire (50 max)</mat-error> }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Nom</mat-label>
          <input matInput formControlName="nom" />
          @if (form.controls.nom.invalid) { <mat-error>Obligatoire (150 max)</mat-error> }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Description</mat-label>
          <textarea matInput rows="2" formControlName="description"></textarea>
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Prix</mat-label>
            <input matInput type="number" step="0.01" min="0" formControlName="prix" />
            @if (form.controls.prix.invalid) { <mat-error>Prix invalide</mat-error> }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Seuil d'alerte</mat-label>
            <input matInput type="number" min="0" formControlName="seuilAlerte" />
            @if (form.controls.seuilAlerte.invalid) { <mat-error>Seuil invalide</mat-error> }
          </mat-form-field>
        </div>

        @if (!data.product) {
          <mat-form-field appearance="outline">
            <mat-label>Quantité initiale</mat-label>
            <input matInput type="number" min="0" formControlName="quantite" />
            @if (form.controls.quantite.invalid) { <mat-error>Quantité invalide</mat-error> }
          </mat-form-field>
        } @else {
          <p class="hint">La quantité ({{ data.product.quantite }}) se modifie via les mouvements de stock.</p>
        }

        <mat-form-field appearance="outline">
          <mat-label>Catégorie</mat-label>
          <mat-select formControlName="categoryId">
            <mat-option [value]="null">— Aucune —</mat-option>
            @for (c of data.categories; track c.id) {
              <mat-option [value]="c.id">{{ c.nom }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Fournisseur</mat-label>
          <mat-select formControlName="supplierId">
            <mat-option [value]="null">— Aucun —</mat-option>
            @for (s of data.suppliers; track s.id) {
              <mat-option [value]="s.id">{{ s.nom }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>Annuler</button>
        <button mat-flat-button type="submit" [disabled]="form.invalid">Enregistrer</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: `
    .content { display: flex; flex-direction: column; gap: 4px; min-width: min(480px, 80vw); padding-top: 8px; }
    .row { display: flex; gap: 12px; }
    .row mat-form-field { flex: 1; }
    .hint { margin: 0 0 16px; opacity: 0.7; }
  `
})
export class ProductDialogComponent {
  private fb = inject(FormBuilder);
  private ref = inject(MatDialogRef<ProductDialogComponent>);
  data = inject<ProductDialogData>(MAT_DIALOG_DATA);

  form = this.fb.group({
    reference: [this.data.product?.reference ?? '', [Validators.required, Validators.maxLength(50)]],
    nom: [this.data.product?.nom ?? '', [Validators.required, Validators.maxLength(150)]],
    description: [this.data.product?.description ?? ''],
    prix: [this.data.product?.prix ?? 0, [Validators.required, Validators.min(0)]],
    seuilAlerte: [this.data.product?.seuilAlerte ?? 0, [Validators.required, Validators.min(0)]],
    quantite: [this.data.product?.quantite ?? 0, [Validators.required, Validators.min(0)]],
    categoryId: [this.data.product?.categoryId ?? (null as number | null)],
    supplierId: [this.data.product?.supplierId ?? (null as number | null)]
  });

  save() {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.ref.close({
      reference: v.reference!.trim(),
      nom: v.nom!.trim(),
      description: v.description?.trim() || null,
      prix: Number(v.prix),
      quantite: Number(v.quantite),
      seuilAlerte: Number(v.seuilAlerte),
      categoryId: v.categoryId,
      supplierId: v.supplierId
    });
  }
}
