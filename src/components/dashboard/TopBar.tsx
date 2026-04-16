import { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

interface TopBarProps {
  isConnected: boolean;
  useMock: boolean;
}

const TopBar = ({ isConnected, useMock }: TopBarProps) => {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">YT</span>
          </div>
          <span className="text-sm font-semibold text-muted-foreground hidden sm:block">Yash Technology</span>
        </div>
        <div className="h-6 w-px bg-border" />
        <h1 className="text-lg font-bold tracking-tight">
          <span className="text-primary glow-text">EDGE AI</span>
          <span className="text-muted-foreground font-normal ml-2 hidden md:inline">Predictive Maintenance Dashboard</span>
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <time className="text-sm text-muted-foreground font-mono hidden sm:block">
          {dateTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          {' · '}
          {dateTime.toLocaleTimeString('en-US', { hour12: false })}
        </time>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
          isConnected && !useMock
            ? 'bg-status-normal status-normal'
            : useMock
              ? 'bg-status-warning status-warning'
              : 'bg-status-critical status-critical'
        }`}>
          {isConnected && !useMock ? (
            <><Wifi size={12} /><span>Connected</span></>
          ) : useMock ? (
            <><WifiOff size={12} /><span>Demo Mode</span></>
          ) : (
            <><WifiOff size={12} /><span>Disconnected</span></>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
