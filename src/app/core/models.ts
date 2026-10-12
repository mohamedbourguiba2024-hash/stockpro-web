export interface Product {
  id: number;
  reference: string;
  nom: string;
  description: string | null;
  prix: number;
  quantite: number;
  seuilAlerte: number;
  stockBas: boolean;
  categoryId: number | null;
  categoryNom: string | null;
  supplierId: number | null;
  supplierNom: string | null;
}

export interface ProductRequest {
  reference: string;
  nom: string;
  description: string | null;
  prix: number;
  quantite: number;
  seuilAlerte: number;
  categoryId: number | null;
  supplierId: number | null;
}

export interface Category { id: number; nom: string; }

export interface Supplier {
  id: number;
  nom: string;
  telephone: string | null;
  email: string | null;
  adresse: string | null;
}

export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export type MovementType = 'ENTREE' | 'SORTIE';

export interface Movement {
  id: number;
  productId: number;
  productReference: string;
  productNom: string;
  type: MovementType;
  quantite: number;
  date: string;
  commentaire: string | null;
  userEmail: string;
  stockApres: number | null;
}

export interface MovementRequest {
  productId: number;
  type: MovementType;
  quantite: number;
  commentaire: string | null;
}
