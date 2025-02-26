"use client";

import React, { createContext, ReactNode, useContext, useState } from "react";

interface MenuContextType {
  isMenuOpen: boolean;
  toggleMenu: () => void;
  closeMenu: () => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider = ({ children }: { children: ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <MenuContext.Provider value={{ isMenuOpen, toggleMenu, closeMenu }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  return context;
};
