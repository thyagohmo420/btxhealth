import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Wifi, WifiOff } from 'lucide-react';
export default function OnlineStatus() {
    const [isOnline, setIsOnline] = React.useState(navigator.onLine);
    React.useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);
    return (_jsx("div", { className: `fixed bottom-4 right-4 px-4 py-2 rounded-full flex items-center gap-2 ${isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`, children: isOnline ? (_jsxs(_Fragment, { children: [_jsx(Wifi, { className: "w-4 h-4" }), _jsx("span", { className: "text-sm font-medium", children: "Online" })] })) : (_jsxs(_Fragment, { children: [_jsx(WifiOff, { className: "w-4 h-4" }), _jsx("span", { className: "text-sm font-medium", children: "Offline" })] })) }));
}
