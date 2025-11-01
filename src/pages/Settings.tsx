import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings as SettingsIcon, Download, Upload, Globe, Database } from 'lucide-react';
import { storage } from '@/lib/storage';
import { mockMedicines, mockAlerts } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Settings = () => {
  const [pharmacyName, setPharmacyName] = useState('');
  const [language, setLanguage] = useState('en');
  const { toast } = useToast();

  useEffect(() => {
    setPharmacyName(storage.getPharmacyName());
    setLanguage(storage.getLanguage());
  }, []);

  const handleSaveSettings = () => {
    storage.setPharmacyName(pharmacyName);
    storage.setLanguage(language);

    toast({
      title: 'Settings Saved',
      description: 'Your preferences have been updated',
    });
  };

  const handleResetData = () => {
    storage.setInventory(mockMedicines);
    storage.setAlerts(mockAlerts);

    toast({
      title: 'Data Reset',
      description: 'Demo data has been restored',
    });
  };

  const handleExportData = () => {
    const data = {
      inventory: storage.getInventory(),
      alerts: storage.getAlerts(),
      settings: {
        pharmacyName: storage.getPharmacyName(),
        language: storage.getLanguage(),
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medilink-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Data Exported',
      description: 'Backup file downloaded successfully',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your pharmacy preferences and data</p>
      </div>

      {/* Pharmacy Details */}
      <Card className="shadow-medium">
        <CardHeader>
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-primary" />
            <CardTitle>Pharmacy Details</CardTitle>
          </div>
          <CardDescription>Update your pharmacy information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pharmacy-name">Pharmacy Name</Label>
            <Input
              id="pharmacy-name"
              value={pharmacyName}
              onChange={(e) => setPharmacyName(e.target.value)}
              placeholder="Enter pharmacy name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Preferred Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                <SelectItem value="mr">मराठी (Marathi)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSaveSettings} className="w-full">
            Save Settings
          </Button>
        </CardContent>
      </Card>

      {/* Language Support */}
      <Card className="shadow-medium">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle>Multilingual Support</CardTitle>
          </div>
          <CardDescription>Available languages for the interface</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="font-medium">English</p>
                <p className="text-sm text-muted-foreground">Default interface language</p>
              </div>
              <Button variant="outline" size="sm">Active</Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="font-medium">हिंदी (Hindi)</p>
                <p className="text-sm text-muted-foreground">Coming soon</p>
              </div>
              <Button variant="outline" size="sm" disabled>Preview</Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="font-medium">मराठी (Marathi)</p>
                <p className="text-sm text-muted-foreground">Coming soon</p>
              </div>
              <Button variant="outline" size="sm" disabled>Preview</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="shadow-medium">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle>Data Management</CardTitle>
          </div>
          <CardDescription>Backup, restore, and manage your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleExportData}
          >
            <Download className="h-4 w-4" />
            Export All Data (JSON)
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleResetData}
          >
            <Upload className="h-4 w-4" />
            Reset to Demo Data
          </Button>

          <div className="p-4 rounded-lg bg-muted/50 mt-4">
            <h4 className="font-semibold mb-2">About Data Storage</h4>
            <p className="text-sm text-muted-foreground">
              All data is stored locally in your browser using localStorage. This is a demo
              application, so data persists only on this device. For production use, data
              would be synced to a secure cloud backend.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>About MediLink AI</CardTitle>
          <CardDescription>Smart Rural Pharmacy Network MVP</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            Version 1.0.0 (Demo)
          </p>
          <p className="text-muted-foreground">
            Built with React, TypeScript, and Tailwind CSS
          </p>
          <p className="text-muted-foreground">
            Features: Inventory Management, Demand Forecasting, Pharmacy Network, Alert System
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
