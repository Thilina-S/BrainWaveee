import React, { useEffect, useState } from 'react';
import axios from 'axios';

export const UserProfile = () => {
  const [posts, setPosts] = useState([]);
  const [editPostId, setEditPostId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editMedia, setEditMedia] = useState(null);

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const fetchMyPosts = async () => {
    try {
      const res = await axios.get('http://localhost:8081/posts/my-posts', { withCredentials: true });
      setPosts(res.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`http://localhost:8081/posts/delete/${postId}`, { withCredentials: true });
        alert('Post deleted successfully.');
        fetchMyPosts();
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post.');
      }
    }
  };

  const handleEdit = (post) => {
    setEditPostId(post.postId);
    setEditText(post.textContent);
    setEditMedia(null);
  };

  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append('textContent', editText);
      if (editMedia) {
        formData.append('mediaFile', editMedia);
      }

      await axios.put(`http://localhost:8081/posts/update/${editPostId}`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Post updated successfully.');
      setEditPostId(null);
      setEditText('');
      setEditMedia(null);
      fetchMyPosts();
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post.');
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-10 text-center text-indigo-600">My Posts</h1>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {posts.map(post => (
          <div key={post.postId} className="relative bg-gray-200 rounded-2xl overflow-hidden shadow-lg group h-96">

            {/* Media */}
            {post.mediaUrl && (
              post.mediaUrl.includes('video') ? (
                <video controls className="w-full h-full object-cover">
                  <source src={post.mediaUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={post.mediaUrl}
                  alt="Post Media"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )
            )}

            {/* Overlay Content */}
            <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={post.userImageUrl}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border-2 border-white"
                />
                <div>
                  <h2 className="font-semibold text-sm">{post.firstName} {post.lastName}</h2>
                  <p className="text-xs">{new Date(post.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* If editing */}
              {editPostId === post.postId ? (
                <div className="text-black">
                  <textarea
                    className="w-full border rounded p-2 mb-2 text-black"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    placeholder="Edit your post..."
                  />
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => setEditMedia(e.target.files[0])}
                    className="mb-2 text-white"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                      onClick={handleUpdate}
                    >
                      Save
                    </button>
                    <button
                      className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
                      onClick={() => {
                        setEditPostId(null);
                        setEditText('');
                        setEditMedia(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-xs line-clamp-2">{post.textContent}</p>

                  {/* Footer */}
                  <div className="flex justify-between text-gray-300 text-[10px] mt-2">
                    <span>14 Likes</span>
                    <span>2 Comments</span>
                    <span>1 Share</span>
                  </div>

                  {/* Edit/Delete buttons */}
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      className="text-blue-400 hover:underline text-xs"
                      onClick={() => handleEdit(post)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-400 hover:underline text-xs"
                      onClick={() => handleDelete(post.postId)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
