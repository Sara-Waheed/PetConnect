// src/admin/BlogLibrary.jsx
import React from "react";
import { Link } from "react-router-dom";
import BlogList from "./BlogSection";

export const BlogLibrary = () => (
  <div className="p-6">
    {/* Button aligned to right without heading */}
    <div className="flex justify-end my-4">
      <Link
        to="/admin/blogs/new"
        className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition"
      >
        + Add New Blog
      </Link>
    </div>

    {/* Blog list */}
    <BlogList />
  </div>
);
