import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Logger } from 'nestjs-pino';
import { AuditLogsService } from '../../service/audit-logs.service';

describe('AuditLogs e2e', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuditLogsService,
        {
          provide: 'AUDIT_LOG_REPOSITORY',
          useValue: {
            createAuditLog: jest.fn(),
            getAuditLogsByPatient: jest.fn(),
            getAuditLogsByMedicalRecord: jest.fn(),
            getAuditLogsByUser: jest.fn(),
            getAuditLogsInRange: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: { log: jest.fn(), error: jest.fn() },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('deve subir a aplicação de teste do módulo de auditoria', () => {
    expect(app).toBeDefined();
  });
});
