import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Info, TrendingUp, Cloud, Users } from 'lucide-react';
import { storage } from '@/lib/storage';
import { mockMedicines, generateForecast, generateHistoricalSales } from '@/data/mockData';
import { Medicine } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const Forecasting = () => {
  const [inventory, setInventory] = useState<Medicine[]>([]);
  const [selectedMedicineId, setSelectedMedicineId] = useState<string>('');

  useEffect(() => {
    const storedInventory = storage.getInventory();
    if (storedInventory.length === 0) {
      storage.setInventory(mockMedicines);
      setInventory(mockMedicines);
      setSelectedMedicineId(mockMedicines[0]?.medicine_id || '');
    } else {
      setInventory(storedInventory);
      setSelectedMedicineId(storedInventory[0]?.medicine_id || '');
    }
  }, []);

  const selectedMedicine = inventory.find(m => m.medicine_id === selectedMedicineId);
  const forecastData = selectedMedicine ? generateForecast(selectedMedicine, 30) : [];
  const historicalData = selectedMedicine ? generateHistoricalSales(selectedMedicine, 90) : [];
  
  const combinedChartData = [
    ...historicalData.map(h => ({
      date: h.date,
      actual: h.sales,
      historyBased: null,
      predicted: null,
    })),
    ...forecastData.map(f => ({
      date: f.date,
      actual: null,
      historyBased: f.historyBased,
      predicted: f.predicted,
    })),
  ];

  const predictedDemand30d = forecastData.reduce((sum, f) => sum + f.predicted, 0);
  const currentStock = selectedMedicine?.quantity || 0;
  const recommendedReorder = Math.max(0, Math.ceil(predictedDemand30d - currentStock + selectedMedicine?.avg_daily_sales * 7 || 0));

  const depletionDate = forecastData.find((f, idx) => {
    const cumulative = forecastData.slice(0, idx + 1).reduce((sum, item) => sum + item.predicted, 0);
    return cumulative >= currentStock;
  });

  const drivers = [
    {
      name: 'Historical Usage',
      impact: 'High',
      description: `Based on ${selectedMedicine?.avg_daily_sales || 0} daily sales average`,
    },
    {
      name: 'Seasonal Pattern',
      impact: 'Medium',
      description: 'Weekly demand variations detected',
    },
    {
      name: 'Disease Outbreak',
      impact: selectedMedicine?.category === 'Antipyretic' ? 'High' : 'Low',
      description: selectedMedicine?.category === 'Antipyretic'
        ? 'Early signals detected via Google Trends (search interest for symptoms) which the model uses to adjust short-term demand'
        : 'No outbreak signals detected for this medicine category',
    },
    {
      name: 'Weather Signal',
      impact: selectedMedicine?.category === 'Antipyretic' ? 'High' : 'Low',
      description: selectedMedicine?.category === 'Antipyretic'
        ? 'Recent temperature changes affect fever medicine demand'
        : 'Low correlation with weather patterns',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Demand Forecasting</h1>
        <p className="text-muted-foreground">AI-powered predictions and insights</p>
      </div>

      {/* Medicine Selector */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Select Medicine</CardTitle>
          <CardDescription>Choose a medicine to view its forecast analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedMedicineId} onValueChange={setSelectedMedicineId}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {inventory.map((medicine) => (
                <SelectItem key={medicine.medicine_id} value={medicine.medicine_id}>
                  {medicine.name} ({medicine.brand}) - {medicine.quantity} {medicine.unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedMedicine && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="shadow-soft">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  30-Day Predicted Demand
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(predictedDemand30d)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedMedicine.unit} expected
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Recommended Reorder
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recommendedReorder}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedMedicine.unit} to maintain buffer
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Estimated Depletion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {depletionDate
                    ? new Date(depletionDate.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })
                    : '>14 days'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on current stock
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Forecast Chart with Historical Data */}
          <Card className="shadow-medium">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Historical & 30-Day Forecast</CardTitle>
                  <CardDescription>Past 90 days actual usage + next 30 days predicted demand</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-success"></div>
                  <span>Past Usage (90d)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-destructive"></div>
                  <span>History-Based Forecast</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-primary"></div>
                  <span>AI-Predicted Forecast</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={combinedChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="hsl(var(--success))"
                    strokeWidth={2}
                    dot={false}
                    name="Past Usage"
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="historyBased"
                    stroke="hsl(var(--destructive))"
                    strokeWidth={2}
                    dot={false}
                    name="History-Based"
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                    name="AI Predicted"
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Explainability */}
          <Card className="shadow-medium">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                <CardTitle>Forecast Explainability</CardTitle>
              </div>
              <CardDescription>Key factors influencing this prediction</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {drivers.map((driver, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{driver.name}</h4>
                        <Badge
                          variant={
                            driver.impact === 'High' ? 'default' :
                            driver.impact === 'Medium' ? 'secondary' : 'outline'
                          }
                        >
                          {driver.impact} Impact
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{driver.description}</p>
                    </div>
                  </div>
                ))}

                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">Model Information</h4>
                      <p className="text-sm text-muted-foreground">
                        Predictions use a lightweight time-series model combining historical sales patterns,
                        seasonal trends, and external signals (weather, search trends). The model adapts to
                        recent changes and provides confidence intervals based on historical accuracy.
                      </p>
                    </div>
                  </div>
                </div>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Info className="h-4 w-4 mr-2" />
                      Why reorder {recommendedReorder} {selectedMedicine.unit}?
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Reorder Recommendation Breakdown</h4>
                      <div className="space-y-1 text-sm">
                        <p>• Current stock: {currentStock} {selectedMedicine.unit}</p>
                        <p>• 30-day forecast: {Math.round(predictedDemand30d)} {selectedMedicine.unit}</p>
                        <p>• Safety buffer: {Math.round(selectedMedicine.avg_daily_sales * 7)} {selectedMedicine.unit}</p>
                        <p className="pt-2 border-t">
                          <strong>Recommended: {recommendedReorder} {selectedMedicine.unit}</strong>
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground pt-2">
                        Maintains 7-day safety buffer to prevent stockouts while minimizing excess inventory.
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Forecast Summary */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>All Medicines Forecast Summary</CardTitle>
              <CardDescription>Predicted depletion and reorder recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {inventory.slice(0, 5).map((medicine) => {
                  const forecast = generateForecast(medicine);
                  const demand = forecast.slice(0, 7).reduce((sum, f) => sum + f.predicted, 0);
                  const daysLeft = Math.floor(medicine.quantity / medicine.avg_daily_sales);
                  const needsReorder = daysLeft < 7;

                  return (
                    <div
                      key={medicine.medicine_id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <h4 className="font-semibold">{medicine.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {Math.round(demand)} {medicine.unit} predicted in 7 days
                        </p>
                      </div>
                      <div className="text-right">
                        {needsReorder ? (
                          <Badge variant="destructive">{daysLeft}d left</Badge>
                        ) : (
                          <Badge variant="outline">{daysLeft}d left</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Forecasting;
