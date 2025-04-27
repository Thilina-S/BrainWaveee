import './DarkMoode.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLightbulb } from '@fortawesome/free-solid-svg-icons';

export default function DarkMode() {
  function DarkHandel() {
    document.body.classList.toggle('darkmood');
  }

  return (
    <div className="dark-mode-icon">
      <FontAwesomeIcon 
        icon={faLightbulb} 
        onClick={DarkHandel} 
        className="dark-mood-icon" 
      />
    </div>
  );
}
