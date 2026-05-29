const Blog = require("../models/Blog");

const createSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

const createBlog = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const blog = await Blog.create({
      title,
      slug: createSlug(title),
      content,
      category,
      image: req.file ? req.file.path : "",
      author: req.user._id,
    });

    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllBlogs = async (req, res) => {
  try {
    const { search, category } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    const blogs = await Blog.find(filter)
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSingleBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate(
      "author",
      "name email"
    );

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    blog.views += 1;
    await blog.save();

    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const likeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate(
      "author",
      "name email"
    );

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const alreadyLiked = blog.likes.some(
      (userId) => userId.toString() === req.user._id.toString()
    );

    if (alreadyLiked) {
      blog.likes = blog.likes.filter(
        (userId) => userId.toString() !== req.user._id.toString()
      );
    } else {
      blog.likes.push(req.user._id);
    }

    await blog.save();

    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    blog.title = req.body.title || blog.title;
    blog.slug = req.body.title ? createSlug(req.body.title) : blog.slug;
    blog.content = req.body.content || blog.content;
    blog.category = req.body.category || blog.category;

    if (req.file) {
  blog.image = req.file.path;
}
    const updatedBlog = await blog.save();

    res.json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await blog.deleteOne();

    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBlog,
  getAllBlogs,
  getSingleBlog,
  getMyBlogs,
  likeBlog,
  updateBlog,
  deleteBlog,
};