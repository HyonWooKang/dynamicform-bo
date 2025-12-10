import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { initialMenuItems } from '@/data/menus';

const initialTags = Array.from(
  new Set(initialMenuItems.flatMap((menu) => menu.tags)),
);

type TagContextValue = {
  tags: string[];
  addTag: (tag: string) => boolean;
  removeTag: (tag: string) => void;
};

const TagContext = createContext<TagContextValue | null>(null);

type TagProviderProps = {
  children: ReactNode;
};

export function TagProvider({ children }: TagProviderProps) {
  const [tags, setTags] = useState<string[]>(initialTags);

  const addTag = (tag: string) => {
    const normalized = tag.trim();
    if (!normalized || tags.includes(normalized)) {
      return false;
    }
    setTags((previous) => [...previous, normalized]);
    return true;
  };

  const removeTag = (tag: string) => {
    setTags((previous) => previous.filter((item) => item !== tag));
  };

  const value = useMemo(
    () => ({
      tags,
      addTag,
      removeTag,
    }),
    [tags],
  );

  return <TagContext.Provider value={value}>{children}</TagContext.Provider>;
}

export const useTags = () => {
  const context = useContext(TagContext);
  if (!context) {
    throw new Error('useTags must be used within TagProvider');
  }
  return context;
};
