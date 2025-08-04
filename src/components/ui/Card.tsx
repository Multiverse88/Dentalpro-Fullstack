interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'gradient';
}

export function Card({ className, variant = 'default', ...props }: CardProps) {
  const variants = {
    default: 'bg-white border border-gray-200 shadow-sm',
    glass: 'bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg',
    gradient: 'bg-white border border-gray-200 shadow-xl'
  };

  return (
    <div
      className={`rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
