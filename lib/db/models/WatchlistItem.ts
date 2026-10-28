import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWatchlistItem extends Document {
  userId: string;
  symbol: string;
  company: string;
  addedAt: Date;
}

const WatchlistItemSchema = new Schema<IWatchlistItem>(
  {
    userId: { type: String, required: true, index: true },
    symbol: { type: String, required: true, uppercase: true, trim: true },
    company: { type: String, required: true, trim: true },
    addedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

WatchlistItemSchema.index({ userId: 1, symbol: 1 }, { unique: true });

export const WatchlistItemModel: Model<IWatchlistItem> =
  mongoose.models.WatchlistItem ||
  mongoose.model<IWatchlistItem>('WatchlistItem', WatchlistItemSchema);

export default WatchlistItemModel;
