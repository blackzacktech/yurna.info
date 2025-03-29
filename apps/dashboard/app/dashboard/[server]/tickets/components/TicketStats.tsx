import React, { FC, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/ui/Icons';
import { Badge } from '@/components/ui/Badge';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface TicketCategory {
  id: string;
  name: string;
  emoji: string;
  _count: {
    tickets: number;
  };
}

interface DailyTicketData {
  date: string;
  count: number;
}

interface TopStaff {
  userId: string;
  username: string;
  avatarUrl: string | null;
  ticketCount: number;
}

interface TicketStats {
  totalTickets: number;
  activeTickets: number;
  closedTickets: number;
  ticketsByCategory: TicketCategory[];
  dailyTicketData: DailyTicketData[];
  averageResolutionTime: number;
  topStaff: TopStaff[];
}

interface TicketStatsProps {
  serverId: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const TicketStats: FC<TicketStatsProps> = ({ serverId }) => {
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/tickets/${serverId}/stats`);
        
        if (!response.ok) {
          throw new Error('Fehler beim Laden der Statistiken');
        }
        
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Fehler beim Laden der Statistiken:', err);
        setError('Statistiken konnten nicht geladen werden');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [serverId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-5 bg-primary/10 rounded w-1/2 mb-2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-primary/10 rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Icons.alertTriangle className="mx-auto h-8 w-8 text-yellow-500 mb-2" />
            <p>{error || 'Keine Statistiken verfügbar'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const categoryChartData = stats.ticketsByCategory.map(category => ({
    name: category.name,
    value: category._count.tickets,
    emoji: category.emoji
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gesamt Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTickets}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aktive Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-2xl font-bold">{stats.activeTickets}</div>
              <Badge className="ml-2" variant="default">Offen</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Geschlossene Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.closedTickets}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ø Bearbeitungszeit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageResolutionTime} {stats.averageResolutionTime === 1 ? 'Stunde' : 'Stunden'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tickets pro Tag (Linienchart) */}
        <Card>
          <CardHeader>
            <CardTitle>Tickets pro Tag</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={stats.dailyTicketData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  name="Tickets" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tickets pro Kategorie (Kreisdiagramm) */}
        <Card>
          <CardHeader>
            <CardTitle>Tickets nach Kategorie</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, emoji, percent }) => `${emoji} ${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={(value) => [`${value} Tickets`, 'Anzahl']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Mitarbeiter */}
      {stats.topStaff.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Support-Mitarbeiter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topStaff.map((staff) => (
                <div key={staff.userId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {staff.avatarUrl ? (
                      <img
                        src={staff.avatarUrl}
                        alt={staff.username}
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icons.user className="h-5 w-5" />
                      </div>
                    )}
                    <span className="font-medium">{staff.username}</span>
                  </div>
                  <Badge variant="outline">{staff.ticketCount} Tickets</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TicketStats;
