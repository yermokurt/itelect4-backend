import type { Types } from "mongoose";

// ---------------------------------------------------------------------------
// Shared domain enums & interfaces (frontend-compatible)
// ---------------------------------------------------------------------------

export enum ItemStatus {
  LOST = "LOST",
  FOUND = "FOUND",
  CLAIMED = "CLAIMED",
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "student" | "admin";
  isActive: boolean;
}

export interface Item {
  id: number;
  title: string;
  description: string;
  location: string;
  reportedByUserId: number;
  status: ItemStatus;
}

export interface Claim {
  id: number;
  itemId: number;
  claimerUserId: number;
  dateClaimed: string;
}

// ---------------------------------------------------------------------------
// Backend-specific derived types (MongoDB / Mongoose layer)
// ---------------------------------------------------------------------------

/** Shape stored in the `users` collection (no numeric id, has hashed password). */
export type UserDoc = Omit<User, "id"> & {
  password: string;
};

/** Shape stored in the `items` collection (ObjectId owner, no numeric id). */
export type ItemDoc = Omit<Item, "id" | "reportedByUserId"> & {
  reportedByUserId: Types.ObjectId;
};

/** Body accepted by POST /api/items. */
export type CreateItemBody = Pick<
  Item,
  "title" | "description" | "location" | "status"
>;

/** Body accepted by PATCH /api/items/:id (all fields optional). */
export type UpdateItemBody = Partial<CreateItemBody>;

// ---------------------------------------------------------------------------
// Auth request bodies
// ---------------------------------------------------------------------------

export interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

// ---------------------------------------------------------------------------
// Route parameter helpers
// ---------------------------------------------------------------------------

export interface IdParam {
  id: string;
}
