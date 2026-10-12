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
import { Supplier, SupplierRequest } from '../../../core/models';
import { SupplierDialogComponent } from '../supplier-dialog/supplier-dialog.component';

@Component({
  selector: 'app-suppliers-page',
  imports: [ReactiveFormsModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule,
            MatFormFieldModule, MatInputModule, MatSnackBarModule],
  templateUrl: './suppliers.page.html',
  styleUrl: './suppliers.page.scss'
})
export class SuppliersPage implements OnInit {
  private api = inject(ApiService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);
  auth = inject(AuthService);

  rows = signal<Supplier[]>([]);
  search = new FormControl('', { nonNullable: true });
  private term = toSignal(this.search.valueChanges, { initialValue: '' });

  filtered = computed(() => {
    const t = this.term().trim().toLowerCase();
    return t ? this.rows().filter(s =>
      [s.nom, s.email, s.telephone, s.adresse].some(v => v?.toLowerCase().includes(t))) : this.rows();
  });

  columns = computed(() => this.auth.isAdmin()
    ? ['nom', 'telephone', 'email', 'adresse', 'actions']
    : ['nom', 'telephone', 'email', 'adresse']);

  ngOnInit() { this.load(); }

  load() {
    this.api.suppliers().subscribe({
      next: s => this.rows.set(s),
      error: () => this.notify('Impossible de charger les fournisseurs')
    });
  }

  openDialog(supplier: Supplier | null) {
    this.dialog.open(SupplierDialogComponent, { data: { supplier } })
      .afterClosed().subscribe((body: SupplierRequest | undefined) => {
        if (!body) return;
        const call = supplier ? this.api.updateSupplier(supplier.id, body) : this.api.createSupplier(body);
        call.subscribe({
          next: () => { this.notify(supplier ? 'Fournisseur modifié' : 'Fournisseur créé'); this.load(); },
          error: err => this.notify(this.errorMessage(err))
        });
      });
  }

  remove(s: Supplier) {
    if (!confirm(`Supprimer le fournisseur « ${s.nom} » ?`)) return;
    this.api.deleteSupplier(s.id).subscribe({
      next: () => { this.notify('Fournisseur supprimé'); this.load(); },
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
