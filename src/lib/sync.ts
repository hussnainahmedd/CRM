import { db } from "./db"

// This is a stub for the Supabase sync service.
// Once a Supabase project is created and environment variables are added,
// this file will handle two-way synchronization between Dexie (local) and Supabase (cloud).

export async function syncWithSupabase() {
  console.log("Starting sync with Supabase...")

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn("Supabase credentials not found. Skipping sync. Application will run in local-only mode.")
    return
  }

  // Example Sync Logic:
  // 1. Fetch unsynced patients and visits from Dexie
  // const unsyncedPatients = await db.patients.where('synced').equals('false').toArray();
  // const unsyncedVisits = await db.visits.where('synced').equals('false').toArray();
  
  // 2. Push to Supabase via Supabase JS Client
  // const { error: pError } = await supabase.from('patients').upsert(unsyncedPatients);
  // if (!pError) {
  //    await db.patients.where('id').anyOf(unsyncedPatients.map(p => p.id)).modify({ synced: true });
  // }
  
  // 3. Pull updates from Supabase (e.g. if doctor flagged an entry from another device)
  // const { data: remoteVisits } = await supabase.from('visits').select('*').gt('updated_at', lastSyncTime);
  // await db.visits.bulkPut(remoteVisits);

  console.log("Sync complete.")
}

// Optionally, this could be triggered periodically or on window focus
if (typeof window !== 'undefined') {
  window.addEventListener('online', syncWithSupabase)
  
  // Setup a 5-minute periodic sync
  setInterval(() => {
    if (navigator.onLine) {
      syncWithSupabase()
    }
  }, 5 * 60 * 1000)
}
