
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, HardDrive, Monitor, Smartphone, Package, Trash2, Download } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Asset {
  id: string;
  name: string;
  type: 'Hardware' | 'Software' | 'Mobile' | 'Network' | 'Other';
  category: string;
  serialNumber?: string;
  purchaseDate: string;
  warranty?: string;
  status: 'Active' | 'Inactive' | 'Retired' | 'Maintenance';
  assignedTo?: string;
  location: string;
  cost: string;
  vendor: string;
  notes?: string;
}

const AssetManagement = () => {
  const { toast } = useToast();
  
  const [assets, setAssets] = useState<Asset[]>([
    {
      id: '1',
      name: 'Dell OptiPlex 7090',
      type: 'Hardware',
      category: 'Desktop Computer',
      serialNumber: 'D7090-12345',
      purchaseDate: '2024-01-15',
      warranty: '2027-01-15',
      status: 'Active',
      assignedTo: 'John Doe - Finance',
      location: 'Office Floor 2',
      cost: '$1,200',
      vendor: 'Dell Technologies',
      notes: 'Standard office workstation with additional RAM upgrade',
    },
    {
      id: '2',
      name: 'Microsoft Office 365 Business',
      type: 'Software',
      category: 'Productivity Suite',
      purchaseDate: '2024-01-01',
      status: 'Active',
      assignedTo: 'All Staff',
      location: 'Cloud-based',
      cost: '$12.50/month per user',
      vendor: 'Microsoft Corporation',
      notes: '50 user licenses, annual subscription',
    },
    {
      id: '3',
      name: 'iPhone 14 Pro',
      type: 'Mobile',
      category: 'Mobile Device',
      serialNumber: 'IP14-67890',
      purchaseDate: '2024-03-10',
      warranty: '2025-03-10',
      status: 'Active',
      assignedTo: 'Jane Smith - Sales',
      location: 'Mobile',
      cost: '$999',
      vendor: 'Apple Inc.',
      notes: 'Company phone for sales team',
    },
  ]);

  const [retiredAssets, setRetiredAssets] = useState<Asset[]>([
    {
      id: 'r1',
      name: 'HP LaserJet 4000',
      type: 'Hardware',
      category: 'Printer',
      serialNumber: 'HP4000-54321',
      purchaseDate: '2019-05-20',
      status: 'Retired',
      location: 'Storage Room',
      cost: '$800',
      vendor: 'HP Inc.',
      notes: 'Replaced due to frequent paper jams, parts no longer available',
    },
  ]);

  const [showAssetForm, setShowAssetForm] = useState(false);
  const [assetForm, setAssetForm] = useState({
    name: '',
    type: 'Hardware' as const,
    category: '',
    serialNumber: '',
    purchaseDate: '',
    warranty: '',
    assignedTo: '',
    location: '',
    cost: '',
    vendor: '',
    notes: '',
  });

  const handleAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAsset: Asset = {
      id: Date.now().toString(),
      ...assetForm,
      status: 'Active',
    };
    setAssets([newAsset, ...assets]);
    setAssetForm({
      name: '',
      type: 'Hardware',
      category: '',
      serialNumber: '',
      purchaseDate: '',
      warranty: '',
      assignedTo: '',
      location: '',
      cost: '',
      vendor: '',
      notes: '',
    });
    setShowAssetForm(false);
    toast({
      title: "Asset Added",
      description: "New asset has been successfully added to inventory.",
    });
  };

  const updateAssetStatus = (id: string, status: Asset['status']) => {
    if (status === 'Retired') {
      const assetToRetire = assets.find(asset => asset.id === id);
      if (assetToRetire) {
        setRetiredAssets([{ ...assetToRetire, status }, ...retiredAssets]);
        setAssets(assets.filter(asset => asset.id !== id));
        toast({
          title: "Asset Retired",
          description: "Asset has been moved to retired inventory.",
        });
      }
    } else {
      setAssets(assets.map(asset => 
        asset.id === id ? { ...asset, status } : asset
      ));
      toast({
        title: "Status Updated",
        description: `Asset status changed to ${status}.`,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      case 'Retired': return 'bg-red-100 text-red-800';
      case 'Maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Hardware': return <HardDrive className="h-4 w-4" />;
      case 'Software': return <Package className="h-4 w-4" />;
      case 'Mobile': return <Smartphone className="h-4 w-4" />;
      case 'Network': return <Monitor className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const assetStats = {
    totalAssets: assets.length,
    activeAssets: assets.filter(a => a.status === 'Active').length,
    retiredAssets: retiredAssets.length,
    maintenanceAssets: assets.filter(a => a.status === 'Maintenance').length,
  };

  return (
    <div className="space-y-6">
      {/* Asset Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assets</p>
                <p className="text-2xl font-bold text-blue-600">{assetStats.totalAssets}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Assets</p>
                <p className="text-2xl font-bold text-green-600">{assetStats.activeAssets}</p>
              </div>
              <HardDrive className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Maintenance</p>
                <p className="text-2xl font-bold text-yellow-600">{assetStats.maintenanceAssets}</p>
              </div>
              <Monitor className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Retired Assets</p>
                <p className="text-2xl font-bold text-red-600">{assetStats.retiredAssets}</p>
              </div>
              <Trash2 className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Asset Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Asset Inventory</h2>
        <Button onClick={() => setShowAssetForm(!showAssetForm)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Asset
        </Button>
      </div>

      {/* Asset Form */}
      {showAssetForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Asset</CardTitle>
            <CardDescription>Register a new hardware or software asset</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAssetSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Asset Name</Label>
                  <Input
                    id="name"
                    value={assetForm.name}
                    onChange={(e) => setAssetForm({...assetForm, name: e.target.value})}
                    placeholder="e.g., Dell OptiPlex 7090"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Asset Type</Label>
                  <Select value={assetForm.type} onValueChange={(value) => setAssetForm({...assetForm, type: value as any})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hardware">Hardware</SelectItem>
                      <SelectItem value="Software">Software</SelectItem>
                      <SelectItem value="Mobile">Mobile Device</SelectItem>
                      <SelectItem value="Network">Network Equipment</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={assetForm.category}
                    onChange={(e) => setAssetForm({...assetForm, category: e.target.value})}
                    placeholder="e.g., Desktop Computer, Printer"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serialNumber">Serial Number</Label>
                  <Input
                    id="serialNumber"
                    value={assetForm.serialNumber}
                    onChange={(e) => setAssetForm({...assetForm, serialNumber: e.target.value})}
                    placeholder="Asset serial number (if applicable)"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchaseDate">Purchase Date</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={assetForm.purchaseDate}
                    onChange={(e) => setAssetForm({...assetForm, purchaseDate: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warranty">Warranty Expiry</Label>
                  <Input
                    id="warranty"
                    type="date"
                    value={assetForm.warranty}
                    onChange={(e) => setAssetForm({...assetForm, warranty: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <Input
                    id="assignedTo"
                    value={assetForm.assignedTo}
                    onChange={(e) => setAssetForm({...assetForm, assignedTo: e.target.value})}
                    placeholder="e.g., John Doe - Finance"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={assetForm.location}
                    onChange={(e) => setAssetForm({...assetForm, location: e.target.value})}
                    placeholder="e.g., Office Floor 2, Room 201"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cost">Purchase Cost</Label>
                  <Input
                    id="cost"
                    value={assetForm.cost}
                    onChange={(e) => setAssetForm({...assetForm, cost: e.target.value})}
                    placeholder="e.g., $1,200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vendor">Vendor</Label>
                  <Input
                    id="vendor"
                    value={assetForm.vendor}
                    onChange={(e) => setAssetForm({...assetForm, vendor: e.target.value})}
                    placeholder="e.g., Dell Technologies"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={assetForm.notes}
                  onChange={(e) => setAssetForm({...assetForm, notes: e.target.value})}
                  placeholder="Additional notes about the asset"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Add Asset</Button>
                <Button type="button" variant="outline" onClick={() => setShowAssetForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Assets List */}
      <div className="space-y-4">
        {assets.map((asset) => (
          <Card key={asset.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {getTypeIcon(asset.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{asset.name}</h3>
                      <Badge variant="outline">{asset.type}</Badge>
                      <Badge variant="outline">{asset.category}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="space-y-1">
                        {asset.serialNumber && <p><strong>Serial:</strong> {asset.serialNumber}</p>}
                        <p><strong>Purchase Date:</strong> {asset.purchaseDate}</p>
                        {asset.warranty && <p><strong>Warranty:</strong> {asset.warranty}</p>}
                        <p><strong>Cost:</strong> {asset.cost}</p>
                      </div>
                      <div className="space-y-1">
                        {asset.assignedTo && <p><strong>Assigned To:</strong> {asset.assignedTo}</p>}
                        <p><strong>Location:</strong> {asset.location}</p>
                        <p><strong>Vendor:</strong> {asset.vendor}</p>
                      </div>
                    </div>
                    {asset.notes && (
                      <p className="text-sm text-gray-600 mt-2"><strong>Notes:</strong> {asset.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(asset.status)}>
                    {asset.status}
                  </Badge>
                  <Select value={asset.status} onValueChange={(value) => updateAssetStatus(asset.id, value as any)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Retired Assets Section */}
      {retiredAssets.length > 0 && (
        <>
          <div className="flex items-center gap-2 mt-8">
            <Trash2 className="h-5 w-5 text-red-600" />
            <h2 className="text-xl font-semibold">Retired Assets</h2>
          </div>
          <div className="space-y-4">
            {retiredAssets.map((asset) => (
              <Card key={asset.id} className="border-red-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-2 bg-red-100 rounded-lg">
                        {getTypeIcon(asset.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{asset.name}</h3>
                          <Badge variant="outline">{asset.category}</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p><strong>Purchase Date:</strong> {asset.purchaseDate}</p>
                          <p><strong>Location:</strong> {asset.location}</p>
                          {asset.notes && <p><strong>Notes:</strong> {asset.notes}</p>}
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(asset.status)}>
                      {asset.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AssetManagement;
