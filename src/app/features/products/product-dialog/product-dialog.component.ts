import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Category, Product, Supplier } from '../../../core/models';

export interface ProductDialogData {
  product: Product | null;
  categories: Category[];
  suppliers: Supplier[];
}

@Component({
  selector: 'app-product-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule,
            MatInputModule, MatSelectModule],
  templateUrl:'./product-dialog.component.html',
  styleUrl:'./product-dialog.component.scss'
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
