import Dexie, { Table } from 'dexie';
import { v4 as uuidv4 } from 'uuid';

export interface Patient {
  id: string; // Enforced UUID
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone?: string;
  notes?: string;
  tags?: string[];
  total_visits: number;
  total_fees: number;
  created_at: Date;
  last_synced_at?: Date; // Cloud sync marker
  synced: boolean; // Local offline sync marker
}

export interface Visit {
  id: string;
  patient_id: string;
  services: string[];
  fee_charged: number;
  payment_method: 'Cash' | 'Online';
  timestamp: Date;
  flag_status: boolean;
  flag_reason?: string;
  last_synced_at?: Date;
  synced: boolean;
}

export class ClinicDatabase extends Dexie {
  patients!: Table<Patient, string>;
  visits!: Table<Visit, string>;

  constructor() {
    super('SadiqClinicDB');
    this.version(3).stores({
      patients: 'id, name, phone, created_at, synced',
      visits: 'id, patient_id, timestamp, synced'
    });

    // Auto-generate UUIDs for new records if missing
    this.patients.hook('creating', function (primKey, obj, trans) {
      if (!obj.id) obj.id = uuidv4();
    });
    this.visits.hook('creating', function (primKey, obj, trans) {
      if (!obj.id) obj.id = uuidv4();
    });
  }
}

export const db = new ClinicDatabase();
