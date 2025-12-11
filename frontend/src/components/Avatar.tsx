import placeholderAvatar from '../assets/images/all/placeholder-avatar.svg';

interface AvatarProps {
  src?: string;
  alt?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
};

export default function Avatar({ src, alt = 'Avatar', className = '', size = 'md' }: AvatarProps) {
  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 flex items-center justify-center ${className}`}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <img src={placeholderAvatar} alt={alt} className="w-full h-full object-cover" />
      )}
    </div>
  );
}

