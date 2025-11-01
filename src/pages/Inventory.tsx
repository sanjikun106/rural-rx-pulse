import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, Plus, Search, Trash2, Edit } from 'lucide-react';
import { storage } from '@/lib/storage';
import { mockMedicines } from '@/data/mockData';
import { Medicine } from '@/types';
import Papa from 'papaparse';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Inventory = () => {
  const [inventory, setInventory] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedInventory = storage.getInventory();
    if (storedInventory.length === 0) {
      storage.setInventory(mockMedicines);
      setInventory(mockMedicines);
    } else {
      setInventory(storedInventory);
    }
  }, []);

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        try {
          const newMedicines = results.data
            .filter((row: any) => row.medicine_id && row.name)
            .map((row: any) => ({
              medicine_id: row.medicine_id,
              name: row.name,
              brand: row.brand,
              form: row.form,
              quantity: parseInt(row.quantity) || 0,
              unit: row.unit,
              expiry_date: row.expiry_date,
              batch: row.batch,
              last_sold_date: row.last_sold_date,
              avg_daily_sales: parseFloat(row.avg_daily_sales) || 0,
              category: row.category,
            }));

          const updatedInventory = [...inventory, ...newMedicines];
          storage.setInventory(updatedInventory);
          setInventory(updatedInventory);

          toast({
            title: 'CSV Uploaded Successfully',
            description: `Added ${newMedicines.length} medicines to inventory`,
          });
        } catch (error) {
          toast({
            title: 'Upload Failed',
            description: 'Please check your CSV format and try again',
            variant: 'destructive',
          });
        }
      },
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExportCSV = () => {
    const csv = Papa.unparse(inventory);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medilink-inventory-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Export Successful',
      description: 'Inventory exported to CSV',
    });
  };

  const handleDelete = (medicineId: string) => {
    const updatedInventory = inventory.filter(m => m.medicine_id !== medicineId);
    storage.setInventory(updatedInventory);
    setInventory(updatedInventory);

    toast({
      title: 'Medicine Deleted',
      description: 'Item removed from inventory',
    });
  };

  const handleSave = (medicine: Medicine) => {
    let updatedInventory;
    if (editingMedicine && editingMedicine.medicine_id !== 'new') {
      updatedInventory = inventory.map(m =>
        m.medicine_id === medicine.medicine_id ? medicine : m
      );
    } else {
      const newMedicine = {
        ...medicine,
        medicine_id: `M${String(inventory.length + 1).padStart(3, '0')}`,
      };
      updatedInventory = [...inventory, newMedicine];
    }

    storage.setInventory(updatedInventory);
    setInventory(updatedInventory);
    setIsDialogOpen(false);
    setEditingMedicine(null);

    toast({
      title: editingMedicine ? 'Medicine Updated' : 'Medicine Added',
      description: 'Inventory updated successfully',
    });
  };

  const openAddDialog = () => {
    setEditingMedicine({
      medicine_id: 'new',
      name: '',
      brand: '',
      form: 'Tablet',
      quantity: 0,
      unit: 'tablets',
      expiry_date: '',
      batch: '',
      last_sold_date: new Date().toISOString().split('T')[0],
      avg_daily_sales: 0,
      category: '',
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">Manage your medicine stock and upload data</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Upload CSV
          </Button>
          <Button onClick={openAddDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Medicine
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleCSVUpload}
          className="hidden"
        />
      </div>

      <Card className="shadow-medium">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Stock</CardTitle>
              <CardDescription>{inventory.length} medicines in inventory</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Form</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Daily Sales</TableHead>
                  <TableHead>Days Left</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((medicine) => {
                  const daysRemaining = Math.floor(medicine.quantity / medicine.avg_daily_sales);
                  const isLowStock = daysRemaining < 7;

                  return (
                    <TableRow key={medicine.medicine_id}>
                      <TableCell className="font-medium">{medicine.name}</TableCell>
                      <TableCell>{medicine.brand}</TableCell>
                      <TableCell>{medicine.form}</TableCell>
                      <TableCell>
                        {medicine.quantity} {medicine.unit}
                      </TableCell>
                      <TableCell>{medicine.avg_daily_sales}</TableCell>
                      <TableCell>
                        {isLowStock ? (
                          <Badge variant="destructive">{daysRemaining}d</Badge>
                        ) : (
                          <span>{daysRemaining}d</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(medicine.expiry_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{medicine.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingMedicine(medicine);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(medicine.medicine_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit/Add Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingMedicine?.medicine_id === 'new' ? 'Add Medicine' : 'Edit Medicine'}
            </DialogTitle>
            <DialogDescription>
              Enter medicine details below
            </DialogDescription>
          </DialogHeader>
          {editingMedicine && (
            <MedicineForm
              medicine={editingMedicine}
              onSave={handleSave}
              onCancel={() => setIsDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface MedicineFormProps {
  medicine: Medicine;
  onSave: (medicine: Medicine) => void;
  onCancel: () => void;
}

const MedicineForm = ({ medicine, onSave, onCancel }: MedicineFormProps) => {
  const [formData, setFormData] = useState(medicine);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Medicine Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="brand">Brand *</Label>
          <Input
            id="brand"
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="form">Form *</Label>
          <Select
            value={formData.form}
            onValueChange={(value: any) => setFormData({ ...formData, form: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tablet">Tablet</SelectItem>
              <SelectItem value="Capsule">Capsule</SelectItem>
              <SelectItem value="Liquid">Liquid</SelectItem>
              <SelectItem value="Syrup">Syrup</SelectItem>
              <SelectItem value="Injection">Injection</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit">Unit *</Label>
          <Input
            id="unit"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="avg_daily_sales">Avg Daily Sales *</Label>
          <Input
            id="avg_daily_sales"
            type="number"
            step="0.1"
            value={formData.avg_daily_sales}
            onChange={(e) => setFormData({ ...formData, avg_daily_sales: parseFloat(e.target.value) || 0 })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="batch">Batch Number</Label>
          <Input
            id="batch"
            value={formData.batch}
            onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expiry_date">Expiry Date *</Label>
          <Input
            id="expiry_date"
            type="date"
            value={formData.expiry_date}
            onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_sold_date">Last Sold Date</Label>
          <Input
            id="last_sold_date"
            type="date"
            value={formData.last_sold_date}
            onChange={(e) => setFormData({ ...formData, last_sold_date: e.target.value })}
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  );
};

export default Inventory;
