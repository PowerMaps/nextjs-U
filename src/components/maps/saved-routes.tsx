"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Bookmark, 
  Clock, 
  DollarSign, 
  MapPin, 
  Trash2, 
  Edit3,
  Search,
  Calendar,
  Route,
  Star
} from 'lucide-react';

interface SavedRoute {
  id: string;
  name: string;
  origin: string;
  destination: string;
  analysis: {
    totalDistance: number;
    totalTime: number;
    estimatedCost: number;
    chargingTime: number;
  };
  chargingStations: any[];
  savedAt: string;
  lastUsed?: string;
  useCount: number;
  tags: string[];
  isFavorite: boolean;
}

interface SavedRoutesProps {
  onSelectRoute: (route: SavedRoute) => void;
  onDeleteRoute: (routeId: string) => void;
  onEditRoute: (routeId: string, newName: string) => void;
  onToggleFavorite: (routeId: string) => void;
}

const SAVED_ROUTES_KEY = 'saved_routes';

export function SavedRoutes({ 
  onSelectRoute, 
  onDeleteRoute, 
  onEditRoute, 
  onToggleFavorite 
}: SavedRoutesProps) {
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'usage'>('date');

  // Load saved routes from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SAVED_ROUTES_KEY);
      if (saved) {
        try {
          setSavedRoutes(JSON.parse(saved));
        } catch (error) {
          console.error('Error parsing saved routes:', error);
        }
      }
    }
  }, []);

  // Save routes to localStorage
  const saveToStorage = (routes: SavedRoute[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SAVED_ROUTES_KEY, JSON.stringify(routes));
    }
  };

  const handleDeleteRoute = (routeId: string) => {
    const updatedRoutes = savedRoutes.filter(route => route.id !== routeId);
    setSavedRoutes(updatedRoutes);
    saveToStorage(updatedRoutes);
    onDeleteRoute(routeId);
  };

  const handleEditRoute = (routeId: string) => {
    if (editingName.trim()) {
      const updatedRoutes = savedRoutes.map(route =>
        route.id === routeId ? { ...route, name: editingName.trim() } : route
      );
      setSavedRoutes(updatedRoutes);
      saveToStorage(updatedRoutes);
      onEditRoute(routeId, editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  };

  const handleToggleFavorite = (routeId: string) => {
    const updatedRoutes = savedRoutes.map(route =>
      route.id === routeId ? { ...route, isFavorite: !route.isFavorite } : route
    );
    setSavedRoutes(updatedRoutes);
    saveToStorage(updatedRoutes);
    onToggleFavorite(routeId);
  };

  const handleSelectRoute = (route: SavedRoute) => {
    // Update usage count and last used
    const updatedRoutes = savedRoutes.map(r =>
      r.id === route.id 
        ? { ...r, useCount: r.useCount + 1, lastUsed: new Date().toISOString() }
        : r
    );
    setSavedRoutes(updatedRoutes);
    saveToStorage(updatedRoutes);
    onSelectRoute(route);
  };

  const startEditing = (route: SavedRoute) => {
    setEditingId(route.id);
    setEditingName(route.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName('');
  };

  // Filter and sort routes
  const filteredRoutes = savedRoutes
    .filter(route => 
      route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.destination.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
        case 'usage':
          return b.useCount - a.useCount;
        default:
          return 0;
      }
    });

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (savedRoutes.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <Bookmark className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No saved routes yet</p>
          <p className="text-sm">Save routes from the route planner to access them quickly</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bookmark className="h-5 w-5" />
          Saved Routes ({savedRoutes.length})
        </CardTitle>
        
        {/* Search and Sort Controls */}
        <div className="flex gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search routes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'usage')}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="usage">Sort by Usage</option>
          </select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {filteredRoutes.map((route) => (
            <Card key={route.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {editingId === route.id ? (
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleEditRoute(route.id);
                            if (e.key === 'Escape') cancelEditing();
                          }}
                          autoFocus
                        />
                        <Button size="sm" onClick={() => handleEditRoute(route.id)}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEditing}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold flex items-center gap-2">
                          {route.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                          {route.name}
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(route)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    
                    <div className="text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1 mb-1">
                        <MapPin className="h-3 w-3 text-green-600" />
                        <span>{route.origin}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-red-600" />
                        <span>{route.destination}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Route className="h-3 w-3 text-blue-600" />
                        <span>{route.analysis.totalDistance} km</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-green-600" />
                        <span>{formatTime(route.analysis.totalTime)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-yellow-600" />
                        <span>${route.analysis.estimatedCost.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Saved {formatDate(route.savedAt)}</span>
                      </div>
                      <div>Used {route.useCount} times</div>
                      {route.lastUsed && (
                        <div>Last used {formatDate(route.lastUsed)}</div>
                      )}
                    </div>
                    
                    {route.tags.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {route.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleFavorite(route.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Star className={`h-4 w-4 ${route.isFavorite ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRoute(route.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-4 pt-3 border-t">
                  <div className="text-sm text-muted-foreground">
                    {route.chargingStations.length} charging stops
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleSelectRoute(route)}
                  >
                    Use Route
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {filteredRoutes.length === 0 && searchTerm && (
          <div className="text-center text-muted-foreground py-8">
            No routes found matching "{searchTerm}"
          </div>
        )}
      </CardContent>
    </Card>
  );
}