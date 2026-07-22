import { db } from "./db"

export async function syncWithCloud() {
  if (typeof window === 'undefined' || !navigator.onLine) return;
  console.log("Starting sync with Cloud Database...");

  try {
    // 1. Fetch unsynced records locally
    const unsyncedPatients = await db.patients.filter(p => !p.synced).toArray();
    const unsyncedVisits = await db.visits.filter(v => !v.synced).toArray();

    let pushSuccess = true;

    // 2. Push to Cloud
    if (unsyncedPatients.length > 0 || unsyncedVisits.length > 0) {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patients: unsyncedPatients, visits: unsyncedVisits })
      });

      if (res.ok) {
        // Mark local as synced
        const pIds = unsyncedPatients.map(p => p.id);
        const vIds = unsyncedVisits.map(v => v.id);
        
        await db.transaction('rw', db.patients, db.visits, async () => {
          for (const id of pIds) await db.patients.update(id, { synced: true });
          for (const id of vIds) await db.visits.update(id, { synced: true });
        });
        console.log(`Pushed ${pIds.length} patients and ${vIds.length} visits to cloud.`);
      } else {
        console.error("Failed to push to cloud", await res.text());
        pushSuccess = false;
      }
    }

    // 3. Pull from Cloud (Two-Way)
    if (pushSuccess) {
      const lastSync = localStorage.getItem('last_sync_timestamp') || '0';
      const pullRes = await fetch(`/api/sync?since=${lastSync}`);
      
      if (pullRes.ok) {
        const { patients, visits } = await pullRes.json();
        
        await db.transaction('rw', db.patients, db.visits, async () => {
          if (patients?.length > 0) {
             const mapped = patients.map((p: any) => ({ ...p, synced: true, created_at: new Date(p.created_at) }));
             await db.patients.bulkPut(mapped);
          }
          if (visits?.length > 0) {
             const mapped = visits.map((v: any) => ({ ...v, synced: true, timestamp: new Date(v.timestamp) }));
             await db.visits.bulkPut(mapped);
          }
        });

        localStorage.setItem('last_sync_timestamp', Date.now().toString());
        console.log(`Pulled ${patients?.length || 0} patients and ${visits?.length || 0} visits from cloud.`);
      }
    }
  } catch (err) {
    console.error("Sync error:", err);
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', syncWithCloud);
  setInterval(() => {
    if (navigator.onLine) syncWithCloud();
  }, 5 * 60 * 1000);
}
