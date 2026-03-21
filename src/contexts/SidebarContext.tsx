import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';

interface SidebarContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  isMobile: boolean;
}

interface SidebarProviderProps {
  children: ReactNode;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // <900px
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(!isMobile);

  // Auto-close sidebar when switching to mobile, auto-open when switching to desktop
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = useCallback((): void => setSidebarOpen((prev) => !prev), []);
  const openSidebar = useCallback((): void => setSidebarOpen(true), []);
  const closeSidebar = useCallback((): void => setSidebarOpen(false), []);

  return (
    <SidebarContext.Provider value={{ sidebarOpen, setSidebarOpen, toggleSidebar, openSidebar, closeSidebar, isMobile }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = (): SidebarContextType => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
