import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProductInteraction extends Document {
  user?: Types.ObjectId;
  sessionId?: string;
  product: Types.ObjectId;
  interactionType: 'view' | 'cart' | 'wishlist' | 'purchase';
  createdAt: Date;
}

const ProductInteractionSchema = new Schema<IProductInteraction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      sparse: true,
      index: true,
    },
    sessionId: {
      type: String,
      sparse: true,
      index: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    interactionType: {
      type: String,
      enum: ['view', 'cart', 'wishlist', 'purchase'],
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

ProductInteractionSchema.index({ product: 1, interactionType: 1 });

export const ProductInteraction = mongoose.model<IProductInteraction>(
  'ProductInteraction',
  ProductInteractionSchema
);
