import { useState, useEffect, useMemo } from 'react';
import { Plus, Grid3x3, Table as TableIcon, Search, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { patientsApi } from '../../api';
import { Patient } from '../../types/patient';
import { PatientForm } from '../../components/patients/PatientForm';
import { PatientCard } from '../../components/patients/PatientCard';
import { useTranslation } from '../../hooks/useTranslation';
import { PageHeaderAction } from '../../components/PageHeaderAction';

ModuleRegistry.registerModules([AllCommunityModule]);

type ViewMode = 'grid' | 'table';

export function PatientsPage() {
  const { t } = useTranslation();
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
      setPatients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load patients:', error);
      toast.error(t('patients.failedToLoad'));
      setPatients([]);
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
      const results = Array.isArray(data) ? data : [];
      setPatients(results);
      toast.success(t('patients.foundPatients', { count: results.length }));
    } catch (error) {
      console.error('Search failed:', error);
      toast.error(t('patients.searchFailed'));
      setPatients([]);
    }
  };

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('patients.confirmDelete'))) return;
    try {
      await patientsApi.delete(id);
      toast.success(t('patients.deletedSuccessfully'));
      loadPatients();
    } catch (error) {
      console.error('Failed to delete patient:', error);
      toast.error(t('patients.failedToDelete'));
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedPatient(null);
    loadPatients();
  };

  const columnDefs: ColDef<Patient>[] = useMemo(() => [
    {
      headerName: t('patients.columns.name'),
      valueGetter: (params) => `${params.data?.firstName} ${params.data?.lastName}`,
      filter: true,
      sortable: true,
    },
    {
      field: 'dateOfBirth',
      headerName: t('patients.columns.dateOfBirth'),
      filter: 'agDateColumnFilter',
      sortable: true,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: 'gender',
      headerName: t('patients.columns.gender'),
      filter: true,
      sortable: true,
      valueFormatter: (params) => params.value.charAt(0).toUpperCase() + params.value.slice(1),
    },
    {
      field: 'email',
      headerName: t('patients.columns.email'),
      filter: true,
      sortable: true,
    },
    {
      field: 'phone',
      headerName: t('patients.columns.phone'),
      filter: true,
      sortable: true,
    },
    {
      headerName: t('patients.columns.actions'),
      cellRenderer: (params: any) => (
        <div className="flex gap-2 items-center">
          <button
            className='mt-2'
            title={t('common.edit')}
            onClick={() => handleEdit(params.data)}
          >
            <Edit className="h-4 w-4 mr-1 text-lilac-600 hover:text-lilac-800" />
          </button>
          <button
            className='mt-2'
            title={t('common.delete')}
            onClick={() => handleDelete(params.data._id)}
          >
            <Trash2 className="h-4 w-4 mr-1 text-red-500 hover:text-red-700" />
            
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
        <div className="text-lg text-slate-600">{t('patients.loadingPatients')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeaderAction>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-5 w-5 mr-2" />
          {t('patients.addPatient')}
        </Button>
      </PageHeaderAction>

      <div className="flex gap-4 items-center bg-white rounded-3xl p-4 shadow-sm">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t('patients.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-11 rounded-2xl border-gray-200"
            />
          </div>
          <Button onClick={handleSearch}>
            {t('common.search')}
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3x3 className="h-4 w-4 mr-2" />
            {t('common.grid')}
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <TableIcon className="h-4 w-4 mr-2" />
            {t('common.table')}
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
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-gray-900">{t('patients.listTitle')}</CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="rounded-2xl"
              onClick={() => {
                const csvData = patients.map(p => ({
                  [t('patients.columns.name')]: `${p.firstName} ${p.lastName}`,
                  [t('patients.columns.dateOfBirth')]: new Date(p.dateOfBirth).toLocaleDateString(),
                  [t('patients.columns.gender')]: p.gender,
                  [t('patients.columns.email')]: p.email || '',
                  [t('patients.columns.phone')]: p.phone,
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
              {t('patients.exportCsv')}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="ag-theme-alpine rounded-lg overflow-hidden" style={{ height: 600, width: '100%' }}>
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
