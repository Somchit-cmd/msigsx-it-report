
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
  Timestamp,
  where,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface UptimeRecord {
  id?: string;
  serverName: string;
  uptimePercentage: number;
  lastChecked: string;
  status: 'Online' | 'Offline' | 'Maintenance';
  createdAt: Timestamp | { toDate: () => Date };
  updatedAt: Timestamp | { toDate: () => Date };
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

// Calculate uptime percentage based on incidents in the last 30 days
const calculateUptimePercentage = (incidents: DowntimeIncident[], serverName: string): number => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // Filter incidents for this server in the last 30 days
  const recentIncidents = incidents.filter(incident => 
    incident.serverName === serverName && 
    new Date(incident.startTime) >= thirtyDaysAgo
  );
  
  if (recentIncidents.length === 0) {
    return 100.0; // No incidents = 100% uptime
  }
  
  // Calculate total downtime in minutes
  let totalDowntimeMinutes = 0;
  recentIncidents.forEach(incident => {
    const durationParts = incident.duration.split(/[hm\s]/).filter(part => part.length > 0);
    let hours = 0;
    let minutes = 0;
    
    if (durationParts.length >= 2) {
      hours = parseInt(durationParts[0]) || 0;
      minutes = parseInt(durationParts[1]) || 0;
    } else if (incident.duration.includes('h')) {
      hours = parseInt(durationParts[0]) || 0;
    } else if (incident.duration.includes('m')) {
      minutes = parseInt(durationParts[0]) || 0;
    }
    
    totalDowntimeMinutes += (hours * 60) + minutes;
  });
  
  // Calculate uptime percentage (30 days = 43,200 minutes)
  const totalMinutesInMonth = 30 * 24 * 60;
  const uptimeMinutes = totalMinutesInMonth - totalDowntimeMinutes;
  const uptimePercentage = (uptimeMinutes / totalMinutesInMonth) * 100;
  
  return Math.max(0, Math.min(100, Math.round(uptimePercentage * 10) / 10));
};

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
          lastChecked: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          status: 'Online'
        },
        {
          serverName: 'Email Server',
          uptimePercentage: 99.5,
          lastChecked: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          status: 'Maintenance'
        },
        {
          serverName: 'File Server',
          uptimePercentage: 95.2,
          lastChecked: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
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

  // Get all uptime records with calculated uptime percentages
  async getUptimeRecords(): Promise<UptimeRecord[]> {
    try {
      const q = query(collection(db, UPTIME_COLLECTION), orderBy('serverName', 'asc'));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        await this.initializeSampleData();
        const newSnapshot = await getDocs(q);
        const servers = newSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UptimeRecord[];
        
        // Get incidents and recalculate uptime
        const incidents = await this.getDowntimeIncidents();
        return await this.updateUptimeCalculations(servers, incidents);
      }
      
      const servers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UptimeRecord[];
      
      // Get incidents and recalculate uptime
      const incidents = await this.getDowntimeIncidents();
      return await this.updateUptimeCalculations(servers, incidents);
    } catch (error) {
      console.error('Error fetching uptime records:', error);
      throw error;
    }
  },

  // Update uptime calculations based on incidents
  async updateUptimeCalculations(servers: UptimeRecord[], incidents: DowntimeIncident[]): Promise<UptimeRecord[]> {
    const updatedServers = [];
    
    for (const server of servers) {
      const calculatedUptime = calculateUptimePercentage(incidents, server.serverName);
      
      // Update server if uptime percentage changed significantly
      if (Math.abs(server.uptimePercentage - calculatedUptime) > 0.1) {
        const updatedServer = {
          ...server,
          uptimePercentage: calculatedUptime,
          lastChecked: new Date().toISOString()
        };
        
        // Update in database
        if (server.id) {
          await updateDoc(doc(db, UPTIME_COLLECTION, server.id), {
            uptimePercentage: calculatedUptime,
            lastChecked: updatedServer.lastChecked,
            updatedAt: Timestamp.now()
          });
        }
        
        updatedServers.push(updatedServer);
      } else {
        updatedServers.push(server);
      }
    }
    
    return updatedServers;
  },

  // Create a new uptime record
  async createUptimeRecord(recordData: Omit<UptimeRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, UPTIME_COLLECTION), {
        ...recordData,
        createdAt: now,
        updatedAt: now
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating uptime record:', error);
      throw error;
    }
  },

  // Update existing uptime record
  async updateUptimeRecord(recordData: UptimeRecord): Promise<void> {
    if (!recordData.id) {
      throw new Error('Cannot update record without an ID');
    }
    try {
      const now = Timestamp.now();
      const docRef = doc(db, UPTIME_COLLECTION, recordData.id);
      await updateDoc(docRef, {
        ...recordData,
        updatedAt: now
      });
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

  // Get incidents by date range for reporting
  async getIncidentsByDateRange(startDate: Date, endDate: Date): Promise<DowntimeIncident[]> {
    try {
      const q = query(
        collection(db, INCIDENTS_COLLECTION),
        where('startTime', '>=', startDate.toISOString()),
        where('startTime', '<=', endDate.toISOString()),
        orderBy('startTime', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DowntimeIncident[];
    } catch (error) {
      console.error('Error fetching incidents by date range:', error);
      throw error;
    }
  },

  // Subscribe to real-time uptime updates
  subscribeToUptimeRecords(callback: (records: UptimeRecord[]) => void): () => void {
    const q = query(collection(db, UPTIME_COLLECTION), orderBy('serverName', 'asc'));
    
    return onSnapshot(q, async (querySnapshot) => {
      const records = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UptimeRecord[];
      
      // Get incidents and recalculate uptime
      const incidents = await this.getDowntimeIncidents();
      const updatedRecords = await this.updateUptimeCalculations(records, incidents);
      callback(updatedRecords);
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
