import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from '../Context/AppContext';

import Friend from '../assets/icons/1.png';
import Group from '../assets/icons/2.png';
import Market from '../assets/icons/3.png';
import Watch from '../assets/icons/4.png';
import Gallery from '../assets/icons/5.png';
import Video from '../assets/icons/6.png';
import Message from '../assets/icons/7.png';

export default function LeftBar() {
  const { user } = useContext(AppContext);
  const userImage = user?.imageUrl || 'path/to/default-image.jpg';

  return (
    <div 
      className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 p-4 shadow-lg rounded-r-xl overflow-y-auto"
      style={{ backgroundColor: 'var(--color-card)', color: 'var(--text-color)' }}
    >
      {/* Top Section */}
      <div className="space-y-6">
        <Link to="/profile/id" className="flex items-center space-x-3">
          <img src={userImage} alt="User" className="w-12 h-12 rounded-full object-cover" />
          <h4 className="font-semibold" style={{ color: 'var(--text-color)' }}>
            {user?.name || 'User Name'}
          </h4>
        </Link>

        <div className="space-y-4">
          <MenuItem icon={Friend} title="Friends" link="/" />
          <MenuItem icon={Group} title="Groups" link="/" />
          <MenuItem icon={Market} title="Market" link="/" />
          <MenuItem icon={Watch} title="Watch" link="/" />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-8 space-y-4">
        <hr className="border-gray-200" />
        <h4 className="text-sm uppercase" style={{ color: 'var(--text-color)' }}>
          Your Shortcuts
        </h4>
        <MenuItem icon={Gallery} title="Gallery" link="/" />
        <MenuItem icon={Video} title="Videos" link="/" />
        <MenuItem icon={Message} title="Messages" link="/" />
      </div>

    </div>
  );
}

function MenuItem({ icon, title, link }) {
  return (
    <Link 
      to={link} 
      className="flex items-center space-x-3 p-2 rounded-md transition"
      style={{ color: 'var(--text-color)' }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-soft)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <img src={icon} alt={title} className="w-6 h-6" />
      <h4 className="font-medium">{title}</h4>
    </Link>
  );
}
