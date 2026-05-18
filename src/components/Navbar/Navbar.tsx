import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchQuery } from '../../store/slices/uiSlice';
import type { RootState } from '../../store/store';
import styles from './Navbar.module.css';

const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const searchQuery = useSelector((state: RootState) => state.ui.searchQuery);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(e.target.value));
  };

  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.logo}>
        קריפטונייט
      </Link>
      <div className={styles.navLinks}>
        <Link to="/" className={styles.link}>ראשי</Link>
        <Link to="/reports" className={styles.link}>דוחות בזמן אמת</Link>
        <Link to="/ai-recommendations" className={styles.link}>המלצות AI</Link>
        <Link to="/about" className={styles.link}>אודות</Link>
      </div>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="חפש מטבעות..."
          value={searchQuery}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />
      </div>
    </nav>
  );
};

export default Navbar;
