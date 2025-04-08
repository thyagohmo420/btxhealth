import { jsx as _jsx } from "react/jsx-runtime";
import { Toaster } from 'sonner';
export default function Toast() {
    return (_jsx(Toaster, { position: "top-right", expand: false, richColors: true, closeButton: true, theme: "light" }));
}
