import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const UserProfiles = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    // Fetch user data
    fetch(`http://localhost:8081/user/${userId}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.error("Error fetching user:", err));

    // Fetch user posts
    fetch(`http://localhost:8081/posts/user/${userId}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.reverse());
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching posts:", err);
        setLoading(false);
      });
  }, [userId]);

  // Fetch comments for each post
  const fetchComments = async (postId) => {
    try {
      const res = await fetch(`http://localhost:8081/comments/post/${postId}`, {
        credentials: "include",
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error fetching comments:", err);
      return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-indigo-700 font-medium">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center text-red-600">
          <p className="text-xl font-medium">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* User Profile Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-10">
          <div className="md:flex">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-500 md:w-1/3 p-10 flex items-center justify-center">
              <img
                src={user.imageUrl || "https://via.placeholder.com/150"}
                alt={user.firstName}
                className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg"
              />
            </div>
            <div className="p-8 md:w-2/3 flex flex-col justify-center">
              <h2 className="text-3xl font-bold text-gray-800">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-lg text-gray-600 mt-2">{user.email}</p>
              <div className="mt-6 flex space-x-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-800">
                    {posts.length}
                  </p>
                  <p className="text-sm text-gray-500">Posts</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 inline-block pb-2 border-b-2 border-indigo-500">
            Posts Gallery
          </h3>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl shadow">
            <p className="text-xl text-gray-500">No posts yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard
                key={post.postId}
                post={post}
                fetchComments={fetchComments}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const PostCard = ({ post, fetchComments }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
      {/* Post Media/Content */}
      <div className="relative aspect-square overflow-hidden">
        {post.mediaUrl ? (
          <img
            src={post.mediaUrl}
            alt="Post"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center p-6">
            <p className="text-gray-700 text-center font-medium">
              {post.textContent}
            </p>
          </div>
        )}

        {/* Timestamp */}
        <div className="absolute bottom-0 right-0 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-tl-md">
          {new Date(post.createdAt).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </div>
      </div>

      {/* Post Caption */}
      {post.textContent && post.mediaUrl && (
        <div className="p-4 border-b">
          <p className="text-gray-700">{post.textContent}</p>
        </div>
      )}

      {/* Comments Section */}
      <div className="p-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
        >
          <span>{isExpanded ? "Hide Comments" : "Show Comments"}</span>
          <svg
            className={`ml-1 w-4 h-4 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </button>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t">
            <Comments postId={post.postId} fetchComments={fetchComments} />
          </div>
        )}
      </div>
    </div>
  );
};

// Comments component
const Comments = ({ postId, fetchComments }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadComments = async () => {
      setLoading(true);
      const data = await fetchComments(postId);
      setComments(data);
      setLoading(false);
    };
    loadComments();
  }, [postId, fetchComments]);

  if (loading) {
    return (
      <p className="text-sm text-gray-500 text-center py-2">
        Loading comments...
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {comments.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-2">
          No comments yet.
        </p>
      ) : (
        comments.map((comment) => (
          <div key={comment.commentId} className="flex space-x-3">
            <img
              src={comment.userImage || "https://via.placeholder.com/40"}
              alt={comment.userFirstName}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-gray-800">
                  {comment.userFirstName}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(comment.createdAt).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </p>
              </div>
              <p className="text-sm text-gray-700">{comment.commentText}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default UserProfiles;
