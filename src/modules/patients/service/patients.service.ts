import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import type { PatientRepositoryInterface } from 'src/infra/database/interfaces/patient.repository.interface';
import { CreatePatientDto } from '../dto/create-patient.dto';
import { PatientResponseDto } from '../dto/patient-response.dto';
import { UpdatePatientDto } from '../dto/update-patient.dto';
import { Patient } from '../entity/patient.entity';
import { PatientStatus } from '../enum/patient-status.enum';

@Injectable()
export class PatientsService {
  constructor(
    @Inject('PATIENT_REPOSITORY') private readonly patientRepository: PatientRepositoryInterface,
    private readonly logger: Logger,
  ) {}

  private mapPatientToResponse(patient: Patient): PatientResponseDto {
    return {
      id: patient.id,
      email: patient.email,
      name: patient.name,
      cpf: patient.cpf,
      status: patient.status,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    };
  }

  async createPatient(dto: CreatePatientDto): Promise<PatientResponseDto> {
    this.logger.log('Tentativa de criação de paciente', { email: dto.email, cpf: dto.cpf });

    const patient = await this.patientRepository.createPatient({
      email: dto.email,
      name: dto.name,
      cpf: dto.cpf,
      status: PatientStatus.ACTIVE,
    });

    this.logger.log(`Paciente criado com sucesso: ${patient.id}`, {
      id: patient.id,
      email: patient.email,
    });
    return this.mapPatientToResponse(patient);
  }

  async getPatientById(id: string): Promise<PatientResponseDto> {
    this.logger.log(`Buscando paciente por ID: ${id}`, { id });
    const patient = await this.patientRepository.getPatientById(id);

    if (!patient) {
      this.logger.warn(`Paciente não encontrado para o ID: ${id}`, { id });
      throw new NotFoundException(`Paciente com ID ${id} não encontrado.`);
    }

    return this.mapPatientToResponse(patient);
  }

  async getPatientByEmail(email: string): Promise<PatientResponseDto | null> {
    this.logger.log(`Buscando paciente por email: ${email}`, { email });
    const patient = await this.patientRepository.getPatientByEmail(email);
    return patient ? this.mapPatientToResponse(patient) : null;
  }

  async getPatientByCpf(cpf: string): Promise<PatientResponseDto | null> {
    this.logger.log(`Buscando paciente por CPF: ${cpf}`, { cpf });
    const patient = await this.patientRepository.getPatientByCpf(cpf);
    return patient ? this.mapPatientToResponse(patient) : null;
  }

  async listPatients(skip: number = 0, limit: number = 50): Promise<PatientResponseDto[]> {
    this.logger.log(`Listando pacientes`, { skip, limit });
    const patients = await this.patientRepository.listPatients(skip, limit);
    return patients.map((patient) => this.mapPatientToResponse(patient));
  }

  async updatePatient(id: string, dto: UpdatePatientDto): Promise<PatientResponseDto> {
    this.logger.log(`Tentativa de atualização do paciente ID: ${id}`, { id });

    const payload: Partial<Patient> = {
      ...dto,
    };

    const patient = await this.patientRepository.updatePatient(id, payload);
    if (!patient) {
      this.logger.warn(`Paciente não encontrado para atualização: ${id}`, { id });
      throw new NotFoundException(`Paciente com ID ${id} não encontrado.`);
    }

    this.logger.log(`Paciente atualizado com sucesso: ${id}`, { id });
    return this.mapPatientToResponse(patient);
  }

  async deactivatePatient(id: string): Promise<boolean> {
    this.logger.log(`Tentativa de desativação do paciente ID: ${id}`, { id });
    const deleted = await this.patientRepository.softDeletePatient(id);

    if (!deleted) {
      this.logger.warn(`Não foi possível desativar paciente ID: ${id}`, { id });
      throw new NotFoundException(`Paciente com ID ${id} não encontrado.`);
    }

    this.logger.log(`Paciente desativado com sucesso: ${id}`, { id });
    return deleted;
  }
}
