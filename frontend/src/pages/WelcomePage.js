import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';

function WelcomePage() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const controls = useAnimation();

  // Detect if mobile (screen width < 480px)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 480);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 480);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      navigate('/login');
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);

    controls.start({
      width: `${((5 - countdown + 1) / 5) * 100}%`,
      transition: { duration: 1, ease: 'linear' },
    });

    return () => clearTimeout(timer);
  }, [countdown, navigate, controls]);

  const handleEnterNow = () => {
    navigate('/login');
  };

  // Dynamic styles based on isMobile
  const cardStyle = {
    ...styles.card,
    padding: isMobile ? '30px 20px' : '60px',
    maxWidth: isMobile ? '95%' : '600px',  // widened to 95% for mobile
    borderRadius: isMobile ? '20px' : '30px',
    boxSizing: 'border-box',  // prevent overflow due to padding
  };

  const headingStyle = {
    ...styles.heading,
    fontSize: isMobile ? '1.8rem' : '2.7rem',
    wordWrap: 'break-word',  // wrap long text nicely
    lineHeight: isMobile ? '2.2rem' : '3.5rem',  // better line height for mobile
  };

  const subtextStyle = {
    ...styles.subtext,
    fontSize: isMobile ? '1rem' : '1.2rem',
    marginBottom: isMobile ? '20px' : '30px',
  };

  const enterButtonStyle = {
    ...styles.enterButton,
    padding: isMobile ? '12px 30px' : '15px 40px',
    fontSize: isMobile ? '1rem' : '1.3rem',
    borderRadius: isMobile ? '20px' : '30px',
    width: isMobile ? '100%' : 'auto',  // full width button on mobile
  };

  return (
    <div style={styles.bg}>
      {/* Floating Emojis */}
      {['🍕', '🍔', '🥗', '🍣', '🍩'].map((emoji, idx) => (
        <motion.div
          key={idx}
          animate={{ y: [0, -20, 0] }}
          transition={{
            repeat: Infinity,
            duration: 3 + idx,
            delay: idx * 0.5,
          }}
          style={{
            ...styles.emoji,
            left: isMobile
              ? `${5 + idx * 18}%`  // shifted slightly left on mobile
              : `${10 + idx * 15}%`,
            top: isMobile
              ? `${10 + (idx % 2) * 10}%`  // shifted up on mobile
              : `${15 + (idx % 2) * 10}%`,
            fontSize: isMobile ? '2rem' : '3rem',
          }}
        >
          {emoji}
        </motion.div>
      ))}

      {/* Welcome Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: [1, 1.03, 1] }}
        transition={{ duration: 2, repeat: Infinity, repeatType: 'mirror' }}
        style={cardStyle}
      >
        <h1 style={headingStyle}>
          Welcome to <span style={styles.brand}>SmartServe</span> 🍽️
        </h1>
        <p style={subtextStyle}>Serving food, smartly & fast – just for you.</p>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleEnterNow}
          style={enterButtonStyle}
        >
          Enter Now
        </motion.button>

        <div style={styles.progressBarBackground}>
          <motion.div
            animate={controls}
            initial={{ width: '0%' }}
            style={styles.progressBarFill}
          />
        </div>
      </motion.div>

      <motion.div
        style={styles.animatedBackground}
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
      />
    </div>
  );
}

const styles = {
  bg: {
    height: '100vh',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: '10px',  // small padding to avoid edges on mobile
  },
  emoji: {
    position: 'absolute',
    pointerEvents: 'none',
    userSelect: 'none',
  },
  card: {
    background: 'white',
    padding: '60px',
    borderRadius: '30px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    textAlign: 'center',
    maxWidth: '600px',
    position: 'relative',
    zIndex: 2,
  },
  heading: {
    fontSize: '2.7rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '20px',
  },
  brand: {
    background: 'linear-gradient(90deg, #ff6a00, #ee0979)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtext: {
    fontSize: '1.2rem',
    color: '#666',
    marginBottom: '30px',
  },
  enterButton: {
    background: 'linear-gradient(90deg, #ff6a00, #ee0979)',
    border: 'none',
    borderRadius: '30px',
    padding: '15px 40px',
    fontSize: '1.3rem',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 6px 15px rgba(238, 9, 121, 0.6)',
    marginBottom: '30px',
    userSelect: 'none',
  },
  progressBarBackground: {
    width: '100%',
    height: '6px',
    backgroundColor: '#eee',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #ff6a00, #ee0979)',
    borderRadius: '4px',
  },
  animatedBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '200%',
    height: '100%',
    background: 'linear-gradient(270deg, #fcb69f, #ffecd2, #fcb69f)',
    backgroundSize: '400% 400%',
    zIndex: 1,
    opacity: 0.3,
  },
};

export default WelcomePage;
