"use client"

import { motion, HTMLMotionProps, Variants } from "framer-motion"
import { cn } from "@/lib/utils"

// Animation variants
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
}

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
}

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
}

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
}

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
}

// Motion div with fade in up animation
interface MotionDivProps extends HTMLMotionProps<"div"> {
  delay?: number
}

export function FadeInUp({ children, className, delay = 0, ...props }: MotionDivProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function FadeInDown({ children, className, delay = 0, ...props }: MotionDivProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function FadeInLeft({ children, className, delay = 0, ...props }: MotionDivProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function FadeInRight({ children, className, delay = 0, ...props }: MotionDivProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function ScaleIn({ children, className, delay = 0, ...props }: MotionDivProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Stagger container for multiple children
interface StaggerContainerProps extends HTMLMotionProps<"div"> {
  staggerDelay?: number
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.1,
  ...props
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: "easeOut" },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Hover card with scale and shadow
interface HoverCardProps extends HTMLMotionProps<"div"> {
  hoverScale?: number
}

export function HoverCard({
  children,
  className,
  hoverScale = 1.02,
  ...props
}: HoverCardProps) {
  return (
    <motion.div
      whileHover={{
        scale: hoverScale,
        transition: { duration: 0.3 }
      }}
      className={cn("transition-shadow duration-300 hover:shadow-premium-lg", className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Magnetic button effect
export function MagneticWrapper({
  children,
  className,
  ...props
}: HTMLMotionProps<"div">) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Parallax effect
interface ParallaxProps extends HTMLMotionProps<"div"> {
  speed?: number
}

export function Parallax({ children, className, speed = 0.5, ...props }: ParallaxProps) {
  return (
    <motion.div
      initial={{ y: 0 }}
      whileInView={{ y: -30 * speed }}
      viewport={{ once: false }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Text reveal animation
export function TextReveal({
  children,
  className,
  delay = 0,
  ...props
}: MotionDivProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.8,
        ease: [0.25, 0.4, 0.25, 1],
        delay
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Counter animation
interface CounterProps {
  from?: number
  to: number
  duration?: number
  className?: string
  suffix?: string
}

export function Counter({
  from = 0,
  to,
  duration = 2,
  className,
  suffix = ""
}: CounterProps) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className={className}
    >
      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        {to}{suffix}
      </motion.span>
    </motion.span>
  )
}

// Reveal on scroll
export function RevealOnScroll({
  children,
  className,
  width = "100%",
  ...props
}: MotionDivProps & { width?: string }) {
  return (
    <div className="relative overflow-hidden" style={{ width }}>
      <motion.div
        initial={{ opacity: 0, y: 75 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    </div>
  )
}

// Floating animation
export function FloatingElement({
  children,
  className,
  ...props
}: HTMLMotionProps<"div">) {
  return (
    <motion.div
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Glow pulse animation
export function GlowPulse({
  children,
  className,
  ...props
}: HTMLMotionProps<"div">) {
  return (
    <motion.div
      animate={{
        boxShadow: [
          "0 0 20px rgba(224, 123, 57, 0.3)",
          "0 0 40px rgba(224, 123, 57, 0.5)",
          "0 0 20px rgba(224, 123, 57, 0.3)",
        ]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Export motion components
export { motion }
