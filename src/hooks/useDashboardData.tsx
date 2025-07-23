import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, Timestamp, DocumentData } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface UptimeRecord extends DocumentData {
  id: string;
  status: 'up' | 'down' | 'warning';
  timestamp: Timestamp;
  serverName?: string;
  responseTime?: number;
}

interface DashboardStats {
  totalTickets: number;
  resolvedTickets: number;
  pendingTickets: number;
  systemUptime: number;
  securityIncidents: number;
  activeProjects: number;
  newAssets: number;
  completedProjects: number;
}

export const useDashboardData = (userId?: string) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalTickets: 0,
    resolvedTickets: 0,
    pendingTickets: 0,
    systemUptime: 0,
    securityIncidents: 0,
    activeProjects: 0,
    newAssets: 0,
    completedProjects: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // If no userId is provided, skip the data fetching
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch tickets data with better error handling
        let ticketsData: any[] = [];
        let resolvedTickets = 0;
        let pendingTickets = 0;
        
        try {
          console.log('Fetching tickets for user:', userId);
          const ticketsQuery = query(
            collection(db, 'helpdesk_tickets')
            // Temporarily removing user filter to check all tickets
            // where('userId', '==', userId)
          );
          const ticketsSnapshot = await getDocs(ticketsQuery);
          
          // Get all tickets for debugging
          const allTickets = ticketsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          console.log('All tickets in collection:', allTickets);
          
          // Try different status variations
          ticketsData = allTickets;
          
          // Check for different possible status formats
          // Using ticket.ticketStatus instead of ticket.status
          resolvedTickets = ticketsData.filter(ticket => {
            const status = String(ticket.ticketStatus || '').toLowerCase();
            return status === 'resolved' || status === 'completed';
          }).length;
          
          pendingTickets = ticketsData.filter(ticket => {
            const status = String(ticket.ticketStatus || '').toLowerCase();
            return status === 'pending' || 
                   status === 'in progress' || 
                   status === 'open' ||
                   status === 'inprogress';
          }).length;
          
          console.log('Total tickets found:', ticketsData.length);
          console.log('Resolved tickets (case-insensitive):', resolvedTickets);
          console.log('Pending tickets (case-insensitive):', pendingTickets);
          
          // Log first ticket details for debugging
          if (ticketsData.length > 0) {
            console.log('First ticket details:', {
              id: ticketsData[0].id,
              status: ticketsData[0].status,
              rawStatus: String(ticketsData[0].status),
              userId: ticketsData[0].userId,
              currentUserId: userId
            });
          }
          
        } catch (error) {
          console.error('Error fetching tickets:', error);
          // Set default values to prevent UI errors
          ticketsData = [];
          resolvedTickets = 0;
          pendingTickets = 0;
        }

        // Fetch uptime data for the last 30 days for the current user
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const uptimeQuery = query(
          collection(db, 'system_uptime'),
          where('timestamp', '>=', Timestamp.fromDate(thirtyDaysAgo)),
          where('userId', '==', userId)  // Filter by user
        );
        
        const uptimeSnapshot = await getDocs(uptimeQuery);
        const uptimeData = uptimeSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            status: data.status || 'up', // Default to 'up' if status is missing
            timestamp: data.timestamp || Timestamp.now(),
            serverName: data.serverName,
            responseTime: data.responseTime
          } as UptimeRecord;
        });
        
        // Calculate uptime percentage (simplified)
        // Only calculate if we have data
        let uptimePercentage = 100; // Default to 100% if no data
        
        if (uptimeData.length > 0) {
          const totalChecks = uptimeData.length;
          const successfulChecks = uptimeData.filter(record => record.status === 'up').length;
          uptimePercentage = Math.round((successfulChecks / totalChecks) * 100 * 100) / 100;
        }

        // Fetch security incidents (from your existing collection)
        const incidentsQuery = query(
          collection(db, 'downtime_incidents'),
          where('userId', '==', userId) // Make sure to filter by user
        );
        const incidentsSnapshot = await getDocs(incidentsQuery);
        const securityIncidents = incidentsSnapshot.docs.length;

        // Mock data for other stats (replace with actual queries as needed)
        const activeProjects = 5; // Replace with actual query
        const newAssets = 12; // Replace with actual query
        const completedProjects = 3; // Replace with actual query

        setStats({
          totalTickets: ticketsData.length,
          resolvedTickets,
          pendingTickets,
          systemUptime: uptimePercentage,
          securityIncidents,
          activeProjects,
          newAssets,
          completedProjects,
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId]);

  return { stats, loading, error };
};
