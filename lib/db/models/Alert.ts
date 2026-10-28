import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAlert extends Document {
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

const AlertSchema = new Schema<IAlert>(
  {
    userId: { type: String, required: true, index: true },
    symbol: { type: String, required: true, uppercase: true, trim: true },
    company: { type: String, required: true, trim: true },
    alertName: { type: String, required: true, trim: true },
    alertType: { type: String, enum: ['upper', 'lower'], required: true },
    threshold: { type: Number, required: true },
    active: { type: Boolean, default: true },
    triggered: { type: Boolean, default: false },
    lastTriggeredAt: { type: Date },
  },
  { timestamps: true }
);

AlertSchema.index({ active: 1, symbol: 1 });

export const AlertModel: Model<IAlert> =
  mongoose.models.Alert || mongoose.model<IAlert>('Alert', AlertSchema);

export default AlertModel;
