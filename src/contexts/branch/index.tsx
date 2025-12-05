import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { branchRows } from '@/data/branch';
import type { BranchRow } from '@/types/branch';

type BranchContextValue = {
  branches: BranchRow[];
  addBranch: (branch: BranchRow) => void;
  updateBranch: (branch: BranchRow) => void;
};

const BranchContext = createContext<BranchContextValue | null>(null);

type BranchProviderProps = {
  children: ReactNode;
};

export function BranchProvider({ children }: BranchProviderProps) {
  const [branches, setBranches] = useState<BranchRow[]>(branchRows);

  const addBranch = (branch: BranchRow) => {
    setBranches((prev) => [branch, ...prev]);
  };

  const updateBranch = (branch: BranchRow) => {
    setBranches((prev) =>
      prev.map((item) => (item.id === branch.id ? branch : item)),
    );
  };

  const value = useMemo(
    () => ({ branches, addBranch, updateBranch }),
    [branches],
  );

  return <BranchContext.Provider value={value}>{children}</BranchContext.Provider>;
}

export const useBranch = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranch must be used within BranchProvider');
  }
  return context;
};
