import React from 'react';
import styles from './About.module.css';

const About: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.glassCard}>
        <div className={styles.contentWrapper}>

          <div className={styles.section}>
            <h1 className={styles.title}>אודות קריפטונייט</h1>
            <p className={styles.text}>
              קריפטונייט היא אפליקציית מעקב בזמן אמת אחר מטבעות קריפטוגרפיים (SPA).
              נבנתה כפרויקט בג'ון ברייס, היא משתמשת ב-React, Redux Toolkit ו-TypeScript
              כדי לספק חוויה חלקה וביצועים גבוהים לניטור שווקי קריפטו חיים,
              כולל גרפים אינטראקטיביים וניתוח השקעות מבוסס בינה מלאכותית (AI).
            </p>
          </div>

          <hr className={styles.divider} />

          <div className={styles.section}>
            <h2 className={styles.subtitle}>פרטי מפתח</h2>
            <div className={styles.profileSection}>
              <div className={styles.avatarWrapper}>
                <img src="/profile.jpg" alt="איתמר הלל" className={styles.avatar} />
              </div>
              <div className={styles.profileInfo}>
                <h3 className={styles.name}>איתמר הלל</h3>
                <div className={styles.tags}>
                  <span className={styles.tag}>סטודנט לפולסטאק - ג'ון ברייס</span>
                </div>
                <p className={styles.text}>
                  איתמר מנתב את כישורי הניתוח והמנהיגות שלו לעולם פיתוח ה-Web פולסטאק.
                  עם רקע חזק כיוצא צבא וסמל מחלקה בכיר לשעבר ביחידה קרבית,
                  הוא מביא איתו משמעת יוצאת דופן, חשיבה אסטרטגית, ותודעה מקצועית גבוהה להנדסת תוכנה.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default About;
