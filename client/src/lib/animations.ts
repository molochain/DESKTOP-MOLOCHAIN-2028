/**
 * Animation utilities for micro-interactions
 * These animations provide subtle feedback to user interactions
 */
import { VariantProps, cva } from 'class-variance-authority';
import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names and handles Tailwind conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Button hover effect variants
 */
export const buttonHoverEffect = cva('transition-all duration-300', {
  variants: {
    effect: {
      scale: 'hover:scale-105',
      glow: 'hover:shadow-md hover:shadow-primary/25',
      pulse: 'hover:animate-pulse',
      slide: 'group-hover:translate-x-1',
      bounce: 'hover:animate-bounce', 
      ripple: 'relative overflow-hidden hover:before:opacity-100 before:absolute before:content-[""] before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:opacity-0 before:scale-[8] before:bg-white/20 before:rounded-full before:transition-all before:duration-500',
      ring: 'ring-offset-background transition-all duration-300 hover:ring-2 hover:ring-primary/50 hover:ring-offset-2',
      none: '',
    },
  },
  defaultVariants: {
    effect: 'scale',
  },
});

/**
 * Card hover effect variants
 */
export const cardHoverEffect = cva('transition-all duration-300', {
  variants: {
    effect: {
      lift: 'hover:-translate-y-1 hover:shadow-lg',
      glow: 'hover:shadow-lg hover:shadow-primary/20',
      border: 'hover:border-primary/50',
      scale: 'hover:scale-[1.02]',
      highlight: 'hover:bg-primary/5 hover:border-primary/50',
      tilt: 'hover:rotate-1 hover:-translate-y-1 hover:shadow-lg',
      none: '',
    },
    clickEffect: {
      push: 'active:scale-95',
      bounce: 'active:scale-95 active:duration-75 active:animate-bounce-quick',
      none: '',
    },
  },
  defaultVariants: {
    effect: 'lift',
    clickEffect: 'none',
  },
});

/**
 * Navigation link hover effect variants
 */
export const navLinkHoverEffect = cva('transition-all duration-200 relative', {
  variants: {
    effect: {
      slide: 'after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full',
      glow: 'hover:text-primary hover:bg-primary/5',
      scale: 'hover:scale-105',
      slideDown: 'before:absolute before:top-0 before:left-0 before:w-0 before:h-0.5 before:bg-primary before:transition-all hover:before:w-full',
      fadeBackground: 'hover:bg-primary/10 hover:text-primary',
      none: '',
    },
  },
  defaultVariants: {
    effect: 'slide',
  },
});

/**
 * Alert and toast entrance animations
 */
export const alertAnimation = cva('animate-in', {
  variants: {
    animation: {
      fade: 'fade-in duration-300',
      slideUp: 'slide-in-from-bottom-5 duration-300',
      slideRight: 'slide-in-from-right-5 duration-300',
      zoom: 'zoom-in-90 duration-300',
      bounce: 'slide-in-from-bottom-4 duration-300 ease-out',
      none: '',
    },
  },
  defaultVariants: {
    animation: 'slideRight',
  },
});

/**
 * Content section reveal animations for scroll
 */
export const revealAnimation = cva('', {
  variants: {
    animation: {
      fadeUp: 'animate-reveal-up',
      fadeIn: 'animate-reveal-fade',
      scaleUp: 'animate-reveal-scale',
      slideRight: 'animate-reveal-right',
      slideLeft: 'animate-reveal-left',
      staggered: 'animate-reveal-staggered',
      none: '',
    },
    delay: {
      none: '',
      short: 'animation-delay-100',
      medium: 'animation-delay-300',
      long: 'animation-delay-500',
      longer: 'animation-delay-700',
      longest: 'animation-delay-1000',
    },
  },
  defaultVariants: {
    animation: 'fadeUp',
    delay: 'none',
  },
});

/**
 * Loading animation variants
 */
export const loadingAnimation = cva('', {
  variants: {
    type: {
      spinner: 'animate-spin',
      pulse: 'animate-pulse',
      bounce: 'animate-bounce',
      ping: 'animate-ping',
      shimmer: 'animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent bg-[length:50%_100%] bg-no-repeat',
      progress: 'animate-progress-indeterminate relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-progress-indeterminate before:bg-gradient-to-r before:from-transparent before:via-white before:to-transparent',
      dots: 'animate-dots flex items-center space-x-1 after:content-["."] after:animate-dots-1 after:inline-block before:content-["."] before:animate-dots-2 before:inline-block',
      none: '',
    },
    duration: {
      fast: 'animate-duration-500',
      normal: 'animate-duration-1000',
      slow: 'animate-duration-2000',
      none: '',
    },
  },
  defaultVariants: {
    type: 'spinner',
    duration: 'normal',
  },
});

/**
 * Focus animation for form elements
 */
export const focusAnimation = cva('transition-all duration-200', {
  variants: {
    effect: {
      glow: 'focus:ring-2 focus:ring-primary/25 focus:outline-none',
      scale: 'focus:ring-2 focus:ring-primary/25 focus:scale-[1.01] focus:outline-none',
      border: 'focus:border-primary focus:outline-none',
      underline: 'focus:outline-none focus:after:absolute focus:after:bottom-0 focus:after:left-0 focus:after:w-full focus:after:h-0.5 focus:after:bg-primary',
      none: 'focus:outline-none',
    },
  },
  defaultVariants: {
    effect: 'glow',
  },
});

/**
 * Icon animation effects
 */
export const iconAnimation = cva('transition-all duration-300', {
  variants: {
    effect: {
      spin: 'group-hover:animate-spin',
      pulse: 'group-hover:animate-pulse',
      bounce: 'group-hover:animate-bounce',
      wiggle: 'group-hover:animate-wiggle',
      scale: 'group-hover:scale-125',
      rotate: 'group-hover:rotate-12',
      slide: 'group-hover:translate-x-1',
      none: '',
    },
    delay: {
      none: '',
      short: 'hover:delay-75',
      medium: 'hover:delay-150',
      long: 'hover:delay-300',
    },
  },
  defaultVariants: {
    effect: 'scale',
    delay: 'none',
  },
});

/**
 * Page transition animations
 */
export const pageTransition = cva('animate-in', {
  variants: {
    animation: {
      fade: 'fade-in duration-500',
      slideUp: 'slide-in-from-bottom-8 duration-500 fade-in',
      slideLeft: 'slide-in-from-right-8 duration-500 fade-in',
      zoomIn: 'zoom-in-95 duration-500 fade-in',
      none: '',
    },
  },
  defaultVariants: {
    animation: 'fade',
  },
});

// Types for animation props
export type ButtonHoverEffectProps = VariantProps<typeof buttonHoverEffect>;
export type CardHoverEffectProps = VariantProps<typeof cardHoverEffect>;
export type NavLinkHoverEffectProps = VariantProps<typeof navLinkHoverEffect>;
export type AlertAnimationProps = VariantProps<typeof alertAnimation>;
export type RevealAnimationProps = VariantProps<typeof revealAnimation>;
export type LoadingAnimationProps = VariantProps<typeof loadingAnimation>;
export type FocusAnimationProps = VariantProps<typeof focusAnimation>;
export type IconAnimationProps = VariantProps<typeof iconAnimation>;
export type PageTransitionProps = VariantProps<typeof pageTransition>;