import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Category, CategoryRequest } from '../../../core/models';

@Component({
  selector: 'app-category-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './category-dialog.component.html',
  styleUrl: './category-dialog.component.scss'
})
export class CategoryDialogComponent {
  private fb = inject(FormBuilder);
  private ref = inject(MatDialogRef<CategoryDialogComponent>);
  data = inject<{ category: Category | null }>(MAT_DIALOG_DATA);

  form = this.fb.nonNullable.group({
    nom: [this.data.category?.nom ?? '', [Validators.required, Validators.maxLength(100)]]
  });

  save() {
    if (this.form.invalid) return;
    const body: CategoryRequest = { nom: this.form.getRawValue().nom.trim() };
    this.ref.close(body);
  }
}
