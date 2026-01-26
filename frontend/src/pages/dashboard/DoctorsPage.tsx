import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../api/auth';
import type { Doctor, InviteDoctorData } from '../../types/auth';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import { toast } from 'sonner';

export const DoctorsPage: React.FC = () => {
  const { doctor: currentDoctor, organization } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteData, setInviteData] = useState<InviteDoctorData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    specialization: '',
    licenseNumber: '',
    role: 'member',
  });

  const canManageDoctors =
    currentDoctor?.role === 'owner' ||
    currentDoctor?.permissions.canManageDoctors;

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setIsLoading(true);
      const response = await authAPI.getDoctors();
      setDoctors(response.doctors);
    } catch (error) {
      toast.error('Failed to load doctors');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await authAPI.inviteDoctor(inviteData);
      toast.success('Doctor invited successfully!');
      setShowInviteDialog(false);
      setInviteData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        specialization: '',
        licenseNumber: '',
        role: 'member',
      });
      fetchDoctors();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to invite doctor');
      console.error(error);
    }
  };

  const handleDeactivate = async (doctorId: string) => {
    if (!confirm('Are you sure you want to deactivate this doctor?')) {
      return;
    }

    try {
      await authAPI.deleteDoctor(doctorId);
      toast.success('Doctor deactivated successfully');
      fetchDoctors();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to deactivate doctor');
      console.error(error);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doctors</h1>
          <p className="text-gray-600 mt-1">
            Manage doctors in {organization?.name}
          </p>
        </div>
        {canManageDoctors && (
          <Button onClick={() => setShowInviteDialog(true)}>
            Invite Doctor
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {doctors.map((doc) => (
          <Card key={doc._id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-xl font-semibold text-blue-600">
                      {doc.firstName[0]}
                      {doc.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {doc.firstName} {doc.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{doc.email}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                      doc.role
                    )}`}
                  >
                    {doc.role.charAt(0).toUpperCase() + doc.role.slice(1)}
                  </span>
                  {!doc.isActive && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Inactive
                    </span>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {doc.phone && (
                    <div>
                      <span className="text-gray-500">Phone:</span>
                      <p className="font-medium">{doc.phone}</p>
                    </div>
                  )}
                  {doc.specialization && (
                    <div>
                      <span className="text-gray-500">Specialization:</span>
                      <p className="font-medium">{doc.specialization}</p>
                    </div>
                  )}
                  {doc.licenseNumber && (
                    <div>
                      <span className="text-gray-500">License:</span>
                      <p className="font-medium">{doc.licenseNumber}</p>
                    </div>
                  )}
                  {doc.lastLogin && (
                    <div>
                      <span className="text-gray-500">Last Login:</span>
                      <p className="font-medium">
                        {new Date(doc.lastLogin).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <span className="text-sm text-gray-500">Permissions:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {doc.permissions.canManageOrganization && (
                      <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">
                        Manage Organization
                      </span>
                    )}
                    {doc.permissions.canManageDoctors && (
                      <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">
                        Manage Doctors
                      </span>
                    )}
                    {doc.permissions.canViewAllPatients && (
                      <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">
                        View All Patients
                      </span>
                    )}
                    {doc.permissions.canManageBilling && (
                      <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">
                        Manage Billing
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {canManageDoctors &&
                doc._id !== currentDoctor?._id &&
                doc.role !== 'owner' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeactivate(doc._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Deactivate
                  </Button>
                )}
            </div>
          </Card>
        ))}
      </div>

      {/* Invite Doctor Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>Invite New Doctor</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowInviteDialog(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <form onSubmit={handleInvite} className="space-y-4 px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  required
                  value={inviteData.firstName}
                  onChange={(e) =>
                    setInviteData({ ...inviteData, firstName: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="lastName">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  required
                  value={inviteData.lastName}
                  onChange={(e) =>
                    setInviteData({ ...inviteData, lastName: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={inviteData.email}
                  onChange={(e) =>
                    setInviteData({ ...inviteData, email: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={inviteData.password}
                  onChange={(e) =>
                    setInviteData({ ...inviteData, password: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={inviteData.phone}
                  onChange={(e) =>
                    setInviteData({ ...inviteData, phone: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  value={inviteData.specialization}
                  onChange={(e) =>
                    setInviteData({
                      ...inviteData,
                      specialization: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="licenseNumber">License Number</Label>
                <Input
                  id="licenseNumber"
                  value={inviteData.licenseNumber}
                  onChange={(e) =>
                    setInviteData({
                      ...inviteData,
                      licenseNumber: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>Role</Label>
                <Select
                  value={inviteData.role}
                  onValueChange={(value) =>
                    setInviteData({
                      ...inviteData,
                      role: value as 'admin' | 'member',
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowInviteDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Invite Doctor</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
