import { db } from "./db"

export async function syncWithCloud() {
  if (typeof window === 'undefined' || !navigator.onLine) return;
  console.log("Starting sync with Cloud Database...");

  try {
    // 1. Fetch only unsynced records locally
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
        const errorText = await res.text();
        console.error("Failed to push to cloud", errorText);
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
      } else {
         console.error("Pull Error: ", await pullRes.text());
      }
    }
  } catch (err) {
    console.error("Sync error:", err);
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', syncWithCloud);
  // Auto-sync every 30 seconds
  setInterval(() => {
    if (navigator.onLine) syncWithCloud();
  }, 30 * 1000);

  // Trigger an initial sync shortly after the app loads
  setTimeout(() => {
    if (navigator.onLine) syncWithCloud();
  }, 2000);
}
