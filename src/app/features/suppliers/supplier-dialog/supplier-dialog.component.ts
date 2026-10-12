import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Supplier, SupplierRequest } from '../../../core/models';

@Component({
  selector: 'app-supplier-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './supplier-dialog.component.html',
  styleUrl: './supplier-dialog.component.scss'
})
export class SupplierDialogComponent {
  private fb = inject(FormBuilder);
  private ref = inject(MatDialogRef<SupplierDialogComponent>);
  data = inject<{ supplier: Supplier | null }>(MAT_DIALOG_DATA);

  form = this.fb.nonNullable.group({
    nom: [this.data.supplier?.nom ?? '', [Validators.required, Validators.maxLength(150)]],
    telephone: [this.data.supplier?.telephone ?? '', Validators.maxLength(30)],
    email: [this.data.supplier?.email ?? '', Validators.email],
    adresse: [this.data.supplier?.adresse ?? '', Validators.maxLength(255)]
  });

  save() {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const body: SupplierRequest = {
      nom: v.nom.trim(),
      telephone: v.telephone.trim() || null,
      email: v.email.trim() || null,
      adresse: v.adresse.trim() || null
    };
    this.ref.close(body);
  }
}


