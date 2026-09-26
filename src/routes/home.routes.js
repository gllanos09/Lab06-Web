import express from "express";
import postService from "../services/postService.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const posts = await postService.getPosts();
    const recentPosts = posts.slice(-3).reverse(); // los 3 más recientes primero
    res.render("home", { totalPosts: posts.length, recentPosts });
  } catch (error) {
    res.render("home", { totalPosts: 0, recentPosts: [] });
  }
});

export default router;