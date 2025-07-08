import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash, MapPin, Users, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useData } from '@/contexts/data/DataContext';

interface Area {
  id: string;
  name: string;
  code: string;
  description: string;
  customerCount: number;
  isActive: boolean;
  createdAt: string;
}

export default function AreaManagement() {
  const { customers } = useData();
  const [areas, setAreas] = useState<Area[]>([
    {
      id: '1',
      name: 'Central Delhi',
      code: 'CD',
      description: 'Central business district area',
      customerCount: 45,
      isActive: true,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'South Delhi',
      code: 'SD',
      description: 'Residential and commercial area',
      customerCount: 78,
      isActive: true,
      createdAt: '2024-01-10'
    },
    {
      id: '3',
      name: 'East Delhi',
      code: 'ED',
      description: 'Industrial and residential area',
      customerCount: 32,
      isActive: true,
      createdAt: '2024-01-05'
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  });

  const filteredAreas = areas.filter(area =>
    area.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    area.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateArea = () => {
    if (!formData.name || !formData.code) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingArea) {
      // Update existing area
      setAreas(areas.map(area => 
        area.id === editingArea.id 
          ? { ...area, ...formData }
          : area
      ));
      toast.success('Area updated successfully');
    } else {
      // Create new area
      const newArea: Area = {
        id: Date.now().toString(),
        name: formData.name,
        code: formData.code,
        description: formData.description,
        customerCount: 0,
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setAreas([...areas, newArea]);
      toast.success('Area created successfully');
    }

    setFormData({ name: '', code: '', description: '' });
    setEditingArea(null);
    setIsDialogOpen(false);
  };

  const handleEditArea = (area: Area) => {
    setEditingArea(area);
    setFormData({
      name: area.name,
      code: area.code,
      description: area.description
    });
    setIsDialogOpen(true);
  };

  const handleDeleteArea = (areaId: string) => {
    setAreas(areas.filter(area => area.id !== areaId));
    toast.success('Area deleted successfully');
  };

  const handleToggleStatus = (areaId: string) => {
    setAreas(areas.map(area => 
      area.id === areaId 
        ? { ...area, isActive: !area.isActive }
        : area
    ));
    toast.success('Area status updated');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient-aurora">
            Area Management
          </h1>
          <p className="text-muted-foreground">Manage delivery areas and customer zones</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="aurora-button" onClick={() => {
              setEditingArea(null);
              setFormData({ name: '', code: '', description: '' });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Area
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingArea ? 'Edit Area' : 'Create New Area'}
              </DialogTitle>
              <DialogDescription>
                {editingArea ? 'Update area information' : 'Add a new delivery area to your system'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Area Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter area name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Area Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  placeholder="Enter area code (e.g., CD, SD)"
                  maxLength={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter area description"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateArea} disabled={!formData.name || !formData.code}>
                  {editingArea ? 'Update' : 'Create'} Area
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="aurora-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Areas</p>
                <p className="text-2xl font-bold text-primary">{areas.length}</p>
              </div>
              <MapPin className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="aurora-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Areas</p>
                <p className="text-2xl font-bold text-green-500">{areas.filter(a => a.isActive).length}</p>
              </div>
              <MapPin className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="aurora-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold text-blue-500">{areas.reduce((sum, area) => sum + area.customerCount, 0)}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="aurora-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Customers/Area</p>
                <p className="text-2xl font-bold text-orange-500">
                  {areas.length > 0 ? Math.round(areas.reduce((sum, area) => sum + area.customerCount, 0) / areas.length) : 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="aurora-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Areas</CardTitle>
              <CardDescription>Manage your delivery areas and customer zones</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search areas..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table className="aurora-table">
            <TableHeader>
              <TableRow className="aurora-table-header">
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Customers</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAreas.map((area) => (
                <TableRow key={area.id} className="aurora-table-row">
                  <TableCell className="font-medium">{area.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{area.code}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{area.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="mr-1 h-4 w-4" />
                      {area.customerCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(area.id)}
                    >
                      <Badge variant={area.isActive ? "default" : "secondary"}>
                        {area.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditArea(area)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteArea(area.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}