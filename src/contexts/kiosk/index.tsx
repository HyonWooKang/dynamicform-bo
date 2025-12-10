import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { kioskDevices } from '@/data/kiosk';
import type { KioskDevice, KioskPowerStatus } from '@/types/kiosk';

type KioskContextValue = {
  kiosks: KioskDevice[];
  updateKiosk: (kiosk: KioskDevice) => void;
  setPowerStatus: (id: string, status: KioskPowerStatus) => void;
};

const KioskContext = createContext<KioskContextValue | null>(null);

type KioskProviderProps = {
  children: ReactNode;
};

export function KioskProvider({ children }: KioskProviderProps) {
  const [kiosks, setKiosks] = useState<KioskDevice[]>(kioskDevices);

  const updateKiosk = (kiosk: KioskDevice) => {
    setKiosks((previous) =>
      previous.map((item) => (item.id === kiosk.id ? kiosk : item)),
    );
  };

  const setPowerStatus = (id: string, status: KioskPowerStatus) => {
    setKiosks((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              powerStatus: status,
              lastHeartbeat:
                status === 'on'
                  ? new Date().toISOString().slice(0, 16).replace('T', ' ')
                  : item.lastHeartbeat,
            }
          : item,
      ),
    );
  };

  const value = useMemo(
    () => ({
      kiosks,
      updateKiosk,
      setPowerStatus,
    }),
    [kiosks],
  );

  return <KioskContext.Provider value={value}>{children}</KioskContext.Provider>;
}

export const useKiosk = () => {
  const context = useContext(KioskContext);
  if (!context) {
    throw new Error('useKiosk must be used within KioskProvider');
  }
  return context;
};

