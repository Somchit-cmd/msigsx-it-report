
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

export interface WorkTicket {
  id?: string;
  date: string;
  itStaffName: string;
  itStaffEmail: string;
  issueCategory: string;
  specificIssue: string;
  resolutionAction: string;
  timeSpent: number;
  ticketStatus: 'Opened' | 'Resolved' | 'Pending';
  department: string;
  employeeName: string;
  /** @deprecated */
  employeeDepartment?: string;
  priority: 'Low' | 'Medium' | 'High';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const TICKETS_COLLECTION = 'helpdesk_tickets';

export const helpdeskService = {
  // Create a new ticket
  async createTicket(ticketData: Omit<WorkTicket, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, TICKETS_COLLECTION), {
        ...ticketData,
        createdAt: now,
        updatedAt: now
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  },

  // Get all tickets
  async getTickets(): Promise<WorkTicket[]> {
    try {
      const q = query(collection(db, TICKETS_COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WorkTicket[];
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw error;
    }
  },

  // Update ticket status
  async updateTicketStatus(ticketId: string, status: WorkTicket['ticketStatus']): Promise<void> {
    try {
      const ticketRef = doc(db, TICKETS_COLLECTION, ticketId);
      await updateDoc(ticketRef, {
        ticketStatus: status,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating ticket status:', error);
      throw error;
    }
  },

  // Edit/update full ticket details
  async updateTicket(ticketId: string, updatedFields: Partial<Omit<WorkTicket, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    try {
      const ticketRef = doc(db, TICKETS_COLLECTION, ticketId);
      await updateDoc(ticketRef, {
        ...updatedFields,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating ticket:', error);
      throw error;
    }
  },

  // Delete ticket
  async deleteTicket(ticketId: string): Promise<void> {
    try {
      const ticketRef = doc(db, TICKETS_COLLECTION, ticketId);
      await deleteDoc(ticketRef);
    } catch (error) {
      console.error('Error deleting ticket:', error);
      throw error;
    }
  },

  // Subscribe to real-time ticket updates
  subscribeToTickets(callback: (tickets: WorkTicket[]) => void): () => void {
    const q = query(collection(db, TICKETS_COLLECTION), orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (querySnapshot) => {
      const tickets = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WorkTicket[];
      
      callback(tickets);
    });
  }
};
