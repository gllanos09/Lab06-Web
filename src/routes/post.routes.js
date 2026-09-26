import express from "express";
import postController from "../controllers/postController.js";

const router = express.Router();

router.get("/", postController.getAll);
router.get("/new", postController.renderNewForm);
router.post("/", postController.createFromForm);
router.get("/:id/edit", postController.renderEditForm);
router.post("/:id/edit", postController.update);
router.post("/:id/delete", postController.delete);

export default router;