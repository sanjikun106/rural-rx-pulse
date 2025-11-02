import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus, Receipt, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { storage } from '@/lib/storage';
import { Bill, BillItem } from '@/types';

const Billing = () => {
  const { toast } = useToast();
  const [customerName, setCustomerName] = useState('');
  const [items, setItems] = useState<Omit<BillItem, 'id' | 'totalPrice'>[]>([
    { medicineName: '', quantity: 1, pricePerUnit: 0 },
  ]);
  const [bills, setBills] = useState<Bill[]>(storage.getBills());

  const addItem = () => {
    setItems([...items, { medicineName: '', quantity: 1, pricePerUnit: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof Omit<BillItem, 'id' | 'totalPrice'>, value: string | number) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.pricePerUnit), 0);
  };

  const calculateTax = (subtotal: number) => {
    return subtotal * 0.05; // 5% tax
  };

  const generateBillNumber = () => {
    const date = new Date();
    const timestamp = date.getTime();
    return `BILL-${timestamp}`;
  };

  const createBill = () => {
    if (items.some(item => !item.medicineName || item.quantity <= 0 || item.pricePerUnit <= 0)) {
      toast({
        title: "Invalid Data",
        description: "Please fill all fields with valid values",
        variant: "destructive",
      });
      return;
    }

    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    const totalAmount = subtotal + tax;

    const billItems: BillItem[] = items.map((item, index) => ({
      id: `item-${index}`,
      medicineName: item.medicineName,
      quantity: item.quantity,
      pricePerUnit: item.pricePerUnit,
      totalPrice: item.quantity * item.pricePerUnit,
    }));

    const newBill: Bill = {
      id: `bill-${Date.now()}`,
      billNumber: generateBillNumber(),
      date: new Date().toISOString(),
      customerName: customerName || undefined,
      items: billItems,
      subtotal,
      tax,
      totalAmount,
    };

    storage.addBill(newBill);
    setBills([newBill, ...bills]);

    // Reset form
    setCustomerName('');
    setItems([{ medicineName: '', quantity: 1, pricePerUnit: 0 }]);

    toast({
      title: "Bill Created",
      description: `Bill ${newBill.billNumber} has been created successfully`,
    });
  };

  const printBill = (bill: Bill) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const pharmacyName = storage.getPharmacyName();
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bill ${bill.billNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { margin: 0; color: #333; }
            .header p { margin: 5px 0; color: #666; }
            .bill-info { margin-bottom: 20px; }
            .bill-info p { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; }
            .totals { margin-top: 20px; text-align: right; }
            .totals p { margin: 5px 0; }
            .total { font-weight: bold; font-size: 1.2em; }
            .footer { margin-top: 40px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${pharmacyName}</h1>
            <p>Pharmacy Invoice</p>
          </div>
          <div class="bill-info">
            <p><strong>Bill Number:</strong> ${bill.billNumber}</p>
            <p><strong>Date:</strong> ${new Date(bill.date).toLocaleDateString()}</p>
            ${bill.customerName ? `<p><strong>Customer:</strong> ${bill.customerName}</p>` : ''}
          </div>
          <table>
            <thead>
              <tr>
                <th>Medicine Name</th>
                <th>Quantity</th>
                <th>Price/Unit</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${bill.items.map(item => `
                <tr>
                  <td>${item.medicineName}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.pricePerUnit.toFixed(2)}</td>
                  <td>₹${item.totalPrice.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="totals">
            <p>Subtotal: ₹${bill.subtotal.toFixed(2)}</p>
            <p>Tax (5%): ₹${bill.tax.toFixed(2)}</p>
            <p class="total">Total: ₹${bill.totalAmount.toFixed(2)}</p>
          </div>
          <div class="footer">
            <p>Thank you for your business!</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  const subtotal = calculateSubtotal();
  const tax = calculateTax(subtotal);
  const total = subtotal + tax;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Create Bill</h1>
        <p className="text-muted-foreground">Generate pharmacy bills for customers</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            New Bill
          </CardTitle>
          <CardDescription>Enter medicine details and customer information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="customerName">Customer Name (Optional)</Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
            />
          </div>

          <div className="space-y-4">
            <Label>Bill Items</Label>
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div>
                  <Label htmlFor={`medicine-${index}`}>Medicine Name</Label>
                  <Input
                    id={`medicine-${index}`}
                    value={item.medicineName}
                    onChange={(e) => updateItem(index, 'medicineName', e.target.value)}
                    placeholder="Medicine name"
                  />
                </div>
                <div>
                  <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <Label htmlFor={`price-${index}`}>Price/Unit (₹)</Label>
                  <Input
                    id={`price-${index}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.pricePerUnit}
                    onChange={(e) => updateItem(index, 'pricePerUnit', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 p-2 bg-muted rounded text-sm font-medium">
                    Total: ₹{(item.quantity * item.pricePerUnit).toFixed(2)}
                  </div>
                  {items.length > 1 && (
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <Button onClick={addItem} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (5%):</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          <Button onClick={createBill} className="w-full" size="lg">
            <Receipt className="h-4 w-4 mr-2" />
            Create Bill
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Bills</CardTitle>
          <CardDescription>View and print recent bills</CardDescription>
        </CardHeader>
        <CardContent>
          {bills.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No bills created yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill Number</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-medium">{bill.billNumber}</TableCell>
                    <TableCell>{new Date(bill.date).toLocaleDateString()}</TableCell>
                    <TableCell>{bill.customerName || 'Walk-in'}</TableCell>
                    <TableCell>{bill.items.length} item(s)</TableCell>
                    <TableCell>₹{bill.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => printBill(bill)}
                      >
                        <Printer className="h-4 w-4 mr-1" />
                        Print
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Billing;
