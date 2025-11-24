import { useEffect, useState } from 'react';

interface AnimatedGaugeProps {
  value: number; // 0-100
  label: string;
  unit?: string;
  color?: string;
  maxValue?: number;
}

export function AnimatedGauge({ 
  value, 
  label, 
  unit = '%', 
  color = '#00d9ff',
  maxValue = 100 
}: AnimatedGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  
  useEffect(() => {
    // Animate the gauge needle
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepValue = value / steps;
    const stepDuration = duration / steps;
    
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setAnimatedValue(Math.min(stepValue * currentStep, value));
      
      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, stepDuration);
    
    return () => clearInterval(interval);
  }, [value]);
  
  // Calculate needle rotation (starts at -140deg, ends at 140deg = 280deg range)
  const rotation = -140 + (animatedValue / maxValue) * 280;
  
  // Generate major tick marks (every 20 units)
  const majorTicks = Array.from({ length: 6 }, (_, i) => {
    const tickValue = i * 20;
    const angle = -140 + (tickValue / maxValue) * 280;
    return { value: tickValue, angle };
  });
  
  // Generate minor tick marks
  const minorTicks = Array.from({ length: 21 }, (_, i) => {
    const tickValue = i * 5;
    const angle = -140 + (tickValue / maxValue) * 280;
    return { value: tickValue, angle };
  });
  
  return (
    <div className="relative w-full aspect-square max-w-[300px] mx-auto">
      {/* Outer glow effect */}
      <div 
        className="absolute inset-0 rounded-full blur-2xl opacity-40"
        style={{
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        }}
      />
      
      {/* Main gauge container */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-900 via-black to-slate-900 shadow-2xl">
        
        {/* Glowing outer ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            className="opacity-80"
            style={{
              filter: `drop-shadow(0 0 8px ${color}) drop-shadow(0 0 16px ${color})`,
            }}
          />
        </svg>
        
        {/* Inner dark circle */}
        <div className="absolute inset-[8%] rounded-full bg-gradient-to-br from-slate-950 via-black to-slate-950" />
        
        {/* Minor tick marks */}
        {minorTicks.map((tick, i) => (
          <div
            key={`minor-${i}`}
            className="absolute top-1/2 left-1/2 origin-left"
            style={{
              transform: `rotate(${tick.angle}deg)`,
              width: '48%',
              height: '1px',
            }}
          >
            <div 
              className="absolute right-0 w-2 h-0.5 bg-slate-600"
              style={{ opacity: 0.4 }}
            />
          </div>
        ))}
        
        {/* Major tick marks */}
        {majorTicks.map((tick, i) => (
          <div
            key={`major-${i}`}
            className="absolute top-1/2 left-1/2 origin-left"
            style={{
              transform: `rotate(${tick.angle}deg)`,
              width: '48%',
              height: '2px',
            }}
          >
            <div 
              className="absolute right-0 w-4 h-0.5"
              style={{ 
                backgroundColor: color,
                boxShadow: `0 0 4px ${color}`,
              }}
            />
          </div>
        ))}
        
        {/* Numbers around the gauge */}
        {majorTicks.map((tick) => {
          const angle = tick.angle;
          const radian = (angle * Math.PI) / 180;
          const radius = 38; // percentage
          const x = 50 + radius * Math.cos(radian);
          const y = 50 + radius * Math.sin(radian);
          
          return (
            <div
              key={tick.value}
              className="absolute text-sm sm:text-base font-bold tabular-nums"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
                color: color,
                textShadow: `0 0 8px ${color}`,
              }}
            >
              {tick.value}
            </div>
          );
        })}
        
        {/* Center hub */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="w-16 h-16 rounded-full"
            style={{
              background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
            }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-800 via-slate-900 to-black shadow-lg flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 shadow-inner" />
            </div>
          </div>
        </div>
        
        {/* Needle */}
        <div
          className="absolute top-1/2 left-1/2 origin-left transition-transform duration-300 ease-out z-20"
          style={{
            transform: `rotate(${rotation}deg)`,
            width: '42%',
            height: '4px',
            marginTop: '-2px',
          }}
        >
          {/* Needle shadow/glow */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(to right, #dc2626 0%, #ef4444 50%, #f87171 100%)',
              filter: 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.8))',
            }}
          />
          {/* Needle tip */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full shadow-lg" />
        </div>
        
        {/* Center dot over needle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-lg z-30" />
        
        {/* Value display in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-20">
          <div 
            className="text-4xl sm:text-5xl font-bold tabular-nums tracking-tight"
            style={{
              color: color,
              textShadow: `0 0 12px ${color}`,
            }}
          >
            {Math.round(animatedValue)}
            <span className="text-2xl sm:text-3xl ml-1 opacity-80">{unit}</span>
          </div>
          <div 
            className="text-xs sm:text-sm mt-2 uppercase tracking-wider font-medium"
            style={{
              color: color,
              opacity: 0.7,
            }}
          >
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}

