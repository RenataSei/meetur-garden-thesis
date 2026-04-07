// models/blogModel.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const replySchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
  },
  { timestamps: true },
);

const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },

    image: { type: String, default: "" },

    author: {
      type: Schema.Types.ObjectId,
      ref: "User", // Links the post to the user who wrote it
      required: true,
    },
    tags: [
      {
        type: String, // e.g., "Help", "Showcase", "Tips"
      },
    ],

    replies: [replySchema],

    // --- MODERATION FIELDS ---
    isFlagged: {
      type: Boolean,
      default: false,
    },
    flaggedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User", // Keeps track of who reported it so they can't spam the report button
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Blog", blogSchema);
