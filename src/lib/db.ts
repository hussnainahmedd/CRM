import Dexie, { Table } from 'dexie';

export interface Patient {
  id?: string; // UUID, but optional for Dexie auto-generation if we use local IDs
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone?: string;
  notes?: string; // Doctor only, might not be visible/editable to receptionist
  tags?: string[];
  total_visits: number;
  total_fees: number;
  created_at: Date;
  synced: boolean; // For offline sync logic
}

export interface Visit {
  id?: string;
  patient_id: string;
  services: string[]; // e.g. ["Checkup", "Drip"]
  fee_charged: number;
  payment_method: 'Cash' | 'Online';
  timestamp: Date;
  flag_status: boolean;
  flag_reason?: string;
  synced: boolean;
}

export class ClinicDatabase extends Dexie {
  patients!: Table<Patient, string>;
  visits!: Table<Visit, string>;

  constructor() {
    super('SadiqClinicDB');
    this.version(2).stores({
      patients: 'id, name, phone, created_at, synced',
      visits: 'id, patient_id, timestamp, synced'
    });
  }
}

export const db = new ClinicDatabase();
