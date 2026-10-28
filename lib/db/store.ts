import { connectToDatabase } from './connect';
import UserModel from './models/User';
import WatchlistItemModel from './models/WatchlistItem';
import AlertModel from './models/Alert';
import HoldingModel from './models/Holding';

export interface StoredUser {
  _id: string;
  id?: string;
  name: string;
  email: string;
  password?: string;
  country: string;
  investmentGoals: string;
  riskTolerance: string;
  preferredIndustry: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredWatchlistItem {
  _id: string;
  id?: string;
  userId: string;
  symbol: string;
  company: string;
  addedAt: Date;
}

export interface StoredAlert {
  _id: string;
  id?: string;
  userId: string;
  symbol: string;
  company: string;
  alertName: string;
  alertType: 'upper' | 'lower';
  threshold: number;
  active: boolean;
  triggered: boolean;
  lastTriggeredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredHolding {
  _id: string;
  id?: string;
  userId: string;
  symbol: string;
  company: string;
  shares: number;
  buyPrice: number;
  dateAcquired: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory fallback stores for offline/mock development
interface MemoryStore {
  users: Map<string, StoredUser>;
  watchlist: Map<string, StoredWatchlistItem[]>;
  alerts: Map<string, StoredAlert[]>;
  holdings: Map<string, StoredHolding[]>;
}

declare global {
  var memoryStoreCache: MemoryStore | undefined;
}

const memoryStore: MemoryStore = global.memoryStoreCache || {
  users: new Map(),
  watchlist: new Map(),
  alerts: new Map(),
  holdings: new Map(),
};

if (!global.memoryStoreCache) {
  global.memoryStoreCache = memoryStore;
}

// User Helpers
export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const db = await connectToDatabase();
  const normalizedEmail = email.toLowerCase().trim();

  if (db) {
    try {
      const found = await UserModel.findOne({ email: normalizedEmail }).lean();
      if (found) {
        return {
          ...found,
          _id: String(found._id),
          id: String(found._id),
        } as StoredUser;
      }
    } catch {
      // Fallback
    }
  }

  for (const user of memoryStore.users.values()) {
    if (user.email.toLowerCase() === normalizedEmail) {
      return user;
    }
  }
  return null;
}

export async function findUserById(id: string): Promise<StoredUser | null> {
  const db = await connectToDatabase();
  if (db) {
    try {
      const found = await UserModel.findById(id).lean();
      if (found) {
        return {
          ...found,
          _id: String(found._id),
          id: String(found._id),
        } as StoredUser;
      }
    } catch {
      // Fallback
    }
  }
  return memoryStore.users.get(id) || null;
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  country?: string;
  investmentGoals?: string;
  riskTolerance?: string;
  preferredIndustry?: string;
}): Promise<StoredUser> {
  const db = await connectToDatabase();
  const normalizedEmail = data.email.toLowerCase().trim();

  if (db) {
    try {
      const created = await UserModel.create({
        ...data,
        email: normalizedEmail,
      });
      const obj = created.toObject();
      return {
        ...obj,
        _id: String(obj._id),
        id: String(obj._id),
      } as StoredUser;
    } catch (err) {
      console.warn('DB create failed, using memory store:', err);
    }
  }

  const id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const newUser: StoredUser = {
    _id: id,
    id,
    name: data.name,
    email: normalizedEmail,
    password: data.password,
    country: data.country || 'US',
    investmentGoals: data.investmentGoals || 'Growth',
    riskTolerance: data.riskTolerance || 'Medium',
    preferredIndustry: data.preferredIndustry || 'Technology',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  memoryStore.users.set(id, newUser);
  return newUser;
}

// Watchlist Helpers
export async function getUserWatchlist(userId: string): Promise<StoredWatchlistItem[]> {
  const db = await connectToDatabase();
  if (db) {
    try {
      const items = await WatchlistItemModel.find({ userId }).sort({ addedAt: -1 }).lean();
      return items.map((i) => ({
        ...i,
        _id: String(i._id),
        id: String(i._id),
      })) as StoredWatchlistItem[];
    } catch {
      // Fallback
    }
  }
  return memoryStore.watchlist.get(userId) || [];
}

export async function addToWatchlist(
  userId: string,
  symbol: string,
  company: string
): Promise<StoredWatchlistItem> {
  const db = await connectToDatabase();
  const upperSymbol = symbol.toUpperCase().trim();

  if (db) {
    try {
      const updated = await WatchlistItemModel.findOneAndUpdate(
        { userId, symbol: upperSymbol },
        { userId, symbol: upperSymbol, company, addedAt: new Date() },
        { upsert: true, new: true }
      ).lean();
      if (updated) {
        return {
          ...updated,
          _id: String(updated._id),
          id: String(updated._id),
        } as StoredWatchlistItem;
      }
    } catch {
      // Fallback
    }
  }

  const items = memoryStore.watchlist.get(userId) || [];
  const existing = items.find((i) => i.symbol === upperSymbol);
  if (existing) return existing;

  const newItem: StoredWatchlistItem = {
    _id: `wl_${Date.now()}`,
    id: `wl_${Date.now()}`,
    userId,
    symbol: upperSymbol,
    company,
    addedAt: new Date(),
  };

  items.unshift(newItem);
  memoryStore.watchlist.set(userId, items);
  return newItem;
}

export async function removeFromWatchlist(userId: string, symbol: string): Promise<boolean> {
  const db = await connectToDatabase();
  const upperSymbol = symbol.toUpperCase().trim();

  if (db) {
    try {
      await WatchlistItemModel.deleteOne({ userId, symbol: upperSymbol });
      return true;
    } catch {
      // Fallback
    }
  }

  const items = memoryStore.watchlist.get(userId) || [];
  const filtered = items.filter((i) => i.symbol !== upperSymbol);
  memoryStore.watchlist.set(userId, filtered);
  return true;
}

export async function isStockInWatchlist(userId: string, symbol: string): Promise<boolean> {
  const db = await connectToDatabase();
  const upperSymbol = symbol.toUpperCase().trim();

  if (db) {
    try {
      const count = await WatchlistItemModel.countDocuments({ userId, symbol: upperSymbol });
      return count > 0;
    } catch {
      // Fallback
    }
  }

  const items = memoryStore.watchlist.get(userId) || [];
  return items.some((i) => i.symbol === upperSymbol);
}

// Alert Helpers
export async function getUserAlerts(userId: string): Promise<StoredAlert[]> {
  const db = await connectToDatabase();
  if (db) {
    try {
      const items = await AlertModel.find({ userId }).sort({ createdAt: -1 }).lean();
      return items.map((a) => ({
        ...a,
        _id: String(a._id),
        id: String(a._id),
      })) as StoredAlert[];
    } catch {
      // Fallback
    }
  }
  return memoryStore.alerts.get(userId) || [];
}

export async function getAllActiveAlerts(): Promise<StoredAlert[]> {
  const db = await connectToDatabase();
  if (db) {
    try {
      const items = await AlertModel.find({ active: true }).lean();
      return items.map((a) => ({
        ...a,
        _id: String(a._id),
        id: String(a._id),
      })) as StoredAlert[];
    } catch {
      // Fallback
    }
  }

  const allAlerts: StoredAlert[] = [];
  for (const list of memoryStore.alerts.values()) {
    allAlerts.push(...list.filter((a) => a.active));
  }
  return allAlerts;
}

export async function createAlert(data: {
  userId: string;
  symbol: string;
  company: string;
  alertName: string;
  alertType: 'upper' | 'lower';
  threshold: number;
}): Promise<StoredAlert> {
  const db = await connectToDatabase();
  const upperSymbol = data.symbol.toUpperCase().trim();

  if (db) {
    try {
      const alert = await AlertModel.create({
        ...data,
        symbol: upperSymbol,
      });
      const obj = alert.toObject();
      return {
        ...obj,
        _id: String(obj._id),
        id: String(obj._id),
      } as StoredAlert;
    } catch {
      // Fallback
    }
  }

  const id = `alert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newAlert: StoredAlert = {
    _id: id,
    id,
    ...data,
    symbol: upperSymbol,
    active: true,
    triggered: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const items = memoryStore.alerts.get(data.userId) || [];
  items.unshift(newAlert);
  memoryStore.alerts.set(data.userId, items);
  return newAlert;
}

export async function updateAlert(
  userId: string,
  alertId: string,
  data: Partial<{
    alertName: string;
    alertType: 'upper' | 'lower';
    threshold: number;
    active: boolean;
    triggered: boolean;
    lastTriggeredAt?: Date;
  }>
): Promise<StoredAlert | null> {
  const db = await connectToDatabase();
  if (db) {
    try {
      const updated = await AlertModel.findOneAndUpdate(
        { _id: alertId, userId },
        { $set: data },
        { new: true }
      ).lean();
      if (updated) {
        return {
          ...updated,
          _id: String(updated._id),
          id: String(updated._id),
        } as StoredAlert;
      }
    } catch {
      // Fallback
    }
  }

  const items = memoryStore.alerts.get(userId) || [];
  const idx = items.findIndex((a) => a._id === alertId || a.id === alertId);
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...data, updatedAt: new Date() };
    return items[idx];
  }
  return null;
}

export async function deleteAlert(userId: string, alertId: string): Promise<boolean> {
  const db = await connectToDatabase();
  if (db) {
    try {
      await AlertModel.deleteOne({ _id: alertId, userId });
      return true;
    } catch {
      // Fallback
    }
  }

  const items = memoryStore.alerts.get(userId) || [];
  const filtered = items.filter((a) => a._id !== alertId && a.id !== alertId);
  memoryStore.alerts.set(userId, filtered);
  return true;
}

// Holdings Helpers (Phase 2 & Phase 3 Portfolio Tracking)
export async function getUserHoldings(userId: string): Promise<StoredHolding[]> {
  const db = await connectToDatabase();
  if (db) {
    try {
      const items = await HoldingModel.find({ userId }).sort({ dateAcquired: -1 }).lean();
      return items.map((h) => ({
        ...h,
        _id: String(h._id),
        id: String(h._id),
      })) as StoredHolding[];
    } catch {
      // Fallback
    }
  }
  return memoryStore.holdings.get(userId) || [];
}

export async function addHolding(data: {
  userId: string;
  symbol: string;
  company: string;
  shares: number;
  buyPrice: number;
  dateAcquired?: Date;
  notes?: string;
}): Promise<StoredHolding> {
  const db = await connectToDatabase();
  const upperSymbol = data.symbol.toUpperCase().trim();

  if (db) {
    try {
      const holding = await HoldingModel.create({
        ...data,
        symbol: upperSymbol,
      });
      const obj = holding.toObject();
      return {
        ...obj,
        _id: String(obj._id),
        id: String(obj._id),
      } as StoredHolding;
    } catch {
      // Fallback
    }
  }

  const id = `hold_${Date.now()}`;
  const newHolding: StoredHolding = {
    _id: id,
    id,
    ...data,
    symbol: upperSymbol,
    dateAcquired: data.dateAcquired || new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const items = memoryStore.holdings.get(data.userId) || [];
  items.unshift(newHolding);
  memoryStore.holdings.set(data.userId, items);
  return newHolding;
}

export async function removeHolding(userId: string, holdingId: string): Promise<boolean> {
  const db = await connectToDatabase();
  if (db) {
    try {
      await HoldingModel.deleteOne({ _id: holdingId, userId });
      return true;
    } catch {
      // Fallback
    }
  }

  const items = memoryStore.holdings.get(userId) || [];
  const filtered = items.filter((h) => h._id !== holdingId && h.id !== holdingId);
  memoryStore.holdings.set(userId, filtered);
  return true;
}
