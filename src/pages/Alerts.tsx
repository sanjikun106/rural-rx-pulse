import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Check, X, Package, TrendingUp, Users, Info, CheckCircle } from 'lucide-react';
import { storage } from '@/lib/storage';
import { mockAlerts } from '@/data/mockData';
import { Alert } from '@/types';
import { useToast } from '@/hooks/use-toast';

const Alerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const storedAlerts = storage.getAlerts();
    if (storedAlerts.length === 0) {
      storage.setAlerts(mockAlerts);
      setAlerts(mockAlerts);
    } else {
      setAlerts(storedAlerts);
    }
  }, []);

  const unreadAlerts = alerts.filter(a => !a.read);
  const readAlerts = alerts.filter(a => a.read);

  const handleAccept = (alertId: string) => {
    const updatedAlerts = alerts.map(a =>
      a.id === alertId ? { ...a, read: true } : a
    );
    storage.setAlerts(updatedAlerts);
    setAlerts(updatedAlerts);

    toast({
      title: 'Alert Accepted',
      description: 'Recommendation accepted and added to action items',
    });
  };

  const handleDismiss = (alertId: string) => {
    const updatedAlerts = alerts.map(a =>
      a.id === alertId ? { ...a, read: true } : a
    );
    storage.setAlerts(updatedAlerts);
    setAlerts(updatedAlerts);

    toast({
      title: 'Alert Dismissed',
      description: 'Alert marked as read',
    });
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'low_stock':
        return Package;
      case 'outbreak':
        return TrendingUp;
      case 'request':
        return Users;
      default:
        return Info;
    }
  };

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'low_stock':
        return 'text-warning';
      case 'outbreak':
        return 'text-destructive';
      case 'request':
        return 'text-success';
      default:
        return 'text-primary';
    }
  };

  const getAlertBgColor = (type: Alert['type']) => {
    switch (type) {
      case 'low_stock':
        return 'bg-warning/10';
      case 'outbreak':
        return 'bg-destructive/10';
      case 'request':
        return 'bg-success/10';
      default:
        return 'bg-primary/10';
    }
  };

  const AlertCard = ({ alert, showActions = true }: { alert: Alert; showActions?: boolean }) => {
    const Icon = getAlertIcon(alert.type);
    const timeAgo = getTimeAgo(new Date(alert.timestamp));

    return (
      <Card className="shadow-soft hover:shadow-medium transition-shadow">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className={`flex-shrink-0 rounded-lg p-3 ${getAlertBgColor(alert.type)}`}>
              <Icon className={`h-6 w-6 ${getAlertColor(alert.type)}`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{alert.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{timeAgo}</p>
                </div>
                {alert.read && (
                  <Badge variant="outline" className="flex-shrink-0">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Read
                  </Badge>
                )}
              </div>

              <p className="text-foreground mb-4">{alert.message}</p>

              {alert.medicine && alert.recommendedQuantity && (
                <div className="p-3 rounded-lg bg-muted/50 mb-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Medicine</p>
                      <p className="font-medium">{alert.medicine}</p>
                    </div>
                    {alert.depletionDate && (
                      <div>
                        <p className="text-muted-foreground mb-1">Depletion Date</p>
                        <p className="font-medium">
                          {new Date(alert.depletionDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    <div className="col-span-2">
                      <p className="text-muted-foreground mb-1">Recommended Action</p>
                      <p className="font-medium">
                        Reorder {alert.recommendedQuantity} units
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {showActions && !alert.read && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleAccept(alert.id)}
                    className="flex-1"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDismiss(alert.id)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Dismiss
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Alerts & Notifications</h1>
        <p className="text-muted-foreground">Stay updated on stock levels and regional trends</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unread
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{unreadAlerts.length}</div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Critical
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {alerts.filter(a => a.type === 'low_stock' || a.type === 'outbreak').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unread Alerts */}
      {unreadAlerts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <h2 className="text-xl font-semibold">Unread Alerts</h2>
            <Badge variant="destructive">{unreadAlerts.length}</Badge>
          </div>
          <div className="space-y-3">
            {unreadAlerts.map(alert => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      )}

      {/* Read Alerts */}
      {readAlerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Read Alerts
          </h2>
          <div className="space-y-3">
            {readAlerts.map(alert => (
              <AlertCard key={alert.id} alert={alert} showActions={false} />
            ))}
          </div>
        </div>
      )}

      {alerts.length === 0 && (
        <Card className="shadow-soft">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Alerts</h3>
            <p className="text-muted-foreground text-center max-w-md">
              You're all caught up! Alerts will appear here when stock is low or regional
              trends require attention.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const getTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }

  return 'Just now';
};

export default Alerts;
