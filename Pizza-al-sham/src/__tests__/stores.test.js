import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore, useCartStore, useThemeStore } from '../store';
import { renderHook, act } from '@testing-library/react';

describe('Stores', () => {
  describe('useAuthStore', () => {
    it('should initialize with null user', () => {
      const { result } = renderHook(() => useAuthStore());
      expect(result.current.user).toBeNull();
    });

    it('should set user', () => {
      const { result } = renderHook(() => useAuthStore());
      const user = { id: '1', email: 'test@example.com' };
      
      act(() => {
        result.current.setUser(user);
      });
      
      expect(result.current.user).toEqual(user);
    });

    it('should logout user', () => {
      const { result } = renderHook(() => useAuthStore());
      
      act(() => {
        result.current.setUser({ id: '1', email: 'test@example.com' });
      });
      
      expect(result.current.user).not.toBeNull();
      
      act(() => {
        result.current.logout();
      });
      
      expect(result.current.user).toBeNull();
    });
  });

  describe('useCartStore', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useCartStore());
      act(() => {
        result.current.clearCart();
      });
    });

    it('should add item to cart', () => {
      const { result } = renderHook(() => useCartStore());
      const item = { id: 1, name: 'Pizza', price: 35, quantity: 1 };
      
      act(() => {
        result.current.addItem(item);
      });
      
      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0]).toEqual(item);
    });

    it('should increase quantity if item exists', () => {
      const { result } = renderHook(() => useCartStore());
      const item = { id: 1, name: 'Pizza', price: 35 };
      
      act(() => {
        result.current.addItem(item);
        result.current.addItem(item);
      });
      
      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(2);
    });

    it('should calculate total correctly', () => {
      const { result } = renderHook(() => useCartStore());
      
      act(() => {
        result.current.addItem({ id: 1, name: 'Pizza', price: 35, quantity: 1 });
        result.current.addItem({ id: 2, name: 'Pasta', price: 25, quantity: 1 });
      });
      
      expect(result.current.getTotal()).toBe(60);
    });

    it('should get cart count', () => {
      const { result } = renderHook(() => useCartStore());
      
      act(() => {
        result.current.addItem({ id: 1, name: 'Pizza', price: 35 });
        result.current.addItem({ id: 1, name: 'Pizza', price: 35 });
      });
      
      expect(result.current.getCartCount()).toBe(2);
    });

    it('should remove item from cart', () => {
      const { result } = renderHook(() => useCartStore());
      
      act(() => {
        result.current.addItem({ id: 1, name: 'Pizza', price: 35 });
        result.current.removeItem(1);
      });
      
      expect(result.current.items).toHaveLength(0);
    });

    it('should clear cart', () => {
      const { result } = renderHook(() => useCartStore());
      
      act(() => {
        result.current.addItem({ id: 1, name: 'Pizza', price: 35 });
        result.current.addItem({ id: 2, name: 'Pasta', price: 25 });
        result.current.clearCart();
      });
      
      expect(result.current.items).toHaveLength(0);
    });
  });

  describe('useThemeStore', () => {
    it('should toggle dark mode', () => {
      const { result } = renderHook(() => useThemeStore());
      const initialMode = result.current.isDarkMode;
      
      act(() => {
        result.current.toggleDarkMode();
      });
      
      expect(result.current.isDarkMode).toBe(!initialMode);
    });

    it('should change language', () => {
      const { result } = renderHook(() => useThemeStore());
      
      act(() => {
        result.current.setLanguage('en');
      });
      
      expect(result.current.language).toBe('en');
    });
  });
});
