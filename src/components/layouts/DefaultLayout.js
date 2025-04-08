import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Sidebar } from '../Sidebar';
export function DefaultLayout({ children }) {
    return (_jsxs("div", { className: "flex h-screen bg-gray-100", children: [_jsx(Sidebar, {}), _jsx("main", { className: "flex-1 p-8 overflow-y-auto", children: children })] }));
}
