import { DataSource } from 'typeorm';

export interface Database {
  connect(): Promise<DataSource>;
  disconnect(): Promise<void>;
}
