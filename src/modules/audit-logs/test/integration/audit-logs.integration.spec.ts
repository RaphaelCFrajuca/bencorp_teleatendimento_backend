import { Test } from '@nestjs/testing';
import { Logger } from 'nestjs-pino';
import { AuditLogsService } from '../../service/audit-logs.service';

describe('AuditLogsService Integration', () => {
  const repository = {
    createAuditLog: jest.fn(),
    getAuditLogsByPatient: jest.fn(),
    getAuditLogsByMedicalRecord: jest.fn(),
    getAuditLogsByUser: jest.fn(),
    getAuditLogsInRange: jest.fn(),
  };

  const logger = {
    log: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve montar provider e consultar logs por paciente', async () => {
    repository.getAuditLogsByPatient.mockResolvedValue([{ id: 'a1' }]);

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuditLogsService,
        { provide: 'AUDIT_LOG_REPOSITORY', useValue: repository },
        { provide: Logger, useValue: logger },
      ],
    }).compile();

    const service = moduleRef.get(AuditLogsService);
    const result = await service.getPatientAuditLogs('p1', 10);

    expect(result).toEqual([{ id: 'a1' }]);
  });
});
