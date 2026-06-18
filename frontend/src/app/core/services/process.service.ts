import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  JudicialProcess,
  JudicialProcessRequest,
  PageResponse,
  ProcessFilter
} from '../models/process.model';

@Injectable({ providedIn: 'root' })
export class ProcessService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/processes`;

  findAll(filter: ProcessFilter): Observable<PageResponse<JudicialProcess>> {
    let params = new HttpParams()
      .set('page', filter.page)
      .set('size', filter.size);

    if (filter.status) params = params.set('status', filter.status);
    if (filter.search?.trim()) params = params.set('search', filter.search.trim());

    return this.http.get<PageResponse<JudicialProcess>>(this.baseUrl, { params });
  }

  findById(id: number): Observable<JudicialProcess> {
    return this.http.get<JudicialProcess>(`${this.baseUrl}/${id}`);
  }

  create(request: JudicialProcessRequest): Observable<JudicialProcess> {
    return this.http.post<JudicialProcess>(this.baseUrl, request);
  }

  update(id: number, request: JudicialProcessRequest): Observable<JudicialProcess> {
    return this.http.put<JudicialProcess>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
