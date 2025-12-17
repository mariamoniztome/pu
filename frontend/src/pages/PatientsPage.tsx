import { useState, useEffect, useMemo } from 'react';
import { Plus, Grid3x3, Table as TableIcon, Search } from 'lucide-react';
import { toast } from 'sonner';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { patientsApi } from '../api';
import { Patient } from '../types/patient';
import { PatientForm } from '../components/PatientForm';
import { PatientCard } from '../components/PatientCard';

type ViewMode = 'grid' | 'table';

export function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await patientsApi.getAll();
      setPatients(data);
    } catch (error) {
      console.error('Failed to load patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadPatients();
      return;
    }
    try {
      const data = await patientsApi.search(searchQuery);
      setPatients(data);
      toast.success(`Found ${data.length} patient(s)`);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed');
    }
  };

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this patient?')) return;
    try {
      await patientsApi.delete(id);
      toast.success('Patient deleted successfully');
      loadPatients();
    } catch (error) {
      console.error('Failed to delete patient:', error);
      toast.error('Failed to delete patient');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedPatient(null);
    loadPatients();
  };

  const columnDefs: ColDef<Patient>[] = useMemo(() => [
    {
      headerName: 'Name',
      valueGetter: (params) => `${params.data?.firstName} ${params.data?.lastName}`,
      filter: true,
      sortable: true,
    },
    {
      field: 'dateOfBirth',
      headerName: 'Date of Birth',
      filter: 'agDateColumnFilter',
      sortable: true,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: 'gender',
      headerName: 'Gender',
      filter: true,
      sortable: true,
      valueFormatter: (params) => params.value.charAt(0).toUpperCase() + params.value.slice(1),
    },
    {
      field: 'email',
      headerName: 'Email',
      filter: true,
      sortable: true,
    },
    {
      field: 'phone',
      headerName: 'Phone',
      filter: true,
      sortable: true,
    },
    {
      headerName: 'Actions',
      cellRenderer: (params: any) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(params.data)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(params.data._id)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Delete
          </button>
        </div>
      ),
      sortable: false,
      filter: false,
    },
  ], []);

  const defaultColDef = useMemo(() => ({
    flex: 1,
    minWidth: 100,
    resizable: true,
  }), []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-slate-600">Loading patients...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Patients</h1>
          <p className="text-gray-500">Manage patient records</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-black hover:bg-gray-900 text-white rounded-full px-6">
          <Plus className="h-5 w-5 mr-2" />
          Add Patient
        </Button>
      </div>

      <div className="flex gap-4 items-center bg-white rounded-3xl p-4 shadow-sm">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search patients by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-11 rounded-2xl border-gray-200"
            />
          </div>
          <Button onClick={handleSearch} className="rounded-2xl bg-primary-500 hover:bg-primary-600 text-white">
            Search
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className={`rounded-2xl ${viewMode === 'grid' ? 'bg-gray-900 hover:bg-gray-800' : ''}`}
          >
            <Grid3x3 className="h-4 w-4 mr-2" />
            Grid
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
            className={`rounded-2xl ${viewMode === 'table' ? 'bg-gray-900 hover:bg-gray-800' : ''}`}
          >
            <TableIcon className="h-4 w-4 mr-2" />
            Table
          </Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((patient) => (
            <PatientCard
              key={patient._id}
              patient={patient}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Patient List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="ag-theme-alpine rounded-2xl overflow-hidden" style={{ height: 600, width: '100%' }}>
              <AgGridReact
                rowData={patients}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                pagination={true}
                paginationPageSize={20}
                enableCellTextSelection={true}
                ensureDomOrder={true}
              />
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-2xl"
                onClick={() => {
                  const csvData = patients.map(p => ({
                    Name: `${p.firstName} ${p.lastName}`,
                    'Date of Birth': new Date(p.dateOfBirth).toLocaleDateString(),
                    Gender: p.gender,
                    Email: p.email || '',
                    Phone: p.phone,
                  }));
                  const csv = [
                    Object.keys(csvData[0]).join(','),
                    ...csvData.map(row => Object.values(row).join(','))
                  ].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'patients.csv';
                  a.click();
                }}
              >
                Export to CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <PatientForm
        open={showForm}
        patient={selectedPatient}
        onClose={handleFormClose}
      />
    </div>
  );
}
