import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import Nav from "../Component/Nav";
import LeftBar from "../Component/LeftBar";
import RightBar from "../Component/RightBar";
import { AppContext } from "../Context/AppContext";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { users } = useContext(AppContext);
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [textContent, setTextContent] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});
  const [openComments, setOpenComments] = useState({});

  const userImage = users?.imageUrl || "/default-avatar.png";

  useEffect(() => {
    axios
      .get("http://localhost:8081/user-info", { withCredentials: true })
      .then((response) => setUser(response.data))
      .catch((error) => console.error("Failed to fetch user data:", error));
  }, []);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = () => {
    axios
      .get("http://localhost:8081/posts/all", { withCredentials: true })
      .then((response) => setPosts(response.data))
      .catch((error) => console.error("Error fetching posts:", error));
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!textContent && !mediaFile) {
      alert("Please enter some text or upload a media file.");
      return;
    }

    const formData = new FormData();
    formData.append("textContent", textContent);
    if (mediaFile) formData.append("mediaFile", mediaFile);

    try {
      await axios.post("http://localhost:8081/posts/create", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setTextContent("");
      setMediaFile(null);
      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Error creating post.");
    }
  };

  const handleToggleComments = (postId) => {
    setOpenComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
    if (!openComments[postId]) fetchUpdatedComments(postId);
  };

  const fetchUpdatedComments = (postId) => {
    axios
      .get(`http://localhost:8081/comments/post/${postId}`, {
        withCredentials: true,
      })
      .then((response) => {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.postId === postId ? { ...post, comments: response.data } : post
          )
        );
      })
      .catch((error) => console.error("Error fetching comments:", error));
  };

  const handleCommentChange = (e, postId) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: e.target.value }));
  };

  const handleAddComment = async (postId) => {
    const commentText = commentInputs[postId];
    if (!commentText) return;

    try {
      await axios.post("http://localhost:8081/comments/add", null, {
        params: { postId, commentText },
        withCredentials: true,
      });
      fetchUpdatedComments(postId);
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Error adding comment.");
    }
  };

  const handleEditComment = (postId, comment) => {
    const newText = prompt("Edit your comment:", comment.commentText);
    if (newText?.trim()) {
      axios
        .put(
          `http://localhost:8081/comments/update/${comment.commentId}`,
          null,
          {
            params: {
              newCommentText: newText,
            },
            withCredentials: true,
          }
        )
        .then(() => fetchUpdatedComments(postId))
        .catch((err) => console.error("Error updating comment:", err));
    }
  };

  const handleDeleteComment = (postId, commentId) => {
    if (window.confirm("Delete this comment permanently?")) {
      axios
        .delete(`http://localhost:8081/comments/delete/${commentId}`, {
          withCredentials: true,
        })
        .then(() => fetchUpdatedComments(postId))
        .catch((err) => console.error("Error deleting comment:", err));
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Nav />

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/5 bg-white p-4 shadow hidden lg:block overflow-y-auto">
          <LeftBar />
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {/* Create Post Section */}
          <div className="bg-white p-4 rounded-2xl shadow mb-6">
            <form onSubmit={handlePostSubmit} encType="multipart/form-data">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={userImage}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border-2 border-white cursor-pointer"
                  onClick={() => navigate("/profile")}
                />
                <input
                  type="text"
                  placeholder="What's on your mind?"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className="flex-1 bg-gray-100 p-2 rounded-full px-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  type="submit"
                  className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg text-sm transition"
                >
                  Post
                </button>
              </div>

              <hr className="my-4" />

              <div className="flex justify-around text-gray-500 text-sm">
                <label className="flex items-center gap-1 cursor-pointer">
                  📷 Photos
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setMediaFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  🎥 Videos
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setMediaFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>
            </form>
          </div>

          {/* Posts Feed */}
          <div className="space-y-6">
            {posts.length === 0 ? (
              <p className="text-center text-gray-500">No posts to show</p>
            ) : (
              posts
                .slice()
                .reverse()
                .map((post) => (
                  <div
                    key={post.postId}
                    className="bg-white p-6 rounded-2xl shadow-md"
                  >
                    {/* Post Header */}
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={post.userImageUrl || "/default-avatar.png"}
                        alt="Avatar"
                        className="w-12 h-12 rounded-full object-cover cursor-pointer"
                        onClick={() => navigate(`/profile/${post.userId}`)}
                      />
                      <div>
                        <h3 className="font-semibold">
                          {post.firstName} {post.lastName}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          {new Date(post.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Post Content */}
                    <p className="text-gray-800 mb-4">{post.textContent}</p>

                    {/* Media Content */}
                    {post.mediaUrl && (
                      <div className="rounded-lg overflow-hidden mb-4">
                        {post.mediaUrl.endsWith(".mp4") ? (
                          <video
                            controls
                            className="w-full max-h-[500px] object-cover"
                          >
                            <source src={post.mediaUrl} type="video/mp4" />
                          </video>
                        ) : (
                          <img
                            src={post.mediaUrl}
                            alt="Post media"
                            className="w-full max-h-[500px] object-cover"
                          />
                        )}
                      </div>
                    )}

                    {/* Post Actions */}
                    <div className="flex items-center justify-between text-gray-600 mt-4">
                      <button className="hover:text-blue-500">👍 Like</button>
                      <button
                        onClick={() => handleToggleComments(post.postId)}
                        className="hover:text-blue-500"
                      >
                        💬 {post.comments?.length || 0} Comments
                      </button>
                      <button className="hover:text-blue-500">🔗 Share</button>
                    </div>

                    {/* Comments Section */}
                    {openComments[post.postId] && (
                      <div className="mt-4 space-y-4">
                        {post.comments?.map((comment, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <img
                              src={comment.userImage || "/default-avatar.png"}
                              alt="Avatar"
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div className="bg-gray-100 p-2 rounded-lg flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-semibold">
                                    {comment.userFirstName}
                                  </p>
                                  <p>{comment.commentText}</p>
                                </div>

                                {comment?.userId === users?.id && (
                                  <div className="flex gap-2 text-sm">
                                    <button
                                      onClick={() =>
                                        handleEditComment(post.postId, comment)
                                      }
                                      className="text-gray-600 hover:text-blue-500"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteComment(
                                          post.postId,
                                          comment.commentId
                                        )
                                      }
                                      className="text-gray-600 hover:text-red-500"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Add Comment */}
                        <div className="flex items-center gap-2">
                          <img
                            src={user?.imageUrl || "/default-avatar.png"}
                            alt="Avatar"
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <input
                            type="text"
                            value={commentInputs[post.postId] || ""}
                            onChange={(e) =>
                              handleCommentChange(e, post.postId)
                            }
                            placeholder="Write a comment..."
                            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                          <button
                            onClick={() => handleAddComment(post.postId)}
                            className="text-blue-500 font-semibold hover:text-blue-600"
                          >
                            Post
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>

        <div className="w-1/5 bg-white p-4 shadow hidden lg:block overflow-y-auto">
          <RightBar />
        </div>
      </div>
    </div>
  );
};

export default Home;
