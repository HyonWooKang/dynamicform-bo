import type { DataBoardColumn } from '@/components/data-board/DataBoard';
import { Badge } from '@/components/ui/badge';
import type { KioskDevice } from '@/types/kiosk';

export const createKioskColumns = (
  onSelect: (kiosk: KioskDevice) => void,
): DataBoardColumn<KioskDevice>[] => [
  {
    key: 'kioskName',
    header: '키오스크명',
    render: (row) => (
      <button
        type="button"
        onClick={() => onSelect(row)}
        className="text-left"
      >
        <p className="font-semibold text-indigo-600 underline-offset-2 hover:underline">
          {row.kioskName}
        </p>
        <p className="text-xs text-gray-500">
          {row.branchName} · {row.location}
        </p>
      </button>
    ),
  },
  {
    key: 'serialNumber',
    header: 'Serial Number',
    render: (row) => (
      <div>
        <p className="font-mono text-sm text-gray-900">{row.serialNumber}</p>
        <p className="text-xs text-gray-500">{row.branchId}</p>
      </div>
    ),
  },
  {
    key: 'macAddress',
    header: 'MacAddress',
    render: (row) => (
      <span className="font-mono text-xs tracking-wide text-gray-700">
        {row.macAddress}
      </span>
    ),
  },
  {
    key: 'powerStatus',
    header: '전원 On/Off',
    render: (row) => (
      <Badge
        variant={row.powerStatus === 'on' ? 'secondary' : 'destructive'}
        className={
          row.powerStatus === 'on'
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-red-100 text-red-700'
        }
      >
        {row.powerStatus === 'on' ? 'ON' : 'OFF'}
      </Badge>
    ),
  },
  {
    key: 'softwareVersion',
    header: 'SW Version',
    render: (row) => (
      <div>
        <p className="text-sm font-semibold text-gray-900">{row.softwareVersion}</p>
        <p className="text-xs text-gray-500">점검 {row.lastMaintenance}</p>
      </div>
    ),
  },
  {
    key: 'installedAt',
    header: '설치일',
    render: (row) => (
      <div className="text-sm text-gray-700">
        <p>{row.installedAt}</p>
        <p className="text-xs text-gray-500">업타임 {row.uptimeHours.toLocaleString()}h</p>
      </div>
    ),
  },
];

