
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
  limit,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface UptimeRecord {
  id?: string;
  serverName: string;
  uptimePercentage: number;
  lastChecked: string;
  status: 'Online' | 'Offline' | 'Maintenance';
  currentMonthStart: string; // ISO string of the first day of current month
  createdAt: Timestamp | { toDate: () => Date };
  updatedAt: Timestamp | { toDate: () => Date };
}

export interface MonthlyUptimeHistory {
  id?: string;
  year: number;
  month: number; // 1-12
  daysInMonth: number;
  serverName: string;
  uptimePercentage: number;
  totalDowntimeMinutes: number;
  totalIncidents: number;
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
const MONTHLY_HISTORY_COLLECTION = 'monthly_uptime_history';

// Helper functions for date calculations
const getFirstDayOfMonth = (date = new Date()) => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const getDaysInMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const getMinutesInMonth = (date: Date): number => {
  return getDaysInMonth(date) * 24 * 60;
};

const isSameMonth = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() && 
         date1.getMonth() === date2.getMonth();
};

// Calculate uptime percentage based on incidents in the last 30 days
const calculateMonthlyUptime = (incidents: DowntimeIncident[], serverName: string, monthStart: Date) => {
  const totalMinutesInMonth = getMinutesInMonth(monthStart);
  
  // Filter incidents for this server in the current month
  const monthlyIncidents = incidents.filter(incident => 
    incident.serverName === serverName && 
    new Date(incident.startTime) >= monthStart
  );

  if (monthlyIncidents.length === 0) {
    return {
      uptimePercentage: 100,
      totalDowntimeMinutes: 0,
      totalIncidents: 0
    };
  }

  // Calculate total downtime in minutes
  let totalDowntimeMinutes = 0;
  monthlyIncidents.forEach(incident => {
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

  // Calculate uptime percentage
  const uptimePercentage = ((totalMinutesInMonth - totalDowntimeMinutes) / totalMinutesInMonth) * 100;
  
  return {
    uptimePercentage: Math.max(0, Math.min(100, Math.round(uptimePercentage * 10) / 10)),
    totalDowntimeMinutes,
    totalIncidents: monthlyIncidents.length
  };
};

export const uptimeService = {
  // Initialize sample server data if collection is empty
  async initializeSampleData() {
    const querySnapshot = await getDocs(collection(db, UPTIME_COLLECTION));
    if (querySnapshot.empty) {
      const now = new Date();
      const monthStart = getFirstDayOfMonth(now);
      const sampleServers: Omit<UptimeRecord, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          serverName: 'Web Server',
          uptimePercentage: 100,
          lastChecked: now.toISOString(),
          status: 'Online',
          currentMonthStart: monthStart.toISOString()
        },
        {
          serverName: 'Database Server',
          uptimePercentage: 100,
          lastChecked: now.toISOString(),
          status: 'Online',
          currentMonthStart: monthStart.toISOString()
        },
        {
          serverName: 'Email Server',
          uptimePercentage: 100,
          lastChecked: now.toISOString(),
          status: 'Online',
          currentMonthStart: monthStart.toISOString()
        },
        {
          serverName: 'File Server',
          uptimePercentage: 100,
          lastChecked: now.toISOString(),
          status: 'Online',
          currentMonthStart: monthStart.toISOString()
        },
        {
          serverName: 'Domain Controller',
          uptimePercentage: 100,
          lastChecked: now.toISOString(),
          status: 'Online',
          currentMonthStart: monthStart.toISOString()
        },
        {
          serverName: 'Print Server',
          uptimePercentage: 100,
          lastChecked: now.toISOString(),
          status: 'Online',
          currentMonthStart: monthStart.toISOString()
        },
        {
          serverName: 'Backup Server',
          uptimePercentage: 100,
          lastChecked: now.toISOString(),
          status: 'Online',
          currentMonthStart: monthStart.toISOString()
        },
        {
          serverName: 'Application Server',
          uptimePercentage: 100,
          lastChecked: now.toISOString(),
          status: 'Online',
          currentMonthStart: monthStart.toISOString()
        }
      ];

      const batch = writeBatch(db);
      const nowTimestamp = Timestamp.now();
      
      for (const server of sampleServers) {
        const docRef = doc(collection(db, UPTIME_COLLECTION));
        batch.set(docRef, {
          ...server,
          createdAt: nowTimestamp,
          updatedAt: nowTimestamp
        });
      }
      
      await batch.commit();
      console.log('Sample server data initialized');
    }
  },

  // Check and handle month transition if needed
  async checkAndHandleMonthTransition(servers: UptimeRecord[]): Promise<void> {
    const now = new Date();
    const currentMonthStart = getFirstDayOfMonth(now);
    
    // Find any server that's not from the current month
    const needsUpdate = servers.some(server => 
      !server.currentMonthStart || 
      !isSameMonth(new Date(server.currentMonthStart), currentMonthStart)
    );
    
    if (!needsUpdate) return;
    
    // Archive last month's data
    await this.archiveLastMonthData(servers);
    
    // Update all servers to new month
    const batch = writeBatch(db);
    const updateTime = Timestamp.now();
    
    servers.forEach(server => {
      if (!server.id) return;
      const serverRef = doc(db, UPTIME_COLLECTION, server.id);
      batch.update(serverRef, {
        uptimePercentage: 100,
        lastChecked: now.toISOString(),
        currentMonthStart: currentMonthStart.toISOString(),
        updatedAt: updateTime
      });
    });
    
    await batch.commit();
    console.log('Month transition handled - servers reset to new month');
  },
  
  // Archive last month's data
  async archiveLastMonthData(servers: UptimeRecord[]): Promise<void> {
    const now = new Date();
    const lastMonth = new Date(now);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const year = lastMonth.getFullYear();
    const month = lastMonth.getMonth() + 1; // 1-12
    const daysInMonth = getDaysInMonth(lastMonth);
    
    // Check if already archived
    const archiveCheck = await getDocs(
      query(
        collection(db, MONTHLY_HISTORY_COLLECTION),
        where('year', '==', year),
        where('month', '==', month),
        limit(1)
      )
    );
    
    if (!archiveCheck.empty) return; // Already archived
    
    // Get incidents from last month
    const firstDayOfLastMonth = new Date(year, month - 1, 1);
    const firstDayOfThisMonth = getFirstDayOfMonth(now);
    
    const incidents = await this.getDowntimeIncidents();
    
    // Archive data for each server
    const batch = writeBatch(db);
    const timestamp = Timestamp.now();
    
    for (const server of servers) {
      const { uptimePercentage, totalDowntimeMinutes, totalIncidents } = 
        calculateMonthlyUptime(incidents, server.serverName, firstDayOfLastMonth);
      
      const historyRef = doc(collection(db, MONTHLY_HISTORY_COLLECTION));
      batch.set(historyRef, {
        year,
        month,
        daysInMonth,
        serverName: server.serverName,
        uptimePercentage,
        totalDowntimeMinutes,
        totalIncidents,
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }
    
    await batch.commit();
    console.log(`Archived uptime data for ${month}/${year}`);
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
        
        // Handle month transition if needed
        await this.checkAndHandleMonthTransition(servers);
        
        // Get incidents and recalculate uptime
        const incidents = await this.getDowntimeIncidents();
        return await this.updateUptimeCalculations(servers, incidents);
      }
      
      const servers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UptimeRecord[];
      
      // Handle month transition if needed
      await this.checkAndHandleMonthTransition(servers);
      
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
    const now = new Date();
    const currentMonthStart = getFirstDayOfMonth(now);
    
    for (const server of servers) {
      // Ensure server has current month start set
      if (!server.currentMonthStart || !isSameMonth(new Date(server.currentMonthStart), currentMonthStart)) {
        if (server.id) {
          await updateDoc(doc(db, UPTIME_COLLECTION, server.id), {
            currentMonthStart: currentMonthStart.toISOString(),
            updatedAt: Timestamp.now()
          });
        }
        server.currentMonthStart = currentMonthStart.toISOString();
      }
      
      const { uptimePercentage } = calculateMonthlyUptime(
        incidents, 
        server.serverName, 
        new Date(server.currentMonthStart)
      );
      
      // Update server if uptime percentage changed significantly
      if (Math.abs((server.uptimePercentage || 100) - uptimePercentage) > 0.1) {
        const updatedServer = {
          ...server,
          uptimePercentage,
          lastChecked: now.toISOString()
        };
        
        // Update in database
        if (server.id) {
          await updateDoc(doc(db, UPTIME_COLLECTION, server.id), {
            uptimePercentage,
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
  async createUptimeRecord(recordData: Omit<UptimeRecord, 'id' | 'createdAt' | 'updatedAt' | 'currentMonthStart'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, UPTIME_COLLECTION), {
        ...recordData,
        currentMonthStart: getFirstDayOfMonth().toISOString(),
        uptimePercentage: 100, // Start new servers at 100%
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
    
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const records = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UptimeRecord[];
      
      // Check for month transition
      const now = new Date();
      const needsUpdate = records.some(record => {
        if (!record.currentMonthStart) return true;
        const recordMonth = new Date(record.currentMonthStart);
        return !isSameMonth(recordMonth, now);
      });
      
      if (needsUpdate) {
        // Refresh data to trigger month transition
        await this.getUptimeRecords();
        return;
      }
      
      callback(records);
    }, (error) => {
      console.error('Error in uptime records subscription:', error);
    });
    
    return unsubscribe;
  },
  
  // Get monthly history for a server
  async getMonthlyHistory(serverName: string): Promise<MonthlyUptimeHistory[]> {
    try {
      const q = query(
        collection(db, MONTHLY_HISTORY_COLLECTION),
        where('serverName', '==', serverName),
        orderBy('year', 'desc'),
        orderBy('month', 'desc'),
        limit(12) // Last 12 months
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MonthlyUptimeHistory[];
    } catch (error) {
      console.error('Error fetching monthly history:', error);
      throw error;
    }
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
