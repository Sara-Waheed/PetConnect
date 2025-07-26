// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useParams } from "react-router-dom";
// import ReactQuill from "react-quill"; // Import React Quill
// import "react-quill/dist/quill.snow.css";
// import backgroundImage from "../assets/BgMemoryhd.jpg";    
// import { FaWhatsapp, FaFacebook, FaInstagram } from "react-icons/fa"; // Import share icons

// const BlogDetail = () => {
//   const [blog, setBlog] = useState(null);
//   const [comment, setComment] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [isEditing, setIsEditing] = useState(false);
//   const [editedContent, setEditedContent] = useState("");
//   const { id } = useParams();

//   // Fetch blog by ID
//   useEffect(() => {
//     const fetchBlog = async () => {
//       try {
//         const response = await axios.get(`http://localhost:5000/api/blogs/${id}`);
//         setBlog(response.data);
//         setEditedContent(response.data.Content);
//         setLoading(false);
//       } catch (error) {
//         console.error("Error fetching blog:", error);
//         setError("Error fetching blog. Please try again later.");
//         setLoading(false);
//       }
//     };

//     fetchBlog();
//   }, [id]);

//   // Share URL (current page)
//   const currentUrl = window.location.href;
//   const whatsAppLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(
//     "Check out this blog: " + currentUrl
//   )}`;
//   const facebookLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
//     currentUrl
//   )}`;

//   // Instagram sharing workaround
//   const shareOnInstagram = async () => {
//     try {
//       await navigator.clipboard.writeText(currentUrl);
//       alert("Blog URL copied to clipboard. Share it on Instagram!");
//     } catch (err) {
//       console.error("Failed to copy URL", err);
//     }
//   };

//   // Handle comment submission
//   const handleCommentSubmit = async () => {
//     if (!comment.trim()) return;
//     try {
//       const response = await axios.post(`http://localhost:5000/api/blogs/${id}/comments`, {
//         commentText: comment,
//       });
//       // Update blog with latest comments from backend
//       setBlog(response.data);
//       setComment(""); // Clear input
//     } catch (error) {
//       console.error("Error posting comment:", error);
//       alert("Failed to post comment. Please try again.");
//     }
//   };

//   // Handle blog content update (PUT request for partial update)
//   const handleUpdateSubmit = async () => {
//     try {
//       console.log("Updating blog with Content:", editedContent);
//       const response = await axios.put(`http://localhost:5000/api/blogs/${id}`, {
//         Content: editedContent,
//       });
//       console.log("Updated blog:", response.data);
//       setBlog(response.data); // Update blog state with updated content
//       setIsEditing(false);    // Hide editor
//     } catch (error) {
//       console.error("Error updating blog:", error);
//       alert("Failed to update content. Please try again.");
//     }
//   };

//   if (loading) {
//     return <div className="text-center py-12">Loading...</div>;
//   }

//   if (error) {
//     return <div className="text-center py-12 text-red-500">{error}</div>;
//   }

//   if (!blog) {
//     return <div className="text-center py-12">Blog not found.</div>;
//   }

//   // Conditionally render edit or view mode for content
//   const contentDisplay = isEditing ? (
//     <div className="mt-6">
//       <ReactQuill theme="snow" value={editedContent} onChange={setEditedContent} />
//       <div className="mt-4">
//         <button
//           className="mr-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
//           onClick={handleUpdateSubmit}
//         >
//           Save
//         </button>
//         <button
//           className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
//           onClick={() => {
//             setIsEditing(false);
//             setEditedContent(blog.Content); // Reset to original content
//           }}
//         >
//           Cancel
//         </button>
//       </div>
//     </div>
//   ) : (
//     <div
//       className="text-lg text-gray-800 leading-relaxed mb-6"
//       style={{ textAlign: "justify", fontFamily: "Times New Roman, Times, serif" }}
//       dangerouslySetInnerHTML={{ __html: blog.Content }}
//     />
//   );

//   return (
//     <div
//       className="min-h-screen bg-fixed bg-center bg-no-repeat bg-cover"
//       style={{ backgroundImage: `url(${backgroundImage})` }}
//     >
//       <div className="max-w-4xl mx-auto p-6">
//         <div className="bg-white p-6 bg-opacity-90">
//           <img
//             src={blog.Images}
//             alt={blog.Title}
//             className="w-full h-96 object-cover mb-6"
//           />
//           <h1 className="text-4xl font-bold text-center mb-4">{blog.Title}</h1>

//           {contentDisplay}

//           {/* Toggle edit mode */}
//           {!isEditing && (
//             <div className="mt-4">
//               <button
//                 className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//                 onClick={() => setIsEditing(true)}
//               >
//                 Edit Content
//               </button>
//             </div>
//           )}

//           {/* Comment Section */}
//           <div className="mt-12">
//             <h2 className="text-2xl font-semibold mb-4">Leave a Comment</h2>
//             <textarea
//               className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               rows="5"
//               placeholder="Write your comment here..."
//               value={comment}
//               onChange={(e) => setComment(e.target.value)}
//             />
//             <div className="mt-4 flex items-center justify-between">
//               <button
//                 className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//                 onClick={handleCommentSubmit}
//               >
//                 Submit Comment
//               </button>
//               <div className="flex space-x-4">
//                 <a href={whatsAppLink} target="_blank" rel="noopener noreferrer">
//                   <FaWhatsapp className="text-green-500 text-2xl hover:scale-110 transition-transform duration-200" />
//                 </a>
//                 <a href={facebookLink} target="_blank" rel="noopener noreferrer">
//                   <FaFacebook className="text-blue-700 text-2xl hover:scale-110 transition-transform duration-200" />
//                 </a>
//                 <button onClick={shareOnInstagram}>
//                   <FaInstagram className="text-pink-500 text-2xl hover:scale-110 transition-transform duration-200" />
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Display Comments */}
//           <div className="mt-8">
//             <h3 className="text-xl font-semibold mb-4">Comments</h3>
//             <div>
//               {blog.comments && blog.comments.length > 0 ? (
//                 blog.comments.map((c, index) => (
//                   <div key={index} className="mb-4 p-4 border border-gray-300 rounded-lg">
//                     <p className="text-gray-800">{c.commentText}</p>
//                     <p className="text-xs text-gray-500">
//                       {new Date(c.createdAt).toLocaleString()}
//                     </p>
//                   </div>
//                 ))
//               ) : (
//                 <p className="text-gray-600">No comments yet. Be the first to comment!</p>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BlogDetail;

// 
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import backgroundImage from "../assets/BgMemoryhd.jpg";
import { FaWhatsapp, FaFacebook, FaInstagram } from "react-icons/fa";

const BlogDetail = () => {
  const [blog, setBlog] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const { id } = useParams();

  // Fetch blog by ID
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/blogs/${id}`);
        setBlog(response.data);
        setEditedContent(response.data.Content);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching blog:", err);
        setError("Error fetching blog. Please try again later.");
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  // Share URLs
  const currentUrl = window.location.href;
  const whatsAppLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    "Check out this blog: " + currentUrl
  )}`;
  const facebookLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    currentUrl
  )}`;

  const shareOnInstagram = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      alert("Blog URL copied to clipboard. Share it on Instagram!");
    } catch (err) {
      console.error("Failed to copy URL", err);
    }
  };

  // Comment submission
  const handleCommentSubmit = async () => {
    if (!comment.trim()) return;
    try {
      const response = await axios.post(
        `http://localhost:5000/api/blogs/${id}/comments`,
        { commentText: comment }
      );
      setBlog(response.data);
      setComment("");
    } catch (err) {
      console.error("Error posting comment:", err);
      alert("Failed to post comment. Please try again.");
    }
  };

  // Update blog content
  const handleUpdateSubmit = async () => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/blogs/${id}`,
        { Content: editedContent }
      );
      setBlog(response.data);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating blog:", err);
      alert("Failed to update content. Please try again.");
    }
  };

  // Delete comment
  const openDeleteModal = (id) => {
    setCommentToDelete(id);
    setShowDeleteModal(true);
  };

  // close without deleting
  const closeDeleteModal = () => {
    setCommentToDelete(null);
    setShowDeleteModal(false);
  };

  // when user confirms in modal
  const confirmDeleteComment = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/blogs/${id}/comments/${commentToDelete}`
      );
      setBlog(response.data);
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert("Failed to delete comment. Please try again.");
    } finally {
      closeDeleteModal();
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>;
  if (!blog) return <div className="text-center py-12">Blog not found.</div>;

  // Editor or content display
  const contentDisplay = isEditing ? (
    <div className="mt-6">
      <ReactQuill theme="snow" value={editedContent} onChange={setEditedContent} />
      <div className="mt-4">
        <button
          className="mr-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          onClick={handleUpdateSubmit}
        >
          Save
        </button>
        <button
          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          onClick={() => {
            setIsEditing(false);
            setEditedContent(blog.Content);
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  ) : (
    <div
      className="text-lg text-gray-800 leading-relaxed mb-6"
      style={{ textAlign: "justify", fontFamily: "Times New Roman, Times, serif" }}
      dangerouslySetInnerHTML={{ __html: blog.Content }}
    />
  );

  // Comments slice
  const commentsToShow = showAllComments ? blog.comments : blog.comments.slice(0, 2);

  return (
    <div
      className="min-h-screen bg-fixed bg-center bg-no-repeat bg-cover"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Confirm-Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
            <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-6">Are you sure you want to delete this comment?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteComment}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
  
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white p-6 bg-opacity-90">
  
          {/* Breadcrumbs */}
          <nav className="text-sm mb-4">
            <ol className="list-reset flex items-center">
              <li>
                <Link to="/blogs" className="text-teal-600 hover:underline">
                  Blogs
                </Link>
              </li>
              <li className="mx-2">&gt;&gt;</li>
              <li>
                <Link
                  to={`/blogs?category=${encodeURIComponent(blog.Category)}`}
                  className="text-teal-600 hover:underline"
                >
                  {blog.Category}
                </Link>
              </li>
              <li className="mx-2">&gt;&gt;</li>
              <li className="text-black">{blog.Title}</li>
            </ol>
          </nav>
  
          <img
            src={blog.Images}
            alt={blog.Title}
            className="w-full h-96 object-cover mb-6"
          />
          <h1 className="text-4xl font-bold text-center mb-4">{blog.Title}</h1>
  
          {contentDisplay}
  
          {/* {!isEditing && (
            <div className="mt-4">
              <button
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                onClick={() => setIsEditing(true)}
              >
                Edit Content
              </button>
            </div>
          )} */}
  
          {/* Comment Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-4">Leave a Comment</h2>
            <textarea
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="5"
              placeholder="Write your comment here..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="mt-4 flex items-center justify-between">
              <button
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 "
                onClick={handleCommentSubmit}
              >
                Submit Comment
              </button>
              <div className="flex space-x-4">
                <a href={whatsAppLink} target="_blank" rel="noopener noreferrer">
                  <FaWhatsapp className="text-green-500 text-2xl hover:scale-110 transition-transform duration-200" />
                </a>
                <a href={facebookLink} target="_blank" rel="noopener noreferrer">
                  <FaFacebook className="text-blue-700 text-2xl hover:scale-110 transition-transform duration-200" />
                </a>
                <button onClick={shareOnInstagram}>
                  <FaInstagram className="text-pink-500 text-2xl hover:scale-110 transition-transform duration-200" />
                </button>
              </div>
            </div>
          </div>
  
          {/* Display Comments */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Comments</h3>
            {blog.comments && blog.comments.length > 0 ? (
              <>
                {commentsToShow.map((c, index) => (
                  <div key={c._id} className="relative bg-white p-4 rounded-lg">
                    {/* Delete button */}
                    <button
                      onClick={() => openDeleteModal(c._id)}
                      className="absolute top-2 right-2 text-red-500 text-sm hover:underline"
                    >
                      Delete
                    </button>
  
                    {/* Comment text */}
                    <p className="text-gray-800 font-sans">
                      {c.commentText}
                    </p>
  
                    {/* Timestamp */}
                    <div className="flex justify-end">
                      <p className="text-sm text-gray-500 italic">
                        {new Date(c.createdAt).toLocaleString('default', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: 'numeric'
                        })}
                      </p>
                    </div>
  
                    {/* Separator */}
                    {index !== commentsToShow.length - 1 && (
                      <hr className="border-t border-gray-200" />
                    )}
                  </div>
                ))}
  
                {blog.comments.length > 2 && (
                  <div className="flex justify-center">
                    <button
                      className="text-teal-600 hover:underline"
                      onClick={() => setShowAllComments(!showAllComments)}
                    >
                      {showAllComments
                        ? "Hide All Comments"
                        : `View All Comments (${blog.comments.length})`}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-600">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  
};

export default BlogDetail;
