import { ReactNode, useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export default function Tooltip({
  content,
  children,
  position = 'top',
  className = ''
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && tooltipRef.current && containerRef.current) {
      const tooltip = tooltipRef.current;
      const container = containerRef.current;
      const tooltipRect = tooltip.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const padding = 16;

      let newPosition = position;

      if (position === 'top' || position === 'bottom') {
        if (tooltipRect.left < padding) {
          tooltip.style.left = `${padding - containerRect.left}px`;
          tooltip.style.transform = 'translateX(0)';
        } else if (tooltipRect.right > viewportWidth - padding) {
          tooltip.style.left = 'auto';
          tooltip.style.right = `${padding}px`;
          tooltip.style.transform = 'translateX(0)';
        }

        if (position === 'top' && tooltipRect.top < padding) {
          newPosition = 'bottom';
        } else if (position === 'bottom' && tooltipRect.bottom > viewportHeight - padding) {
          newPosition = 'top';
        }
      }

      if (position === 'left' && tooltipRect.left < padding) {
        newPosition = 'right';
      } else if (position === 'right' && tooltipRect.right > viewportWidth - padding) {
        newPosition = 'left';
      }

      if (newPosition !== adjustedPosition) {
        setAdjustedPosition(newPosition);
      }
    }
  }, [isVisible, position, adjustedPosition]);

  const getPositionClasses = () => {
    switch (adjustedPosition) {
      case 'top':
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    }
  };

  const getArrowClasses = () => {
    switch (adjustedPosition) {
      case 'top':
        return 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800 dark:border-t-white';
      case 'bottom':
        return 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-800 dark:border-b-white';
      case 'left':
        return 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-800 dark:border-l-white';
      case 'right':
        return 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-800 dark:border-r-white';
      default:
        return 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800 dark:border-t-white';
    }
  };

  const handleMouseEnter = () => {
    setIsVisible(true);
    setAdjustedPosition(position);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  if (!content) return <>{children}</>;

  return (
    <div
      ref={containerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={`absolute z-50 px-3 py-2 text-xs font-medium text-white bg-gray-800 dark:bg-white dark:text-gray-900 rounded-lg shadow-lg whitespace-normal break-words min-w-[200px] max-w-[280px] sm:min-w-[240px] sm:max-w-[320px] pointer-events-none transition-all duration-200 ${
          isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'
        } ${getPositionClasses()}`}
        role="tooltip"
      >
        {content}

        {/* Arrow */}
        <div
          className={`absolute w-0 h-0 border-4 ${getArrowClasses()}`}
        />
      </div>
    </div>
  );
}