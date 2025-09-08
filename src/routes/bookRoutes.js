import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, async (req, res) => {
  try {
    const { title, caption, image, rating } = req.body;
    if (!title || !caption || !image || !rating) {
      res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    //upload to cloudinary
    const uploadRes = await cloudinary.uploader.upload(image);

    const imageUrl = uploadRes.secure_url;
    //save to mongodb

    const newBook = new Book({
      title,
      caption,
      image: imageUrl,
      rating: rating,
      user: req.user._id,
    });

    await newBook.save();

    res.status(201).json({ success: true, message: "Book Saved", newBook });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.get("/", protectRoute, async (req, res) => {
  try {
    const page = req.query.page ?? 1;
    const limit = req.query.limit ?? 5;
    const skip = (page - 1) * limit;
    const books = await Book.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username prfileImage");

    const totalBooks = await Book.countDoucments();

    res.send({
      books,
      currentPage: page,
      totalBooks,
      totalPages: Math.ceil(totalBooks / limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book)
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });

    if (book.user.toString() !== req.user._id) {
      return res.status({ message: "Unauthorized Request" });
    }

    //delete the image from cloudinary
    if (book.image && book.image.includes("cloudinary")) {
      try {
        const publicId = book.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.log("Error deleting image from cloudinary ");
      }
    }
    await book.deleteOne();
    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/user", protectRoute, async (req, res) => {
  try {
    const books = await Book.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
