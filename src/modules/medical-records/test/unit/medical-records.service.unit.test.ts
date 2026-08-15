import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { MedicalRecordsService } from '../../service/medical-records.service';
import { MedicalRecordStatus } from '../../enum/medical-record-status.enum';

describe('MedicalRecordsService', () => {
  const logger = {
    info: jest.fn(),
  };

  const medicalRecordRepository = {
    getConsultationById: jest.fn(),
    getMedicalRecordByConsultationId: jest.fn(),
    createMedicalRecord: jest.fn(),
    getMedicalRecordById: jest.fn(),
    getConsultationsByPatientAndProfessional: jest.fn(),
    getMedicalRecordsByPatient: jest.fn(),
    updateMedicalRecord: jest.fn(),
    createMedicalRecordAppendix: jest.fn(),
    getMedicalRecordAppendices: jest.fn(),
  };

  const record = {
    id: 'm1',
    consultationId: 'c1',
    professionalId: 'u1',
    patientId: 'p1',
    status: MedicalRecordStatus.RASCUNHO,
    diagnose: 'Dx',
    treatment: 'Tx',
    observations: 'Obs',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let service: MedicalRecordsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MedicalRecordsService(medicalRecordRepository as any, logger as any);
  });

  it('deve criar prontuário quando consulta estiver em andamento e profissional for o atribuído', async () => {
    medicalRecordRepository.getConsultationById.mockResolvedValue({
      id: 'c1',
      status: 'em_andamento',
      transferredToId: null,
      professionalId: 'u1',
      patientId: 'p1',
    });
    medicalRecordRepository.getMedicalRecordByConsultationId.mockResolvedValue(null);
    medicalRecordRepository.createMedicalRecord.mockResolvedValue(record);

    const result = await service.createMedicalRecord(
      {
        consultationId: 'c1',
        diagnose: 'Dx',
        treatment: 'Tx',
        observations: 'Obs',
      },
      'u1',
    );

    expect(result.id).toBe('m1');
    expect(medicalRecordRepository.createMedicalRecord).toHaveBeenCalled();
  });

  it('deve lançar not found ao criar sem consulta', async () => {
    medicalRecordRepository.getConsultationById.mockResolvedValue(null);

    await expect(
      service.createMedicalRecord(
        { consultationId: 'c1', diagnose: 'Dx', treatment: 'Tx', observations: 'Obs' },
        'u1',
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve lançar forbidden ao buscar prontuário de outro profissional', async () => {
    medicalRecordRepository.getMedicalRecordById.mockResolvedValue(record);

    await expect(service.getMedicalRecordById('m1', 'u2')).rejects.toThrow(ForbiddenException);
  });

  it('deve lançar bad request ao atualizar prontuário finalizado', async () => {
    medicalRecordRepository.getMedicalRecordById.mockResolvedValue({
      ...record,
      status: MedicalRecordStatus.FINALIZADO,
    });

    await expect(
      service.updateMedicalRecord('m1', { observations: 'Novo' }, 'u1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve finalizar prontuário', async () => {
    medicalRecordRepository.getMedicalRecordById.mockResolvedValue(record);
    medicalRecordRepository.updateMedicalRecord.mockResolvedValue({
      ...record,
      status: MedicalRecordStatus.FINALIZADO,
    });

    const result = await service.finalizeMedicalRecord('m1', 'u1');

    expect(result.status).toBe(MedicalRecordStatus.FINALIZADO);
  });

  it('deve adicionar apêndice apenas em prontuário finalizado', async () => {
    medicalRecordRepository.getMedicalRecordById.mockResolvedValue({
      ...record,
      status: MedicalRecordStatus.FINALIZADO,
    });
    medicalRecordRepository.createMedicalRecordAppendix.mockResolvedValue({
      id: 'a1',
      medicalRecordId: 'm1',
      professionalId: 'u1',
      content: 'Conteudo',
      reason: 'Correcao',
      createdAt: new Date(),
    });

    const result = await service.addAppendix(
      'm1',
      {
        content: 'Conteudo',
        reason: 'Correcao',
      },
      'u1',
    );

    expect(result.id).toBe('a1');
  });
});
