import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProcessService } from './process.service';
import { JudicialProcess, PageResponse } from '../models/process.model';

describe('ProcessService', () => {
  let service: ProcessService;
  let httpMock: HttpTestingController;

  const mockProcess: JudicialProcess = {
    id: 1,
    processNumber: '1234567-89.2024.8.26.0001',
    subject: 'Execução Fiscal',
    status: 'ACTIVE',
    responsibleName: 'Dr. João',
    responsibleEmail: 'joao@gov.br',
    openingDate: '2024-01-01',
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProcessService]
    });
    service = TestBed.inject(ProcessService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('findAll() should call GET /api/v1/processes with params', () => {
    const mockPage: PageResponse<JudicialProcess> = {
      content: [mockProcess],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
      last: true
    };

    service.findAll({ page: 0, size: 10 }).subscribe(res => {
      expect(res.content.length).toBe(1);
      expect(res.totalElements).toBe(1);
    });

    const req = httpMock.expectOne(r => r.url.includes('/processes'));
    expect(req.request.method).toBe('GET');
    req.flush(mockPage);
  });

  it('findById() should call GET /api/v1/processes/:id', () => {
    service.findById(1).subscribe(res => {
      expect(res.id).toBe(1);
    });

    const req = httpMock.expectOne('/api/v1/processes/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockProcess);
  });

  it('create() should call POST /api/v1/processes', () => {
    const payload = {
      processNumber: '1234567-89.2024.8.26.0001',
      subject: 'Teste',
      status: 'ACTIVE' as const,
      responsibleName: 'Test',
      responsibleEmail: 'test@gov.br',
      openingDate: '2024-01-01'
    };

    service.create(payload).subscribe(res => {
      expect(res.id).toBe(1);
    });

    const req = httpMock.expectOne('/api/v1/processes');
    expect(req.request.method).toBe('POST');
    req.flush(mockProcess);
  });

  it('delete() should call DELETE /api/v1/processes/:id', () => {
    service.delete(1).subscribe();
    const req = httpMock.expectOne('/api/v1/processes/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
