import { useMemo } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { Appointment } from '../../types/appointment';

interface DashboardChartProps {
  appointments: Appointment[];
}

export function DashboardChart({ appointments }: DashboardChartProps) {
  const chartData = useMemo(() => {
    // Group appointments by type and count them
    const appointmentsByType: Record<string, number> = {
      initial: 0,
      'follow-up': 0,
      assessment: 0,
      therapy: 0,
      other: 0,
    };

    // Also get data by status for a second chart
    const appointmentsByStatus: Record<string, number> = {
      scheduled: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      'no-show': 0,
    };

    appointments.forEach((apt) => {
      appointmentsByType[apt.type]++;
      appointmentsByStatus[apt.status]++;
    });

    // Transform for nivo bar chart - showing both type and status
    return [
      {
        type: 'Initial',
        count: appointmentsByType.initial,
        countByStatus: appointmentsByStatus.completed,
      },
      {
        type: 'Follow-up',
        count: appointmentsByType['follow-up'],
        countByStatus: appointmentsByStatus.confirmed,
      },
      {
        type: 'Assessment',
        count: appointmentsByType.assessment,
        countByStatus: appointmentsByStatus.scheduled,
      },
      {
        type: 'Therapy',
        count: appointmentsByType.therapy,
        countByStatus: appointmentsByStatus.cancelled,
      },
      {
        type: 'Other',
        count: appointmentsByType.other,
        countByStatus: appointmentsByStatus['no-show'],
      },
    ];
  }, [appointments]);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '300px' }}>
      <ResponsiveBar
        data={chartData}
        keys={['count', 'countByStatus']}
        indexBy="type"
        margin={{ top: 20, right: 30, bottom: 20, left: 60 }}
        padding={0.3}
        colors={['#6366f1', '#8b5cf6']}
        borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Appointment Type',
          legendPosition: 'middle',
          legendOffset: 32,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Count',
          legendPosition: 'middle',
          legendOffset: -40,
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        legends={[
          {
            dataFrom: 'keys',
            anchor: 'bottom-right',
            direction: 'column',
            justify: false,
            translateX: 120,
            translateY: 0,
            itemsSpacing: 2,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: 'left-to-right',
            itemOpacity: 0.85,
            symbolSize: 20,
            effects: [
              {
                on: 'hover',
                style: {
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]}
        role="application"
        ariaLabel="Appointment statistics chart"
        tooltip={({ value, indexValue }) => (
          <div
            style={{
              background: '#ffffff',
              padding: '12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              color: '#333',
            }}
          >
            <strong>{indexValue}</strong>: {value}
          </div>
        )}
      />
    </div>
  );
}
