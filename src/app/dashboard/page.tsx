"use client";

import React from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { useVehicles } from '@/lib/api/hooks/vehicle-hooks';
import { useWallet, useWalletTransactions } from '@/lib/api/hooks/wallet-hooks';
import { useSavedRoutes } from '@/lib/api/hooks/routing-hooks';
import { useChargingStations } from '@/lib/api/hooks/station-hooks';
import { useNotifications } from '@/lib/api/hooks/notification-hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Car, 
  Wallet, 
  Route, 
  Zap, 
  Bell, 
  TrendingUp, 
  MapPin,
  Battery,
  Clock,
  Euro
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  // API hooks for dashboard data
  const { data: vehicles, isLoading: vehiclesLoading } = useVehicles();
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { data: transactions } = useWalletTransactions({ limit: 5 });
  const { data: savedRoutes } = useSavedRoutes();
  const { data: stationsData } = useChargingStations({ limit: 10 });
  const { data: notifications } = useNotifications({ limit: 5 });

  // Calculate dashboard metrics
  const totalVehicles = vehicles?.length || 0;
  const walletBalance = wallet?.balance || 0;
  const totalSavedRoutes = savedRoutes?.length || 0;
  const unreadNotifications = notifications?.items?.filter(n => !n.read).length || 0;
  const nearbyStations = stationsData?.items?.filter(s => s.status === 'OPERATIONAL').length || 0;

  // Recent activity from transactions
  const recentTransactions = transactions?.items || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your electric vehicle journey.
          </p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Vehicles Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Vehicles</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalVehicles}</div>
              <p className="text-xs text-muted-foreground">
                {vehiclesLoading ? 'Loading...' : 'Registered vehicles'}
              </p>
            </CardContent>
          </Card>

          {/* Wallet Balance Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {walletLoading ? '...' : `€${walletBalance.toFixed(2)}`}
              </div>
              <p className="text-xs text-muted-foreground">
                Available balance
              </p>
            </CardContent>
          </Card>

          {/* Saved Routes Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saved Routes</CardTitle>
              <Route className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSavedRoutes}</div>
              <p className="text-xs text-muted-foreground">
                Your favorite routes
              </p>
            </CardContent>
          </Card>

          {/* Notifications Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notifications</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unreadNotifications}</div>
              <p className="text-xs text-muted-foreground">
                Unread notifications
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentTransactions.length > 0 ? (
                  <div className="space-y-3">
                    {recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            transaction.type === 'DEPOSIT' ? 'bg-green-100 text-green-600' :
                            transaction.type === 'PAYMENT' ? 'bg-red-100 text-red-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            <Euro className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium">{transaction.description}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium ${
                            transaction.type === 'DEPOSIT' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'DEPOSIT' ? '+' : '-'}€{Math.abs(transaction.amount).toFixed(2)}
                          </div>
                          <Badge variant={
                            transaction.status === 'COMPLETED' ? 'default' :
                            transaction.status === 'PENDING' ? 'secondary' : 'destructive'
                          }>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent transactions
                  </div>
                )}
              </CardContent>
            </Card>

            {/* My Vehicles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  My Vehicles
                </CardTitle>
              </CardHeader>
              <CardContent>
                {vehicles && vehicles.length > 0 ? (
                  <div className="space-y-3">
                    {vehicles.slice(0, 3).map((vehicle) => (
                      <div key={vehicle.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                            <Car className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {vehicle.nickname || `${vehicle.make} ${vehicle.model}`}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {vehicle.year} • {vehicle.connectorType}
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Battery className="h-3 w-3" />
                            {vehicle.batteryCapacity} kWh
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {vehicle.range} km
                          </div>
                        </div>
                      </div>
                    ))}
                    {vehicles.length > 3 && (
                      <div className="text-center pt-2">
                        <Link href="/dashboard/vehicles">
                          <Button variant="outline" size="sm">
                            View All Vehicles ({vehicles.length})
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No vehicles registered yet</p>
                    <Link href="/dashboard/vehicles">
                      <Button>Add Your First Vehicle</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard/map">
                  <Button className="w-full justify-start" variant="outline">
                    <MapPin className="h-4 w-4 mr-2" />
                    Plan Route
                  </Button>
                </Link>
                <Link href="/dashboard/vehicles">
                  <Button className="w-full justify-start" variant="outline">
                    <Car className="h-4 w-4 mr-2" />
                    Manage Vehicles
                  </Button>
                </Link>
                <Link href="/dashboard/wallet">
                  <Button className="w-full justify-start" variant="outline">
                    <Wallet className="h-4 w-4 mr-2" />
                    Top Up Wallet
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Nearby Stations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Charging Stations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{nearbyStations}</div>
                  <p className="text-sm text-muted-foreground">Operational stations nearby</p>
                  <Link href="/dashboard/map">
                    <Button variant="outline" size="sm" className="mt-3">
                      Find Stations
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Recent Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notifications && notifications.items.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.items.slice(0, 3).map((notification) => (
                      <div key={notification.id} className="p-2 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{notification.title}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {notification.message}
                            </div>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-1"></div>
                          )}
                        </div>
                      </div>
                    ))}
                    <Link href="/dashboard/notifications">
                      <Button variant="outline" size="sm" className="w-full">
                        View All Notifications
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No recent notifications
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}