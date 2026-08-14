import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import type { Database } from 'src/infra/database/interfaces/database.interface';
import { PatientRepositoryInterface } from 'src/infra/database/interfaces/patient.repository.interface';
import { Patient } from 'src/modules/patients/entity/patient.entity';
import { PatientStatus } from 'src/modules/patients/enum/patient-status.enum';
import { PatientEntity } from '../entities/patient.entity';

@Injectable()
export class PatientRepository implements PatientRepositoryInterface {
  constructor(
    private readonly database: Database,
    private readonly logger: Logger,
  ) {}

  private async getRepository() {
    const dataSource = await this.database.connect();
    return dataSource.getRepository(PatientEntity);
  }

  private normalizeCpf(cpf: string): string {
    return cpf.replace(/\D/g, '');
  }

  async createPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    const repository = await this.getRepository();
    const normalizedCpf = this.normalizeCpf(patient.cpf);

    const existingPatientByEmail = await repository.findOne({
      where: { email: patient.email },
    });
    if (existingPatientByEmail) {
      this.logger.warn(
        `Tentativa de criação de paciente com email duplicado. Email: ${patient.email}`,
      );
      throw new ConflictException('Email já cadastrado.');
    }

    const existingPatientByCpf = await repository.findOne({
      where: { cpf: normalizedCpf },
    });
    if (existingPatientByCpf) {
      this.logger.warn(`Tentativa de criação de paciente com CPF duplicado. CPF: ${patient.cpf}`);
      throw new ConflictException('CPF já cadastrado.');
    }

    this.logger.log(`Criando paciente: email=${patient.email}, cpf=${patient.cpf}`);
    return repository.save({
      ...patient,
      cpf: normalizedCpf,
    });
  }

  async getPatientById(id: string): Promise<Patient | null> {
    const repository = await this.getRepository();
    this.logger.log(`Buscando paciente por ID: ${id}`);
    return repository.findOne({ where: { id } });
  }

  async getPatientByEmail(email: string): Promise<Patient | null> {
    const repository = await this.getRepository();
    this.logger.log(`Buscando paciente por email: ${email}`);
    return repository.findOne({ where: { email } });
  }

  async getPatientByCpf(cpf: string): Promise<Patient | null> {
    const repository = await this.getRepository();
    const normalizedCpf = this.normalizeCpf(cpf);
    this.logger.log(`Buscando paciente por CPF: ${cpf}`);
    return repository.findOne({ where: { cpf: normalizedCpf } });
  }

  async listPatients(skip: number = 0, limit: number = 50): Promise<Patient[]> {
    const repository = await this.getRepository();
    this.logger.log(`Listando pacientes: skip=${skip}, limit=${limit}`);
    return repository.find({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async updatePatient(id: string, patient: Partial<Patient>): Promise<Patient | null> {
    const repository = await this.getRepository();
    const existingPatient = await repository.findOne({ where: { id } });

    if (!existingPatient) {
      this.logger.error(`Tentativa de atualização falhou. Paciente com ID ${id} não encontrado.`);
      throw new NotFoundException(`Paciente com ID ${id} não encontrado.`);
    }

    if (patient.email && patient.email !== existingPatient.email) {
      const patientWithSameEmail = await repository.findOne({
        where: { email: patient.email },
      });
      if (patientWithSameEmail && patientWithSameEmail.id !== id) {
        this.logger.warn(`Tentativa de atualização falhou. Email já cadastrado: ${patient.email}`);
        throw new ConflictException('Email já cadastrado para outro paciente.');
      }
    }

    if (patient.cpf && patient.cpf !== existingPatient.cpf) {
      const normalizedCpf = this.normalizeCpf(patient.cpf);
      const patientWithSameCpf = await repository.findOne({
        where: { cpf: normalizedCpf },
      });
      if (patientWithSameCpf && patientWithSameCpf.id !== id) {
        this.logger.warn(`Tentativa de atualização falhou. CPF já cadastrado: ${patient.cpf}`);
        throw new ConflictException('CPF já cadastrado para outro paciente.');
      }
      patient.cpf = normalizedCpf;
    }

    this.logger.log(`Atualizando paciente ID: ${id}`);
    await repository.update(id, patient);
    return repository.findOne({ where: { id } });
  }

  async softDeletePatient(id: string): Promise<boolean> {
    const repository = await this.getRepository();
    const existingPatient = await repository.findOne({ where: { id } });

    if (!existingPatient) {
      this.logger.error(`Tentativa de exclusão falhou. Paciente com ID ${id} não encontrado.`);
      throw new NotFoundException(`Paciente com ID ${id} não encontrado.`);
    }

    this.logger.log(`Marcando paciente como inativo ID: ${id}`);
    const result = await repository.update(id, { status: PatientStatus.INACTIVE });
    return (result.affected ?? 0) > 0;
  }
}
