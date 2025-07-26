// src/components/BlogList.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { FaSearch, FaSpinner } from "react-icons/fa";

const BlogList = () => {
  const { search } = useLocation();
  const queryParams      = new URLSearchParams(search);
  const initialCategory  = queryParams.get("category") || "";

  const [blogs, setBlogs]         = useState([]);
  const [category, setCategory]   = useState(initialCategory);
  const [loading, setLoading]     = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    "Dog Care",
    "Cat Care",
    "Pet Nutrition",
    "General Pet Care",
  ];

  // Keep category state in sync if someone clicks the breadcrumb link
  useEffect(() => {
    const qp = new URLSearchParams(search);
    setCategory(qp.get("category") || "");
  }, [search]);

  // Fetch blogs whenever category changes
  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const url = category
          ? `http://localhost:5000/api/blogs?category=${encodeURIComponent(category)}`
          : "http://localhost:5000/api/blogs";

        const response = await axios.get(url);
        setBlogs(response.data);
      } catch (err) {
        console.error("Error fetching blogs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [category]);

  // Filter by title search
  const filteredBlogs = blogs.filter((b) =>
    b.Title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const headingText = category || "Pet Blogs";

  // Show spinner while loading
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <FaSpinner className="animate-spin text-4xl text-orange-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-8 text-orange-700">
        {headingText}
      </h1>

      {/* Category + Search Row */}
      <div className="flex justify-between mb-6">
        <div className="w-1/4">
          <select
            className="px-4 py-2 border rounded-lg w-full"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="w-1/3 relative">
          <input
            type="text"
            placeholder="Search..."
            className="px-4 py-2 border rounded-lg w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" />
        </div>
      </div>

      {/* Blog Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBlogs.length > 0 ? (
          filteredBlogs.map((blog) => (
            <div key={blog._id} className="bg-white rounded-lg shadow-lg p-4">
              <Link to={`/blog/${blog._id}`} className="block">
                <img
                  src={blog.Images}
                  alt={blog.Title}
                  className="rounded-lg w-full h-48 object-cover"
                />
                <h2 className="text-xl font-semibold mt-4 hover:underline transition">
                  {blog.Title}
                </h2>
              </Link>
              <div
                className="text-gray-600 mt-2 line-clamp-3"
                dangerouslySetInnerHTML={{
                  __html: blog.Content
                    ? blog.Content.slice(0, 150) + "..."
                    : "No content available...",
                }}
              />
              <Link
                to={`/blog/${blog._id}`}
                className="text-teal-600 mt-2 block font-semibold hover:text-blue-400"
              >
                Read More →
              </Link>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-600">
            No blogs found for "{category}".
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogList;
