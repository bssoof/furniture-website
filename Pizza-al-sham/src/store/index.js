import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

// Auth Store
export const useAuthStore = create(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isLoading: false,
        error: null,
        
        setUser: (user) => set({ user }),
        setIsLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),
        
        logout: () => set({ user: null })
      }),
      { name: 'auth-store' }
    )
  )
);

// Cart Store
export const useCartStore = create(
  devtools(
    persist(
      (set, get) => ({
        items: [],
        
        addItem: (item) => {
          set((state) => {
            const existingItem = state.items.find(i => i.id === item.id);
            const quantityToAdd = item.quantity || 1;
            
            if (existingItem) {
              return {
                items: state.items.map(i =>
                  i.id === item.id ? { ...i, quantity: i.quantity + quantityToAdd } : i
                )
              };
            } else {
              return { items: [...state.items, { ...item, quantity: quantityToAdd }] };
            }
          });
        },
        
        removeItem: (itemId) => set((state) => ({
          items: state.items.filter(i => i.id !== itemId)
        })),
        
        updateQuantity: (itemId, quantity) => set((state) => ({
          items: state.items
            .map(i => i.id === itemId ? { ...i, quantity } : i)
            .filter(i => i.quantity > 0)
        })),
        
        clearCart: () => set({ items: [] }),
        
        getTotal: () => {
          const { items } = get();
          return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        },
        
        getCartCount: () => {
          const { items } = get();
          return items.reduce((sum, item) => sum + item.quantity, 0);
        }
      }),
      { name: 'cart-store' }
    )
  )
);

// Theme Store
export const useThemeStore = create(
  devtools(
    persist(
      (set) => ({
        isDarkMode: true,
        language: 'ar',
        
        toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
        setLanguage: (language) => set({ language }),
        setDarkMode: (isDarkMode) => set({ isDarkMode })
      }),
      { name: 'theme-store' }
    )
  )
);

// Favorites Store
export const useFavoritesStore = create(
  devtools(
    persist(
      (set, get) => ({
        favorites: [],
        
        toggleFavorite: (itemId) => set((state) => {
          if (state.favorites.includes(itemId)) {
            return { favorites: state.favorites.filter(id => id !== itemId) };
          }
          return { favorites: [...state.favorites, itemId] };
        }),

        addToFavorites: (itemId) => set((state) => {
          if (!state.favorites.includes(itemId)) {
            return { favorites: [...state.favorites, itemId] };
          }
          return state;
        }),
        
        removeFromFavorites: (itemId) => set((state) => ({
          favorites: state.favorites.filter(id => id !== itemId)
        })),
        
        isFavorite: (itemId) => {
          const { favorites } = get();
          return favorites.includes(itemId);
        }
      }),
      { name: 'favorites-store' }
    )
  )
);

// Notifications Store
export const useNotificationStore = create(devtools((set) => ({
  notifications: [],
  
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, {
      id: Date.now(),
      ...notification,
      createdAt: new Date()
    }]
  })),
  
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  
  clearNotifications: () => set({ notifications: [] })
})));

// Admin Store
export const useAdminStore = create(devtools((set) => ({
  orders: [],
  users: [],
  menuItems: [],
  statistics: {},
  
  setOrders: (orders) => set({ orders }),
  setUsers: (users) => set({ users }),
  setMenuItems: (menuItems) => set({ menuItems }),
  setStatistics: (statistics) => set({ statistics }),
  
  updateOrderStatus: (orderId, status) => set((state) => ({
    orders: state.orders.map(order =>
      order.id === orderId ? { ...order, status } : order
    )
  }))
})));
