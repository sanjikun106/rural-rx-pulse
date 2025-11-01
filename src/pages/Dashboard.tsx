import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, AlertTriangle, Users, TrendingUp, Search, ShoppingCart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { storage } from '@/lib/storage';
import { mockMedicines, mockAlerts, generateForecast } from '@/data/mockData';
import { Medicine } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState<Medicine[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const storedInventory = storage.getInventory();
    if (storedInventory.length === 0) {
      storage.setInventory(mockMedicines);
      setInventory(mockMedicines);
    } else {
      setInventory(storedInventory);
    }
  }, []);

  const lowStockItems = inventory.filter(item => {
    const daysRemaining = item.quantity / item.avg_daily_sales;
    return daysRemaining < 7;
  });

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const forecastData = selectedMedicine ? generateForecast(selectedMedicine) : [];

  const stats = [
    {
      title: 'Total SKUs',
      value: inventory.length,
      icon: Package,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Low Stock Items',
      value: lowStockItems.length,
      icon: AlertTriangle,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Partner Pharmacies',
      value: 4,
      icon: Users,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      title: 'Active Alerts',
      value: mockAlerts.filter(a => !a.read).length,
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your pharmacy inventory and insights</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Inventory List */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Current Stock</CardTitle>
            <CardDescription>Search and view your medicine inventory</CardDescription>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {filteredInventory.slice(0, 8).map((medicine) => {
                const daysRemaining = Math.floor(medicine.quantity / medicine.avg_daily_sales);
                const isLowStock = daysRemaining < 7;
                
                return (
                  <div
                    key={medicine.medicine_id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-soft ${
                      selectedMedicine?.medicine_id === medicine.medicine_id
                        ? 'border-primary bg-primary/5'
                        : 'border-border'
                    }`}
                    onClick={() => setSelectedMedicine(medicine)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold truncate">{medicine.name}</h4>
                          {isLowStock && (
                            <Badge variant="destructive" className="text-xs">Low</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{medicine.brand} • {medicine.form}</p>
                        <div className="flex items-center justify-between gap-4 mt-2">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Stock: {medicine.quantity} {medicine.unit}</span>
                            <span>Daily: {medicine.avg_daily_sales}</span>
                          </div>
                          {isLowStock && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/orders');
                              }}
                              className="text-xs h-7"
                            >
                              <ShoppingCart className="h-3 w-3 mr-1" />
                              Reorder
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{daysRemaining}d</div>
                        <div className="text-xs text-muted-foreground">remaining</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <Link to="/inventory">
              <Button variant="outline" className="w-full mt-4">
                View All Inventory
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Forecast Chart */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Demand Forecast</CardTitle>
            <CardDescription>
              {selectedMedicine
                ? `14-day forecast for ${selectedMedicine.name}`
                : 'Select a medicine to view forecast'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedMedicine ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={forecastData}>
                    <defs>
                      <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                      className="text-xs"
                    />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="upper"
                      stroke="none"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.1}
                    />
                    <Area
                      type="monotone"
                      dataKey="lower"
                      stroke="none"
                      fill="hsl(var(--background))"
                      fillOpacity={1}
                    />
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>

                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Confidence Level</span>
                    <Badge variant={
                      forecastData[0]?.confidence === 'High' ? 'default' :
                      forecastData[0]?.confidence === 'Medium' ? 'secondary' : 'outline'
                    }>
                      {forecastData[0]?.confidence}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Forecast based on historical usage patterns, seasonal trends, and recent demand spikes.
                    {selectedMedicine.avg_daily_sales > 5 && ' High daily sales indicate consistent demand.'}
                  </p>
                  <Link to="/forecasting">
                    <Button variant="secondary" size="sm" className="w-full mt-2">
                      View Detailed Analysis
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-center">
                <div>
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    Click on any medicine from the stock list to view its demand forecast
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link to="/inventory">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Package className="h-4 w-4" />
                Update Inventory
              </Button>
            </Link>
            <Link to="/network">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Users className="h-4 w-4" />
                Find Nearby Stock
              </Button>
            </Link>
            <Link to="/alerts">
              <Button variant="outline" className="w-full justify-start gap-2">
                <AlertTriangle className="h-4 w-4" />
                View Alerts
              </Button>
            </Link>
            <Link to="/forecasting">
              <Button variant="outline" className="w-full justify-start gap-2">
                <TrendingUp className="h-4 w-4" />
                Forecast Analysis
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
