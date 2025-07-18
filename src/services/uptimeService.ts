import { 
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface UptimeRecord {
  id?: string;
  serverName: string;
  uptimePercentage: number;
  lastChecked: string;
  status: 'Online' | 'Offline' | 'Maintenance';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface DowntimeIncident {
  id?: string;
  serverName: string;
  startTime: string;
  endTime?: string;
  duration: string;
  cause: string;
  resolution: string;
  impact: 'Low' | 'Medium' | 'High' | 'Critical';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const UPTIME_COLLECTION = 'system_uptime';
const INCIDENTS_COLLECTION = 'downtime_incidents';

export const uptimeService = {
  // Initialize sample server data if collection is empty
  async initializeSampleData() {
    const querySnapshot = await getDocs(collection(db, UPTIME_COLLECTION));
    if (querySnapshot.empty) {
      const sampleServers: Omit<UptimeRecord, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          serverName: 'Web Server',
          uptimePercentage: 99.9,
          lastChecked: new Date().toISOString(),
          status: 'Online'
        },
        {
          serverName: 'Database Server',
          uptimePercentage: 99.8,
          lastChecked: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
          status: 'Online'
        },
        {
          serverName: 'Email Server',
          uptimePercentage: 99.5,
          lastChecked: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
          status: 'Maintenance'
        },
        {
          serverName: 'File Server',
          uptimePercentage: 95.2,
          lastChecked: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          status: 'Offline'
        }
      ];

      const batch = [];
      const now = Timestamp.now();
      
      for (const server of sampleServers) {
        batch.push(
          addDoc(collection(db, UPTIME_COLLECTION), {
            ...server,
            createdAt: now,
            updatedAt: now
          })
        );
      }
      
      await Promise.all(batch);
      console.log('Sample server data initialized');
    }
  },

  // Get all uptime records
  async getUptimeRecords(): Promise<UptimeRecord[]> {
    try {
      const q = query(collection(db, UPTIME_COLLECTION), orderBy('serverName', 'asc'));
      const querySnapshot = await getDocs(q);
      
      // If no servers found, initialize sample data
      if (querySnapshot.empty) {
        await this.initializeSampleData();
        // Get the data again after initialization
        const newSnapshot = await getDocs(q);
        return newSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UptimeRecord[];
      }
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UptimeRecord[];
    } catch (error) {
      console.error('Error fetching uptime records:', error);
      throw error;
    }
  },

  // Create or update uptime record
  async updateUptimeRecord(recordData: Omit<UptimeRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, UPTIME_COLLECTION), {
        ...recordData,
        createdAt: now,
        updatedAt: now
      });
      return docRef.id;
    } catch (error) {
      console.error('Error updating uptime record:', error);
      throw error;
    }
  },

  // Get all downtime incidents
  async getDowntimeIncidents(): Promise<DowntimeIncident[]> {
    try {
      const q = query(collection(db, INCIDENTS_COLLECTION), orderBy('startTime', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DowntimeIncident[];
    } catch (error) {
      console.error('Error fetching downtime incidents:', error);
      throw error;
    }
  },

  // Create a new downtime incident
  async createIncident(incidentData: Omit<DowntimeIncident, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, INCIDENTS_COLLECTION), {
        ...incidentData,
        createdAt: now,
        updatedAt: now
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating incident:', error);
      throw error;
    }
  },

  // Update incident
  async updateIncident(incidentId: string, updatedFields: Partial<Omit<DowntimeIncident, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    try {
      const incidentRef = doc(db, INCIDENTS_COLLECTION, incidentId);
      await updateDoc(incidentRef, {
        ...updatedFields,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating incident:', error);
      throw error;
    }
  },

  // Delete incident
  async deleteIncident(incidentId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, INCIDENTS_COLLECTION, incidentId));
    } catch (error) {
      console.error('Error deleting incident:', error);
      throw error;
    }
  },

  // Subscribe to real-time uptime updates
  subscribeToUptimeRecords(callback: (records: UptimeRecord[]) => void): () => void {
    const q = query(collection(db, UPTIME_COLLECTION), orderBy('serverName', 'asc'));
    
    return onSnapshot(q, (querySnapshot) => {
      const records = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UptimeRecord[];
      callback(records);
    });
  },

  // Subscribe to real-time incident updates
  subscribeToIncidents(callback: (incidents: DowntimeIncident[]) => void): () => void {
    const q = query(collection(db, INCIDENTS_COLLECTION), orderBy('startTime', 'desc'));
    
    return onSnapshot(q, (querySnapshot) => {
      const incidents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DowntimeIncident[];
      callback(incidents);
    });
  }
};
