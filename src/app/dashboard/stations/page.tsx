"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    MapPin,
    Zap,
    Clock,
    Star,
    Search,
    Map as MapIcon,
    List,
    Navigation,
    Euro,
    Plus,
    Edit,
    Trash2,
    Loader2
} from 'lucide-react';
import { useUserStations, useUpdateStation, useDeleteStation } from '@/lib/api/hooks/user-station-hooks';
import { StationFormModal } from '@/components/stations/station-form-modal';
import Link from 'next/link';

export default function StationsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'occupied' | 'offline'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStation, setEditingStation] = useState<any>(null);

    // Get user stations only
    const { data: userStations = [], isLoading, error } = useUserStations();
    
    // Mutations for edit and delete
    const updateStationMutation = useUpdateStation();
    const deleteStationMutation = useDeleteStation();

    const filteredStations = userStations.filter(station => {
        const matchesSearch = station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            station.address?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter = filterStatus === 'all' ||
            (filterStatus === 'available' && station.isActive) ||
            (filterStatus === 'offline' && !station.isActive);

        return matchesSearch && matchesFilter;
    });

    const getStatusColor = (isActive: boolean) => {
        return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    };

    const getStatusText = (isActive: boolean) => {
        return isActive ? 'Available' : 'Offline';
    };

    const handleEditStation = (station: any) => {
        setEditingStation(station);
        setIsModalOpen(true);
    };

    const handleDeleteStation = async (stationId: string) => {
        if (window.confirm('Are you sure you want to delete this station? This action cannot be undone.')) {
            try {
                await deleteStationMutation.mutateAsync(stationId);
            } catch (error) {
                console.error('Error deleting station:', error);
            }
        }
    };

    const handleUpdateStation = async (data: any) => {
        try {
            await updateStationMutation.mutateAsync({
                id: editingStation.id,
                ...data
            });
            setIsModalOpen(false);
            setEditingStation(null);
        } catch (error) {
            console.error('Error updating station:', error);
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingStation(null);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Charging Stations</h1>
                    <p className="text-gray-600 mt-1">Find and manage EV charging stations</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                    >
                        <List className="h-4 w-4 mr-2" />
                        List
                    </Button>
                    <Button
                        variant={viewMode === 'map' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('map')}
                    >
                        <MapIcon className="h-4 w-4 mr-2" />
                        Map
                    </Button>
                    <Link href="/dashboard/stations/map">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Manage Stations
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Search and Filters */}
            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search stations by name or location..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="flex gap-2">
                            <Button
                                variant={filterStatus === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterStatus('all')}
                            >
                                All
                            </Button>
                            <Button
                                variant={filterStatus === 'available' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterStatus('available')}
                            >
                                Available
                            </Button>
                            <Button
                                variant={filterStatus === 'offline' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterStatus('offline')}
                            >
                                Offline
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Zap className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Stations</p>
                                <p className="text-2xl font-bold">{userStations.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Zap className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Available</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {userStations.filter(s => s.isActive).length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <Zap className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Offline</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {userStations.filter(s => !s.isActive).length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <MapPin className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">My Stations</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {filteredStations.length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Stations List */}
            {viewMode === 'list' && (
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-600 mt-2">Loading stations...</p>
                        </div>
                    ) : filteredStations.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No stations found</h3>
                                <p className="text-gray-600">Try adjusting your search or filters</p>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredStations.map((station) => (
                            <Card key={station.id} className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">{station.name}</h3>
                                                <Badge className={getStatusColor(station.isActive)}>
                                                    {getStatusText(station.isActive)}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-4 w-4" />
                                                    <span>{station.address || 'Address not available'}</span>
                                                </div>
                                                {station.connectors && (
                                                    <div className="flex items-center gap-1">
                                                        <Zap className="h-4 w-4" />
                                                        <span>{station.connectors.length} connectors</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-4 text-sm">
                                                {station.openingTime && station.closingTime ? (
                                                    <div className="flex items-center gap-1 text-gray-600">
                                                        <Clock className="h-4 w-4" />
                                                        <span>{station.openingTime} - {station.closingTime}</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1 text-green-600">
                                                        <Clock className="h-4 w-4" />
                                                        <span>24/7</span>
                                                    </div>
                                                )}
                                                {/* {station.rate && (
                                                    <div className="flex items-center gap-1 text-yellow-600">
                                                        <Star className="h-4 w-4 fill-current" />
                                                        <span>{station.rate.toFixed(1)}</span>
                                                    </div>
                                                )} */}
                                                {station.connectors && station.connectors.length > 0 && (
                                                    <div className="flex items-center gap-1 text-gray-600">
                                                        <Euro className="h-4 w-4" />
                                                        <span>{Math.min(...station.connectors.map(c => c.pricePerKwh)).toFixed(2)}-{Math.max(...station.connectors.map(c => c.pricePerKwh)).toFixed(2)}/kWh</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 ml-4">
                                            <div className="flex gap-2">
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => handleEditStation(station)}
                                                    disabled={updateStationMutation.isPending}
                                                >
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => handleDeleteStation(station.id)}
                                                    disabled={deleteStationMutation.isPending}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    {deleteStationMutation.isPending ? (
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                    )}
                                                    Delete
                                                </Button>
                                            </div>
                                          
                                        </div>
                                    </div>

                                    {/* Connectors */}
                                    {station.connectors && station.connectors.length > 0 && (
                                        <div className="mt-4 pt-4 border-t">
                                            <p className="text-sm font-medium text-gray-700 mb-2">Available Connectors:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {station.connectors.map((connector, index) => (
                                                    <Badge key={index} variant="outline" className="text-xs">
                                                        {connector.type} - {connector.powerOutput}kW
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}

            {/* Map View Placeholder */}
            {viewMode === 'map' && (
                <Card>
                    <CardContent className="p-8 text-center">
                        <MapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Map View</h3>
                        <p className="text-gray-600 mb-4">Interactive map view coming soon</p>
                        <Button onClick={() => setViewMode('list')}>
                            Back to List View
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Floating Action Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <Link href="/dashboard/map">
                    <Button size="lg" className="rounded-full shadow-lg bg-blue-600 hover:bg-blue-700">
                        <MapIcon className="h-5 w-5 mr-2" />
                        Open Map
                    </Button>
                </Link>
            </div>

            {/* Station Form Modal */}
            <StationFormModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onSubmit={handleUpdateStation}
                onDelete={() => handleDeleteStation(editingStation?.id)}
                initialData={editingStation}
                isEditing={!!editingStation}
                isLoading={updateStationMutation.isPending}
                isDeleting={deleteStationMutation.isPending}
            />
        </div>
    );
}