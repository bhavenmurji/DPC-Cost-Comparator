import { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

export function PhoneIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M13 8C11.3431 8 10 9.34315 10 11V37C10 38.6569 11.3431 40 13 40H35C36.6569 40 38 38.6569 38 37V11C38 9.34315 36.6569 8 35 8H13Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M20 12H28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="24" cy="35" r="2" fill="currentColor"/>
      <path d="M15 18H33V30H15V18Z" stroke="currentColor" strokeWidth="2"/>
    </svg>
  )
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="8" y="12" width="32" height="28" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 20H40" stroke="currentColor" strokeWidth="2"/>
      <path d="M16 8V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M32 8V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="24" cy="28" r="3" fill="currentColor"/>
    </svg>
  )
}

export function MoneyIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="2"/>
      <path d="M24 14V16M24 32V34" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M19 21C19 18.7909 21.2386 17 24 17C26.7614 17 29 18.7909 29 21C29 23.2091 26.7614 25 24 25C21.2386 25 19 26.7909 19 29C19 31.2091 21.2386 33 24 33C26.7614 33 29 31.2091 29 29" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

export function ClockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="2"/>
      <path d="M24 16V24L30 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function DoctorIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="24" cy="14" r="6" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 40V36C12 31.5817 15.5817 28 20 28H28C32.4183 28 36 31.5817 36 36V40" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M24 32V38M21 35H27" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

export function LocationIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M24 42C24 42 38 30 38 20C38 12.268 31.732 6 24 6C16.268 6 10 12.268 10 20C10 30 24 42 24 42Z" stroke="currentColor" strokeWidth="2"/>
      <circle cx="24" cy="20" r="5" stroke="currentColor" strokeWidth="2"/>
    </svg>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="2"/>
      <path d="M16 24L22 30L32 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function HeartIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M24 42L21.09 39.36C11.04 30.27 4 23.92 4 16.05C4 9.7 8.98 4.75 15.35 4.75C18.96 4.75 22.43 6.44 24 9.18C25.57 6.44 29.04 4.75 32.65 4.75C39.02 4.75 44 9.7 44 16.05C44 23.92 36.96 30.27 26.91 39.36L24 42Z" stroke="currentColor" strokeWidth="2"/>
    </svg>
  )
}

export function StethoscopeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12 8V20C12 26.6274 17.3726 32 24 32V32C30.6274 32 36 26.6274 36 20V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 8H16M32 8H40" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M24 32V36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="24" cy="40" r="4" stroke="currentColor" strokeWidth="2"/>
    </svg>
  )
}
