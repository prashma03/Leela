// components/StoryCard.tsx
interface StoryCardProps {
  title: string;
  description: string;
  image: string;
}

export default function StoryCard({
  title,
  description,
  image,
}: StoryCardProps) {
  return (
    <div className="max-w-xs bg-white rounded-xl shadow-lg overflow-hidden m-4">
      <img className="w-full h-40 object-cover" src={image} alt={title} />
      <div className="p-4">
        <h2 className="text-xl font-bold text-blue-800">{title}</h2>
        <p className="text-gray-700 mt-2">{description}</p>
      </div>
    </div>
  );
}
