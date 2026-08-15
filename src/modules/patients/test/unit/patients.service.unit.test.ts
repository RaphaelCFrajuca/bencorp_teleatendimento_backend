import { NotFoundException } from '@nestjs/common';
import { PatientsService } from '../../service/patients.service';
import { PatientStatus } from '../../enum/patient-status.enum';

describe('PatientsService', () => {
  const logger = {
    log: jest.fn(),
    warn: jest.fn(),
  };

  const patientRepository = {
    createPatient: jest.fn(),
    getPatientById: jest.fn(),
    getPatientByEmail: jest.fn(),
    getPatientByCpf: jest.fn(),
    listPatients: jest.fn(),
    updatePatient: jest.fn(),
    softDeletePatient: jest.fn(),
  };

  let service: PatientsService;

  const patient = {
    id: 'p1',
    email: 'patient@bencorp.com',
    name: 'Paciente',
    cpf: '12345678901',
    status: PatientStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PatientsService(patientRepository as any, logger as any);
  });

  it('deve criar paciente com status ativo', async () => {
    patientRepository.createPatient.mockResolvedValue(patient);

    const result = await service.createPatient({
      email: patient.email,
      name: patient.name,
      cpf: patient.cpf,
    });

    expect(patientRepository.createPatient).toHaveBeenCalledWith(
      expect.objectContaining({ status: PatientStatus.ACTIVE }),
    );
    expect(result.id).toBe('p1');
  });

  it('deve lançar not found ao buscar paciente inexistente', async () => {
    patientRepository.getPatientById.mockResolvedValue(null);

    await expect(service.getPatientById('x')).rejects.toThrow(NotFoundException);
  });

  it('deve listar pacientes com skip e limit', async () => {
    patientRepository.listPatients.mockResolvedValue([patient]);

    const result = await service.listPatients(5, 10);

    expect(patientRepository.listPatients).toHaveBeenCalledWith(5, 10);
    expect(result).toHaveLength(1);
  });

  it('deve lançar not found ao atualizar paciente inexistente', async () => {
    patientRepository.updatePatient.mockResolvedValue(null);

    await expect(service.updatePatient('x', { name: 'Novo' })).rejects.toThrow(NotFoundException);
  });

  it('deve lançar not found ao desativar paciente inexistente', async () => {
    patientRepository.softDeletePatient.mockResolvedValue(false);

    await expect(service.deactivatePatient('x')).rejects.toThrow(NotFoundException);
  });
});
