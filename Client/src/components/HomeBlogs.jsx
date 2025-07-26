import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaPaw } from "react-icons/fa";

const HomeBlogs = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchFeaturedBlogs = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/blogs");
        setBlogs(response.data.slice(0, 4));
      } catch (err) {
        console.error("Error fetching blogs:", err);
      }
    };

    fetchFeaturedBlogs();
  }, []);

  return (
    <div className="mt-12 mb-20 w-full mx-auto px-4 lg:max-w-6xl custom-lg:max-w-4xl max-w-xs custom-xs:max-w-md sm:max-w-xl md:max-w-2xl">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        <FaPaw className="text-xl text-teal-600" />
        <h2 className="text-2xl font-semibold text-teal-800">
          Latest Pet Articles
          <span className="block w-12 h-1 bg-teal-300 mt-1 rounded-full" />
        </h2>
      </div>

      {/* Blog grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {blogs.map((blog) => (
          <div 
            key={blog._id}
            className="bg-white rounded-xl p-2 shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <Link to={`/blog/${blog._id}`} className="block">
              {/* Compact image */}
              <div className="relative overflow-hidden rounded-lg aspect-video mb-2">
                <img
                  src={blog.Images}
                  alt={blog.Title}
                  className="w-full h-32 object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>

              {/* Title only */}
              <h3 className="text-sm font-medium text-gray-800 line-clamp-2 px-1">
                {blog.Title}
              </h3>
            </Link>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {blogs.length === 0 && (
        <div className="text-center py-6">
          <p className="text-gray-500 italic">No articles found</p>
        </div>
      )}
    </div>
  );
};

export default HomeBlogs;