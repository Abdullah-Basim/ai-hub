interface LoadingProps {
  size?: "small" | "medium" | "large"
  className?: string
  text?: string
}

export function Loading({ size = "medium", className = "", text }: LoadingProps) {
  const sizeClasses = {
    small: "w-4 h-4 border-2",
    medium: "w-8 h-8 border-3",
    large: "w-12 h-12 border-4",
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full border-t-primary border-r-primary border-b-transparent border-l-transparent animate-spin`}
      />
      {text && <p className="mt-2 text-sm text-gray-500">{text}</p>}
    </div>
  )
}
