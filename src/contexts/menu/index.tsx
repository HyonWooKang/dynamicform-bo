import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { initialMenuItems } from '@/data/menu';
import type { MenuItem } from '@/types/menu';

type MenuContextValue = {
  menus: MenuItem[];
  addMenu: (menu: MenuItem) => void;
  updateMenu: (menu: MenuItem) => void;
  removeTagFromMenus: (tag: string) => void;
};

const MenuContext = createContext<MenuContextValue | null>(null);

type MenuProviderProps = {
  children: ReactNode;
};

export function MenuProvider({ children }: MenuProviderProps) {
  const [menus, setMenus] = useState<MenuItem[]>(initialMenuItems);

  const addMenu = (menu: MenuItem) => {
    setMenus((previous) => [menu, ...previous]);
  };

  const updateMenu = (menu: MenuItem) => {
    setMenus((previous) =>
      previous.map((item) => (item.id === menu.id ? menu : item)),
    );
  };

  const removeTagFromMenus = (tag: string) => {
    setMenus((previous) =>
      previous.map((item) =>
        item.tags.includes(tag)
          ? { ...item, tags: item.tags.filter((existing) => existing !== tag) }
          : item,
      ),
    );
  };

  const value = useMemo(
    () => ({
      menus,
      addMenu,
      updateMenu,
      removeTagFromMenus,
    }),
    [menus],
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within MenuProvider');
  }
  return context;
};
