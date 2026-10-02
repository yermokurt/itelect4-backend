import mongoose, { Schema, type Document, type Model } from "mongoose";
import { ItemStatus, type ItemDoc } from "../types/index.js";

export interface IItemDocument extends ItemDoc, Document {}

const itemSchema = new Schema<IItemDocument>(
  {
    reportedByUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reported-by user is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [100, "Title must be at most 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [5, "Description must be at least 5 characters"],
      maxlength: [1000, "Description must be at most 1000 characters"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      minlength: [2, "Location must be at least 2 characters"],
      maxlength: [150, "Location must be at most 150 characters"],
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: {
        values: Object.values(ItemStatus),
        message: `Status must be one of: ${Object.values(ItemStatus).join(", ")}`,
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret["id"] = ret["_id"];
        delete ret["_id"];
        delete ret["__v"];
        return ret;
      },
    },
  }
);

const ItemModel: Model<IItemDocument> = mongoose.model<IItemDocument>(
  "Item",
  itemSchema
);

export default ItemModel;
