import { MatPaginatorIntl } from '@angular/material/paginator';

export function frPaginatorIntl(): MatPaginatorIntl {
  const intl = new MatPaginatorIntl();
  intl.itemsPerPageLabel = 'Éléments par page :';
  intl.nextPageLabel = 'Page suivante';
  intl.previousPageLabel = 'Page précédente';
  intl.getRangeLabel = (page, size, length) => {
    if (length === 0) return '0 sur 0';
    const start = page * size;
    return `${start + 1} – ${Math.min(start + size, length)} sur ${length}`;
  };
  return intl;
}
