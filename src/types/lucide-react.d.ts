declare module 'lucide-react' {
  import { FC, SVGProps } from 'react'

  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number | string
    color?: string
    strokeWidth?: number | string
  }

  export type Icon = FC<IconProps>

  export const UserCog: Icon
  export const Search: Icon
  export const Filter: Icon
  export const Plus: Icon
  export const Calendar: Icon
  export const Users: Icon
  export const Building2: Icon
  export const Star: Icon
  export const Loader2: Icon
  export const FileText: Icon
  export const Mail: Icon
  export const MessageSquare: Icon
  export const BarChart: Icon
  export const Home: Icon
  export const Settings: Icon
  export const User: Icon
  export const LogOut: Icon
  export const ChevronDown: Icon
  export const ChevronUp: Icon
  export const Menu: Icon
  export const X: Icon
  export const Check: Icon
  export const AlertTriangle: Icon
  export const Info: Icon
  export const Bell: Icon
  export const Clock: Icon
  export const Edit: Icon
  export const Trash: Icon
  export const Eye: Icon
  export const EyeOff: Icon
  export const Shield: Icon
  export const Brain: Icon
  export const Database: Icon
  export const Layout: Icon
  export const Link: Icon
  export const UserPlus: Icon
  export const Key: Icon
  export const Palette: Icon
  export const CheckCircle: Icon
  export const XCircle: Icon
} 