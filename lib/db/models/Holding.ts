import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHolding extends Document {
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

const HoldingSchema = new Schema<IHolding>(
  {
    userId: { type: String, required: true, index: true },
    symbol: { type: String, required: true, uppercase: true, trim: true },
    company: { type: String, required: true, trim: true },
    shares: { type: Number, required: true, min: 0 },
    buyPrice: { type: Number, required: true, min: 0 },
    dateAcquired: { type: Date, default: Date.now },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

export const HoldingModel: Model<IHolding> =
  mongoose.models.Holding || mongoose.model<IHolding>('Holding', HoldingSchema);

export default HoldingModel;
