import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Nav from '../Component/Nav';
import LeftBar from '../Component/LeftBar';
import RightBar from '../Component/RightBar';

const Home = () => {
  const [user, setUser] = useState(null);
  const [textContent, setTextContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});
  const [openComments, setOpenComments] = useState({});

  useEffect(() => {
    axios.get('http://localhost:8081/user-info', { withCredentials: true })
      .then(response => setUser(response.data))
      .catch(error => console.error('Failed to fetch user data:', error));
  }, []);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = () => {
    axios.get('http://localhost:8081/posts/all', { withCredentials: true })
      .then(response => {
        const postsWithComments = response.data.map(post => ({
          ...post,
          comments: []
        }));
        setPosts(postsWithComments);
      })
      .catch(error => console.error('Error fetching posts:', error));
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!textContent && !mediaFile) {
      alert('Please enter some text or upload a media file.');
      return;
    }

    const formData = new FormData();
    formData.append('textContent', textContent);
    if (mediaFile) {
      formData.append('mediaFile', mediaFile);
    }

    try {
      const response = await axios.post('http://localhost:8081/posts/create', formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Post created successfully!');
      setTextContent('');
      setMediaFile(null);
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error creating post.');
    }
  };

  const handleToggleComments = (postId) => {
    setOpenComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleCommentChange = (e, postId) => {
    setCommentInputs(prev => ({ ...prev, [postId]: e.target.value }));
  };

  const handleAddComment = (postId) => {
    const text = commentInputs[postId];
    if (!text) return;

    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.postId === postId
          ? {
              ...post,
              comments: [...(post.comments || []), { user: user?.firstName, text }]
            }
          : post
      )
    );

    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Nav />
      <div className="flex">
        <div className="w-1/5 bg-white p-4 shadow hidden lg:block">
          <LeftBar />
        </div>

        <div className="flex-1 p-6">
          {/* Create Post */}
          <div className="bg-white p-4 rounded-2xl shadow mb-6">
            <form onSubmit={handlePostSubmit} encType="multipart/form-data">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={user?.profilePicture || '/default-avatar.png'}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full object-cover"
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
                  📷 <span>Photos</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setMediaFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  🎥 <span>Videos</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setMediaFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>
                <div className="flex items-center gap-1 cursor-pointer">
                  🏷️ <span>Tag</span>
                </div>
                <div className="flex items-center gap-1 cursor-pointer">
                  😊 <span>Feelings</span>
                </div>
              </div>
            </form>
          </div>

          {/* Posts */}
          <div className="space-y-6">
            {posts.length === 0 ? (
              <p>No posts yet.</p>
            ) : (
              posts.slice().reverse().map(post => (
                <div
                  key={post.postId}
                  className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Post Header */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold">
                      {post.firstName?.[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold">{post.firstName}</h3>
                      <p className="text-gray-500 text-sm">
                        {new Date(post.createdAt).toLocaleString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Post Text */}
                  <p className="text-gray-800 mb-4">{post.textContent}</p>

                  {/* Post Media */}
                  {post.mediaUrl && (
                    <div className="rounded-lg overflow-hidden mb-4">
                      {post.mediaUrl.endsWith('.mp4') || post.mediaUrl.endsWith('.mov') || post.mediaUrl.endsWith('.avi') ? (
                        <video controls className="w-full max-h-[500px] object-cover rounded-lg">
                          <source src={post.mediaUrl} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <img
                          src={post.mediaUrl}
                          alt="Post media"
                          className="w-full max-h-[500px] object-cover rounded-lg"
                        />
                      )}
                    </div>
                  )}

                  {/* Like, Comment, Share Buttons */}
                  <div className="flex items-center justify-between text-gray-600 mt-4">
                    <button className="hover:text-blue-500">👍 Like</button>
                    <button onClick={() => handleToggleComments(post.postId)} className="hover:text-blue-500">💬 Comment</button>
                    <button className="hover:text-blue-500">🔗 Share</button>
                  </div>

                  {/* Comments Section */}
                  {openComments[post.postId] && (
                    <div className="mt-4 space-y-4">
                      {post.comments && post.comments.map((comment, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold">
                            {comment.user?.[0]}
                          </div>
                          <div className="bg-gray-100 p-2 rounded-lg">
                            <p className="font-semibold">{comment.user}</p>
                            <p>{comment.text}</p>
                          </div>
                        </div>
                      ))}

                      {/* Add Comment */}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-300 flex items-center justify-center text-xs font-bold">
                          {user?.firstName?.[0]}
                        </div>
                        <input
                          type="text"
                          value={commentInputs[post.postId] || ''}
                          onChange={(e) => handleCommentChange(e, post.postId)}
                          placeholder="Write a comment..."
                          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <button onClick={() => handleAddComment(post.postId)} className="text-blue-500 font-semibold">
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

        <div className="w-1/5 bg-white p-4 shadow hidden lg:block">
          <RightBar />
        </div>
      </div>
    </div>
  );
};

export default Home;
