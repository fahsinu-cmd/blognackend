const express = require("express");
const {
  createBlog,
  getAllBlogs,
  getSingleBlog,
  getMyBlogs,
  likeBlog,
  updateBlog,
  deleteBlog,
} = require("../controllers/blogController");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", getAllBlogs);
router.get("/my-blogs", protect, getMyBlogs);
router.get("/:id", getSingleBlog);

router.post("/", protect, upload.single("image"), createBlog);
router.put("/:id", protect, upload.single("image"), updateBlog);
router.put("/:id/like", protect, likeBlog);
router.delete("/:id", protect, deleteBlog);

module.exports = router;