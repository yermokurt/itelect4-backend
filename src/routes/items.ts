import { Router, type Request, type Response } from "express";
import { requireAuth } from "../middleware/auth.js";
import ItemModel from "../models/Item.js";
import type {
  IdParam,
  CreateItemBody,
  UpdateItemBody,
} from "../types/index.js";

export const itemRouter = Router();

itemRouter.use(requireAuth);

// GET / — list items belonging to the authenticated user
itemRouter.get("/", async (req: Request, res: Response) => {
  const items = await ItemModel.find({ reportedByUserId: req.userId });
  res.status(200).json(items);
});

// GET /:id — single item scoped to the authenticated user
itemRouter.get(
  "/:id",
  async (req: Request<IdParam>, res: Response) => {
    const item = await ItemModel.findOne({
      _id: req.params.id,
      reportedByUserId: req.userId,
    });

    if (!item) {
      res.status(404).json({ message: "No item with that id" });
      return;
    }

    res.status(200).json(item);
  }
);

// POST / — create an item; owner is always taken from the JWT, never the body
itemRouter.post(
  "/",
  async (req: Request<object, object, CreateItemBody>, res: Response) => {
    const { title, description, location, status } = req.body;

    const item = await ItemModel.create({
      title,
      description,
      location,
      status,
      reportedByUserId: req.userId,
    });

    res.status(201).json(item);
  }
);

// PATCH /:id — partial update scoped to the authenticated user
itemRouter.patch(
  "/:id",
  async (req: Request<IdParam, object, UpdateItemBody>, res: Response) => {
    const { title, description, location, status } = req.body;

    const updates: UpdateItemBody = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (location !== undefined) updates.location = location;
    if (status !== undefined) updates.status = status;

    const item = await ItemModel.findOneAndUpdate(
      { _id: req.params.id, reportedByUserId: req.userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!item) {
      res.status(404).json({ message: "No item with that id" });
      return;
    }

    res.status(200).json(item);
  }
);

// DELETE /:id — delete scoped to the authenticated user
itemRouter.delete(
  "/:id",
  async (req: Request<IdParam>, res: Response) => {
    const item = await ItemModel.findOneAndDelete({
      _id: req.params.id,
      reportedByUserId: req.userId,
    });

    if (!item) {
      res.status(404).json({ message: "No item with that id" });
      return;
    }

    res.status(204).send();
  }
);
