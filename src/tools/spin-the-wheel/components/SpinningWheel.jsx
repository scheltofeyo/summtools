import { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { WHEEL_SPIN_DURATION } from '../constants/timings';

const COLORS = [
  '#8B5CF6', '#6366F1', '#3B82F6', '#06B6D4',
  '#10B981', '#F59E0B', '#EF4444', '#EC4899',
  '#A855F7', '#0EA5E9', '#14B8A6', '#F97316'
];

export function SpinningWheel({ names, isSpinning, onSpinComplete, rotation }) {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 600 });
  const previousIsSpinningRef = useRef(isSpinning);
  const [easingCurve, setEasingCurve] = useState([0.33, 0, 0.15, 1]);
  const [currentRotation, setCurrentRotation] = useState(0);
  const animationCompleteRef = useRef(true);

  useEffect(() => {
    const updateDimensions = () => {
      const size = Math.min(window.innerWidth - 100, window.innerHeight - 300, 600);
      setDimensions({ width: Math.max(size, 200), height: Math.max(size, 200) });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || names.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const radius = Math.max((dimensions.width / 2) - 10, 20);

    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Draw wheel segments
    const anglePerSegment = (2 * Math.PI) / names.length;

    names.forEach((name, index) => {
      const startAngle = index * anglePerSegment;
      const endAngle = startAngle + anglePerSegment;
      const color = COLORS[index % COLORS.length];

      // Draw segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      // Draw border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + anglePerSegment / 2);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(14, dimensions.width / 30)}px Arial`;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // Truncate long names
      const maxLength = 12;
      const displayName = name.length > maxLength ? name.substring(0, maxLength - 3) + '...' : name;
      ctx.fillText(displayName, radius * 0.65, 0);
      ctx.restore();
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI);
    ctx.fillStyle = '#2c3e50';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.stroke();
  }, [names, dimensions]);

  useEffect(() => {
    // Start animation when spin begins
    if (isSpinning && !previousIsSpinningRef.current) {
      const x1 = 0.25 + Math.random() * 0.1;
      const y1 = 0.9 + Math.random() * 0.08;
      const x2 = 0.65 + Math.random() * 0.1;
      const y2 = 0.98 + Math.random() * 0.015;

      setEasingCurve([x1, y1, x2, y2]);
      setCurrentRotation(rotation);
      animationCompleteRef.current = false;
    }

    // Calculate winner when spin stops
    if (!isSpinning && previousIsSpinningRef.current) {
      const normalizedRotation = ((rotation % 360) + 360) % 360;
      const segmentAngle = 360 / names.length;
      const pointerAngle = 270;
      const angleAtPointer = (pointerAngle - normalizedRotation + 360) % 360;
      const winningIndex = Math.floor(angleAtPointer / segmentAngle) % names.length;
      if (names[winningIndex]) {
        onSpinComplete(names[winningIndex], winningIndex);
      }
    }

    previousIsSpinningRef.current = isSpinning;
  }, [isSpinning, rotation, names, onSpinComplete]);

  return (
    <div className="relative flex items-center justify-center">
      {/* Pointer at the top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10" style={{ marginTop: '-20px' }}>
        <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-red-500 drop-shadow-lg" />
      </div>

      {/* Spinning wheel */}
      <motion.div
        animate={{ rotate: currentRotation }}
        transition={{
          duration: !animationCompleteRef.current ? WHEEL_SPIN_DURATION : 0,
          ease: !animationCompleteRef.current ? easingCurve : 'linear'
        }}
        onAnimationComplete={() => {
          animationCompleteRef.current = true;
        }}
        className="drop-shadow-2xl"
      >
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="rounded-full"
        />
      </motion.div>
    </div>
  );
}
