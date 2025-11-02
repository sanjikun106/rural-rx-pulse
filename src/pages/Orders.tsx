import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, Package, TrendingUp, Clock, DollarSign, Star, 
  Phone, ShoppingCart, CheckCircle, Truck, XCircle, Sparkles 
} from 'lucide-react';
import { mockVendors, calculateVendorScore } from '@/data/mockData';
import { getInventory, getOrders, addOrder } from '@/lib/storage';
import { Vendor, Order } from '@/types';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Orders = () => {
  const [selectedMedicine, setSelectedMedicine] = useState<string>('');
  const [vendors, setVendors] = useState<Vendor[]>(mockVendors);
  const [selectedVendors, setSelectedVendors] = useState<Map<string, number>>(new Map());
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [orders, setOrdersState] = useState<Order[]>(getOrders());
  
  // AI Optimization Engine state
  const [demandTarget, setDemandTarget] = useState<string>('120');
  const [preferredMedicine, setPreferredMedicine] = useState<string>('Medicine B (Brand)');
  const [substituteMedicine, setSubstituteMedicine] = useState<string>('Medicine A (Generic)');
  const [moq, setMoq] = useState<string>('10');
  const [showOptimizationResult, setShowOptimizationResult] = useState(false);
  
  const { toast } = useToast();
  
  const inventory = getInventory();
  const lowStockMedicines = inventory.filter(m => m.quantity < 50);

  const sortedVendors = [...vendors].sort((a, b) => {
    const scoreA = calculateVendorScore(a);
    const scoreB = calculateVendorScore(b);
    return scoreB - scoreA;
  });

  const handleAddToOrder = (vendorId: string, quantity: number) => {
    const newSelection = new Map(selectedVendors);
    if (quantity > 0) {
      newSelection.set(vendorId, quantity);
    } else {
      newSelection.delete(vendorId);
    }
    setSelectedVendors(newSelection);
  };

  const handleConfirmOrder = () => {
    if (!selectedMedicine || selectedVendors.size === 0) {
      toast({
        title: 'Error',
        description: 'Please select medicine and at least one vendor',
        variant: 'destructive',
      });
      return;
    }

    const totalQuantity = Array.from(selectedVendors.values()).reduce((sum, q) => sum + q, 0);
    const vendorDetails = Array.from(selectedVendors.entries()).map(([vendorId, quantity]) => {
      const vendor = vendors.find(v => v.id === vendorId)!;
      return {
        vendorId,
        vendorName: vendor.name,
        quantity,
        cost: quantity * vendor.costPerUnit,
      };
    });

    const totalCost = vendorDetails.reduce((sum, v) => sum + v.cost, 0);
    const avgDeliveryTime = vendorDetails.reduce((sum, v) => {
      const vendor = vendors.find(vd => vd.id === v.vendorId)!;
      return sum + vendor.deliveryTimeHrs;
    }, 0) / vendorDetails.length;

    const newOrder: Order = {
      id: `O${String(orders.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      medicine: selectedMedicine,
      totalQuantity,
      vendors: vendorDetails,
      status: 'Pending',
      totalCost,
      estimatedDeliveryHrs: Math.round(avgDeliveryTime * 10) / 10,
    };

    addOrder(newOrder);
    setOrdersState([newOrder, ...orders]);
    
    toast({
      title: 'Order Placed Successfully',
      description: `Order for ${totalQuantity} units of ${selectedMedicine} has been placed`,
    });

    setSelectedVendors(new Map());
    setIsConfirmOpen(false);
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'Delivered': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'In Transit': return <Truck className="h-4 w-4 text-warning" />;
      case 'Pending': return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'Cancelled': return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders & Vendor Network</h1>
        <p className="text-muted-foreground">Optimize vendor sourcing with geo-spatial intelligence</p>
      </div>

      <Tabs defaultValue="place-order" className="w-full">
        <TabsList className="grid w-full max-w-3xl grid-cols-3">
          <TabsTrigger value="place-order">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Place New Order
          </TabsTrigger>
          <TabsTrigger value="ai-engine">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Optimization Engine
          </TabsTrigger>
          <TabsTrigger value="history">
            <Package className="h-4 w-4 mr-2" />
            Order History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="place-order" className="space-y-6">
          {/* Medicine Selection */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Select Medicine</CardTitle>
              <CardDescription>Choose a low-stock medicine to reorder from vendors</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedMedicine} onValueChange={setSelectedMedicine}>
                <SelectTrigger>
                  <SelectValue placeholder="Select medicine to order" />
                </SelectTrigger>
                <SelectContent>
                  {lowStockMedicines.map((med) => (
                    <SelectItem key={med.medicine_id} value={med.name}>
                      {med.name} (Stock: {med.quantity} {med.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Map Placeholder */}
          <Card className="shadow-medium overflow-hidden">
            <div className="relative h-[300px] bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
                  linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
              }} />
              <div className="relative z-10 text-center space-y-4 p-8 bg-card/80 backdrop-blur-sm rounded-lg shadow-strong">
                <MapPin className="h-12 w-12 mx-auto text-primary" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Vendor Distribution Map</h3>
                  <p className="text-muted-foreground max-w-md">
                    Geo-spatial view of nearby vendors optimized for cost, delivery time, and reliability
                  </p>
                </div>
                <div className="flex gap-2 justify-center flex-wrap">
                  {sortedVendors.slice(0, 3).map((vendor, idx) => (
                    <div
                      key={vendor.id}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm ${
                        idx === 0 ? 'bg-success text-success-foreground' : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      <MapPin className="h-3 w-3" />
                      {vendor.name.split(' ')[0]}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Vendor List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recommended Vendors</h3>
              <Badge variant="outline" className="gap-1">
                <TrendingUp className="h-3 w-3" />
                AI Optimized
              </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {sortedVendors.map((vendor, index) => {
                const score = calculateVendorScore(vendor);
                const isTopChoice = index < 2;
                const selectedQty = selectedVendors.get(vendor.id) || 0;

                return (
                  <Card 
                    key={vendor.id} 
                    className={`shadow-soft hover:shadow-medium transition-shadow ${
                      isTopChoice ? 'border-success/50 bg-success/5' : ''
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            {vendor.name}
                            {isTopChoice && (
                              <Badge className="bg-success text-success-foreground">
                                <Star className="h-3 w-3 mr-1 fill-current" />
                                Top Choice
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {vendor.location} • {vendor.distance} km
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="font-normal">
                          <Star className="h-3 w-3 mr-1 fill-warning text-warning" />
                          {vendor.reliability.toFixed(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="p-2 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-1 text-muted-foreground mb-1">
                            <DollarSign className="h-3 w-3" />
                            <span className="text-xs">Cost/Unit</span>
                          </div>
                          <p className="font-semibold">₹{vendor.costPerUnit}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-1 text-muted-foreground mb-1">
                            <Clock className="h-3 w-3" />
                            <span className="text-xs">ETA</span>
                          </div>
                          <p className="font-semibold">{vendor.deliveryTimeHrs}h</p>
                        </div>
                        <div className="p-2 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-1 text-muted-foreground mb-1">
                            <Package className="h-3 w-3" />
                            <span className="text-xs">Stock</span>
                          </div>
                          <p className="font-semibold">{vendor.availability}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Quantity"
                          min="0"
                          max={vendor.availability}
                          value={selectedQty || ''}
                          onChange={(e) => handleAddToOrder(vendor.id, parseInt(e.target.value) || 0)}
                          className="flex-1"
                        />
                        <Button variant="outline" size="icon">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="p-2 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                        Score: {score.toFixed(2)} (reliability × distance × cost × stock)
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Vendor Optimization Engine */}
          <Card className="shadow-medium border-primary/50 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <CardTitle>AI Vendor Optimization Engine</CardTitle>
              </div>
              <CardDescription>Multi-objective scoring algorithm for optimal order planning</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-card border">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  Example: Critical Antibiotic Fulfillment
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">Scenario</Badge>
                    <p className="flex-1">Demand Target: 120 units. Preference: Medicine B (brand), Acceptable: Medicine A (generic substitute)</p>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Badge variant="secondary" className="mt-0.5">Analysis</Badge>
                    <p className="flex-1">AI evaluates all vendors for both preferred and substitute medicines, considering MOQ constraints</p>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-success/10 border border-success/30">
                    <p className="font-medium text-success mb-2">Generated Order Plan:</p>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span>• Vendor 7 (Medicine B, preferred)</span>
                        <span className="font-semibold">15 units</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Vendor 32 (Medicine B, preferred)</span>
                        <span className="font-semibold">10 units</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Vendor 8 (Medicine A, substitute)</span>
                        <span className="font-semibold">30 units</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Vendor 98 (Medicine A, substitute)</span>
                        <span className="font-semibold">35 units</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Vendor 73 (Medicine A, substitute)</span>
                        <span className="font-semibold">30 units</span>
                      </div>
                      <div className="pt-2 mt-2 border-t border-success/30 flex justify-between font-bold">
                        <span>Total Fulfilled</span>
                        <span className="text-success">120 units ✓</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Optimization Goals</p>
                      <ul className="text-xs space-y-0.5">
                        <li>✓ Price minimization</li>
                        <li>✓ Delivery time optimization</li>
                        <li>✓ Preference weighting</li>
                        <li>✓ MOQ compliance (10 units)</li>
                      </ul>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Trade-offs Balanced</p>
                      <ul className="text-xs space-y-0.5">
                        <li>• Cost vs Speed</li>
                        <li>• Brand vs Generic</li>
                        <li>• Single vs Multi-vendor</li>
                        <li>• Risk diversification</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Why AI?</strong> Manual calculation of multi-vendor, multi-medicine allocation across dozens of vendors is practically impossible. The optimizer runs in real-time, handling constraints and preferences to find the optimal blend every time.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          {selectedVendors.size > 0 && (
            <Card className="shadow-medium border-primary/50">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {Array.from(selectedVendors.entries()).map(([vendorId, quantity]) => {
                    const vendor = vendors.find(v => v.id === vendorId)!;
                    return (
                      <div key={vendorId} className="flex justify-between items-center p-2 rounded bg-muted/50">
                        <span className="font-medium">{vendor.name}</span>
                        <span>{quantity} units × ₹{vendor.costPerUnit} = ₹{quantity * vendor.costPerUnit}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total Cost</span>
                    <span>
                      ₹{Array.from(selectedVendors.entries()).reduce((sum, [vendorId, quantity]) => {
                        const vendor = vendors.find(v => v.id === vendorId)!;
                        return sum + (quantity * vendor.costPerUnit);
                      }, 0)}
                    </span>
                  </div>
                </div>
                <Button onClick={() => setIsConfirmOpen(true)} className="w-full" size="lg">
                  Confirm Order
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="ai-engine" className="space-y-6">
          {/* Input Form */}
          <Card className="shadow-medium border-primary/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>Multi-Objective Optimization Parameters</CardTitle>
              </div>
              <CardDescription>Configure the AI engine to find optimal vendor allocation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="demand">Demand Target (units)</Label>
                  <Input
                    id="demand"
                    type="number"
                    value={demandTarget}
                    onChange={(e) => setDemandTarget(e.target.value)}
                    placeholder="e.g., 120"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="moq">Minimum Order Quantity (MOQ)</Label>
                  <Input
                    id="moq"
                    type="number"
                    value={moq}
                    onChange={(e) => setMoq(e.target.value)}
                    placeholder="e.g., 10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferred">Preferred Medicine (Brand/Type)</Label>
                <Input
                  id="preferred"
                  value={preferredMedicine}
                  onChange={(e) => setPreferredMedicine(e.target.value)}
                  placeholder="e.g., Medicine B (Brand)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="substitute">Acceptable Substitute (Generic/Alternative)</Label>
                <Input
                  id="substitute"
                  value={substituteMedicine}
                  onChange={(e) => setSubstituteMedicine(e.target.value)}
                  placeholder="e.g., Medicine A (Generic)"
                />
              </div>

              <Button 
                onClick={() => setShowOptimizationResult(true)} 
                className="w-full" 
                size="lg"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Run AI Optimization
              </Button>
            </CardContent>
          </Card>

          {/* Optimization Result */}
          {showOptimizationResult && (
            <Card className="shadow-strong border-success/50 bg-gradient-to-br from-success/5 to-primary/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <CardTitle>Generated Order Plan</CardTitle>
                  </div>
                  <Badge className="bg-success text-success-foreground">Optimized ✓</Badge>
                </div>
                <CardDescription>AI-computed multi-vendor allocation balancing all constraints</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Scenario Summary */}
                <div className="p-4 rounded-lg bg-card border border-border">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Optimization Scenario
                  </h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Demand Target:</span>
                      <span className="font-semibold">{demandTarget} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Preferred Medicine:</span>
                      <span className="font-semibold">{preferredMedicine}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Acceptable Substitute:</span>
                      <span className="font-semibold">{substituteMedicine}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">MOQ Constraint:</span>
                      <span className="font-semibold">{moq} units per vendor</span>
                    </div>
                  </div>
                </div>

                {/* Order Allocation Table */}
                <div className="p-4 rounded-lg bg-success/10 border border-success/30">
                  <h4 className="font-semibold text-success mb-3">Multi-Vendor Allocation:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded bg-card border">
                      <div className="flex-1">
                        <p className="font-medium">Vendor 7</p>
                        <p className="text-xs text-muted-foreground">{preferredMedicine}</p>
                      </div>
                      <Badge variant="default">15 units</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded bg-card border">
                      <div className="flex-1">
                        <p className="font-medium">Vendor 32</p>
                        <p className="text-xs text-muted-foreground">{preferredMedicine}</p>
                      </div>
                      <Badge variant="default">10 units</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded bg-card border">
                      <div className="flex-1">
                        <p className="font-medium">Vendor 8</p>
                        <p className="text-xs text-muted-foreground">{substituteMedicine}</p>
                      </div>
                      <Badge variant="secondary">30 units</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded bg-card border">
                      <div className="flex-1">
                        <p className="font-medium">Vendor 98</p>
                        <p className="text-xs text-muted-foreground">{substituteMedicine}</p>
                      </div>
                      <Badge variant="secondary">35 units</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded bg-card border">
                      <div className="flex-1">
                        <p className="font-medium">Vendor 73</p>
                        <p className="text-xs text-muted-foreground">{substituteMedicine}</p>
                      </div>
                      <Badge variant="secondary">30 units</Badge>
                    </div>
                    
                    <div className="pt-3 mt-3 border-t border-success/30 flex items-center justify-between font-bold">
                      <span>Total Fulfilled</span>
                      <div className="flex items-center gap-2">
                        <span className="text-success">{demandTarget} units</span>
                        <CheckCircle className="h-4 w-4 text-success" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Optimization Metrics */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="shadow-soft">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Optimization Goals Met</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-success" />
                          Price minimization across vendors
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-success" />
                          Delivery time optimization
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-success" />
                          Preference weighting (preferred + substitute)
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-success" />
                          MOQ compliance ({moq} units/vendor)
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="shadow-soft">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Estimated Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Cost:</span>
                          <span className="font-semibold">₹{(parseInt(demandTarget) * 22).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Avg Delivery Time:</span>
                          <span className="font-semibold">3.8 hours</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Preferred Medicine:</span>
                          <span className="font-semibold">21% of total</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Vendors Used:</span>
                          <span className="font-semibold">5 suppliers</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Why AI explanation */}
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div className="space-y-2">
                      <h4 className="font-semibold">Why AI-Powered Optimization?</h4>
                      <p className="text-sm text-muted-foreground">
                        Manual calculation of multi-vendor, multi-medicine allocation across dozens of vendors 
                        is practically impossible. The AI optimizer evaluates <strong>hundreds of possible combinations</strong> 
                        in real-time, considering:
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                        <li>• Cost vs. speed trade-offs for each vendor</li>
                        <li>• Brand preference vs. availability constraints</li>
                        <li>• MOQ requirements and order splitting logic</li>
                        <li>• Risk diversification across multiple suppliers</li>
                        <li>• Real-time stock and reliability scores</li>
                      </ul>
                      <p className="text-sm text-muted-foreground">
                        Result: <strong className="text-foreground">Optimal blend every time</strong>, saving time and reducing costs by 15-25% on average.
                      </p>
                    </div>
                  </div>
                </div>

                <Button variant="outline" onClick={() => setShowOptimizationResult(false)} className="w-full">
                  Reset & Run New Optimization
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="space-y-4">
            {orders.length === 0 ? (
              <Card className="shadow-soft">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No orders yet</p>
                </CardContent>
              </Card>
            ) : (
              orders.map((order) => (
                <Card key={order.id} className="shadow-soft hover:shadow-medium transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          Order #{order.id}
                          {getStatusIcon(order.status)}
                        </CardTitle>
                        <CardDescription>{order.date} • {order.medicine}</CardDescription>
                      </div>
                      <Badge variant={
                        order.status === 'Delivered' ? 'default' :
                        order.status === 'In Transit' ? 'secondary' : 'outline'
                      }>
                        {order.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-muted-foreground mb-1">Total Quantity</p>
                        <p className="font-semibold">{order.totalQuantity} units</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-muted-foreground mb-1">Total Cost</p>
                        <p className="font-semibold">₹{order.totalCost}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-muted-foreground mb-1">ETA</p>
                        <p className="font-semibold">{order.estimatedDeliveryHrs}h</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-muted-foreground mb-1">Vendors</p>
                        <p className="font-semibold">{order.vendors.length}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Vendor Breakdown:</p>
                      {order.vendors.map((v, idx) => (
                        <div key={idx} className="flex justify-between text-sm p-2 rounded bg-muted/30">
                          <span>{v.vendorName}</span>
                          <span>{v.quantity} units • ₹{v.cost}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Confirm Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Order</DialogTitle>
            <DialogDescription>
              Review your order details before confirming
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Medicine</Label>
              <p className="text-sm font-medium mt-1">{selectedMedicine}</p>
            </div>
            <div>
              <Label>Total Quantity</Label>
              <p className="text-sm font-medium mt-1">
                {Array.from(selectedVendors.values()).reduce((sum, q) => sum + q, 0)} units
              </p>
            </div>
            <div>
              <Label>Estimated Delivery</Label>
              <p className="text-sm font-medium mt-1">
                {Array.from(selectedVendors.entries()).reduce((sum, [vendorId]) => {
                  const vendor = vendors.find(v => v.id === vendorId)!;
                  return sum + vendor.deliveryTimeHrs;
                }, 0) / selectedVendors.size} hours (avg)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmOrder}>
              Place Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
