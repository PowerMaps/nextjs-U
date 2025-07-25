"use client";

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { useUserBookings, useCancelBooking } from '@/lib/api/hooks/booking-hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Zap, 
  DollarSign,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { BookingResponseDto } from '@/lib/api/types';

export default function BookingsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { data: bookingsData, isLoading, error } = useUserBookings({ 
    status: statusFilter || undefined 
  });
  const cancelBooking = useCancelBooking();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="h-4 w-4" />;
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'ACTIVE':
        return <Zap className="h-4 w-4" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  const canCancelBooking = (booking: BookingResponseDto) => {
    return ['PENDING', 'CONFIRMED'].includes(booking.status) && 
           new Date(booking.startTime) > new Date();
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await cancelBooking.mutateAsync({ bookingId });
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load bookings</h3>
            <p className="text-muted-foreground">Please try again later</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const bookings = bookingsData?.items || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Bookings</h1>
            <p className="text-muted-foreground">
              Manage your charging station reservations
            </p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={statusFilter === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('')}
          >
            All
          </Button>
          {['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
                <p className="text-muted-foreground">
                  {statusFilter 
                    ? `No ${statusFilter.toLowerCase()} bookings found`
                    : 'You haven\'t made any bookings yet'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {booking.connector.station.name}
                      </CardTitle>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-4 w-4" />
                        <span>{booking.connector.station.address}</span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      {getStatusIcon(booking.status)}
                      <span className="ml-1">{booking.status}</span>
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Connector Details */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <span className="font-medium">{booking.connector.type}</span>
                      <span className="text-sm text-muted-foreground">
                        {booking.connector.power}kW
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Booking Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">Start Time</span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">
                        {formatDateTime(booking.startTime)}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">End Time</span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">
                        {formatDateTime(booking.endTime)}
                      </p>
                    </div>
                  </div>

                  {booking.estimatedEnergyNeeded && (
                    <div>
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <Zap className="h-4 w-4" />
                        <span className="font-medium">Estimated Energy</span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">
                        {booking.estimatedEnergyNeeded} kWh
                      </p>
                    </div>
                  )}

                  {booking.totalCost && (
                    <div>
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium">Total Cost</span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">
                        ${booking.totalCost.toFixed(2)}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  {canCancelBooking(booking) && (
                    <div className="flex justify-end pt-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={cancelBooking.isPending}
                      >
                        {cancelBooking.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Cancel Booking
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}