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
} 