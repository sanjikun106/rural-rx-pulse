import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Star, Send, Search } from 'lucide-react';
import { mockPharmacies } from '@/data/mockData';
import { Pharmacy } from '@/types';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Network = () => {
  const [pharmacies] = useState<Pharmacy[]>(mockPharmacies);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const filteredPharmacies = pharmacies.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendRequest = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setIsRequestDialogOpen(true);
  };

  const submitRequest = (data: { medicine: string; quantity: string; notes: string }) => {
    toast({
      title: 'Request Sent',
      description: `Request sent to ${selectedPharmacy?.name} for ${data.quantity} units of ${data.medicine}`,
    });
    setIsRequestDialogOpen(false);
    setSelectedPharmacy(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pharmacy Network</h1>
        <p className="text-muted-foreground">Find and connect with nearby partner pharmacies</p>
      </div>

      {/* Search */}
      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by pharmacy name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Map Placeholder */}
      <Card className="shadow-medium overflow-hidden">
        <div className="relative h-[400px] bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
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
              <h3 className="text-xl font-bold mb-2">Interactive Map</h3>
              <p className="text-muted-foreground max-w-md">
                Map view shows nearby partner pharmacies with real-time stock availability.
                Click on markers to view details and send requests.
              </p>
            </div>
            <div className="flex gap-2 justify-center flex-wrap">
              {filteredPharmacies.map((pharmacy) => (
                <div
                  key={pharmacy.id}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-sm"
                >
                  <MapPin className="h-3 w-3" />
                  {pharmacy.name.split(' ')[0]}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Pharmacy List */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredPharmacies.map((pharmacy) => (
          <Card key={pharmacy.id} className="shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {pharmacy.name}
                    <Badge variant="outline" className="font-normal">
                      <Star className="h-3 w-3 mr-1 fill-warning text-warning" />
                      {pharmacy.rating}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {pharmacy.location} • {pharmacy.distance} km away
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-muted-foreground mb-1">Medicines Available</p>
                  <p className="font-semibold">45+ items</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-muted-foreground mb-1">Response Time</p>
                  <p className="font-semibold">~2 hours</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={() => handleSendRequest(pharmacy)}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Request
                </Button>
                <Button variant="outline" size="icon">
                  <Phone className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                <p className="text-sm text-success-foreground">
                  ✓ Paracetamol, Ibuprofen, Amoxicillin available
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Request Dialog */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Medicine</DialogTitle>
            <DialogDescription>
              Send a request to {selectedPharmacy?.name}
            </DialogDescription>
          </DialogHeader>
          <RequestForm
            onSubmit={submitRequest}
            onCancel={() => setIsRequestDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface RequestFormProps {
  onSubmit: (data: { medicine: string; quantity: string; notes: string }) => void;
  onCancel: () => void;
}

const RequestForm = ({ onSubmit, onCancel }: RequestFormProps) => {
  const [formData, setFormData] = useState({
    medicine: '',
    quantity: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="medicine">Medicine Name *</Label>
        <Select
          value={formData.medicine}
          onValueChange={(value) => setFormData({ ...formData, medicine: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select medicine" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Paracetamol">Paracetamol</SelectItem>
            <SelectItem value="Ibuprofen">Ibuprofen</SelectItem>
            <SelectItem value="Amoxicillin">Amoxicillin</SelectItem>
            <SelectItem value="Cetirizine">Cetirizine</SelectItem>
            <SelectItem value="Other">Other (specify in notes)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity Required *</Label>
        <Input
          id="quantity"
          type="number"
          placeholder="e.g., 100"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          placeholder="Urgency, specific requirements, etc."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
      </div>

      <div className="p-3 rounded-lg bg-muted/50 text-sm">
        <p className="text-muted-foreground">
          The pharmacy will receive your request via SMS and can accept or provide alternatives.
          Average response time: 2 hours.
        </p>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Send Request</Button>
      </DialogFooter>
    </form>
  );
};

export default Network;
