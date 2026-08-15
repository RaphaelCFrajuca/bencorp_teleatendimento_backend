import { AuditLogsService } from '../../service/audit-logs.service';
import { AuditAction } from '../../enum/audit-action.enum';

describe('AuditLogsService', () => {
  const logger = {
    log: jest.fn(),
    error: jest.fn(),
  };

  const auditLogRepository = {
    createAuditLog: jest.fn(),
    getAuditLogsByPatient: jest.fn(),
    getAuditLogsByMedicalRecord: jest.fn(),
    getAuditLogsByUser: jest.fn(),
    getAuditLogsInRange: jest.fn(),
  };

  let service: AuditLogsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuditLogsService(auditLogRepository as any, logger as any);
  });

  it('deve registrar auditoria com sucesso', async () => {
    auditLogRepository.createAuditLog.mockResolvedValue(undefined);

    await service.logMedicalRecordAccess(
      'u1',
      'doctor',
      'p1',
      AuditAction.BUSCAR,
      '/medical-records/m1',
      'GET',
      200,
      'm1',
    );

    expect(auditLogRepository.createAuditLog).toHaveBeenCalled();
  });

  it('deve tratar erro de auditoria sem lançar exceção', async () => {
    auditLogRepository.createAuditLog.mockRejectedValue(new Error('db'));

    await expect(
      service.logMedicalRecordAccess(
        'u1',
        'doctor',
        'p1',
        AuditAction.BUSCAR,
        '/medical-records/m1',
        'GET',
        200,
      ),
    ).resolves.toBeUndefined();

    expect(logger.error).toHaveBeenCalled();
  });
});
