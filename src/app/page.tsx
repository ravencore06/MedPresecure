import { AuthForm } from '@/components/auth/auth-form';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const backgroundImage = PlaceHolderImages.find(
  (img) => img.id === 'login-background'
);

export default function Home() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center">
      {backgroundImage && (
        <Image
          src={backgroundImage.imageUrl}
          alt={backgroundImage.description}
          fill
          className="object-cover object-center"
          priority
          data-ai-hint={backgroundImage.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-blue-900/40 backdrop-brightness-75" />
      <div className="relative z-10 w-full max-w-lg mx-4">
        <AuthForm />
      </div>
    </div>
  );
}
