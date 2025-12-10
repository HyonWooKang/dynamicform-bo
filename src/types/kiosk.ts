export type KioskPowerStatus = 'on' | 'off';

export type KioskNetworkStatus = '정상' | '주의' | '점검 필요';

export type KioskDevice = {
  id: string;
  kioskName: string;
  branchId: string;
  branchName: string;
  serialNumber: string;
  macAddress: string;
  powerStatus: KioskPowerStatus;
  softwareVersion: string;
  installedAt: string;
  lastMaintenance: string;
  lastHeartbeat: string;
  location: string;
  networkStatus: KioskNetworkStatus;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  temperature: number;
  uptimeHours: number;
  activeCampaigns: string[];
  peripherals: string[];
  notes?: string;
};

