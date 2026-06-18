import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'Ocorreu um erro inesperado.';

      if (error.status === 0) {
        message = 'Sem conexão com o servidor. Verifique sua rede.';
      } else if (error.status === 404) {
        message = 'Recurso não encontrado.';
      } else if (error.status === 409) {
        message = error.error?.message ?? 'Conflito de dados.';
      } else if (error.status === 400) {
        message = 'Dados inválidos. Verifique o formulário.';
      } else if (error.status >= 500) {
        message = 'Erro interno do servidor. Tente novamente mais tarde.';
      }

      // Don't show snack for validation errors - handled by form
      if (error.status !== 400) {
        snackBar.open(message, 'Fechar', {
          duration: 5000,
          panelClass: ['snack-error']
        });
      }

      return throwError(() => error);
    })
  );
};
