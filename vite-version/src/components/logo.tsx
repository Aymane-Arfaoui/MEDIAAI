import * as React from "react"

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number
}

export function Logo({ size = 24, className, ...props }: LogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <rect x="2" y="2" width="28" height="28" rx="6" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M16 7L16 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="16" cy="16" r="5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M16 14V18M14 16H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M8 24H24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M10 21H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5"/>
    </svg>
  )
}

export function LogoText({ className }: { className?: string }) {
  return (
    <span className={className}>AI CEO</span>
  )
}
