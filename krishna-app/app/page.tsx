import StoryCard from "../components/StoryCard";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Bhagwat Gita Story time",
};

export default function Home() {
  const stories = [
    {
      title: "Krishna's Birth",
      description: "Learn about Krishna's miraculous birth and early life.",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/6/6d/Krishna_Child.jpg",
    },
    {
      title: "Krishna and Butter",
      description: "Fun stories of young Krishna stealing butter!",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/3/3c/Krishna_butter.jpg",
    },
  ];

  return (
    <main className="flex flex-col items-center bg-yellow-100 min-h-screen p-8">
      <h1 className="text-4xl font-bold text-blue-800 mb-6">
        Krishna Stories for Kids 🦚
      </h1>
      <div className="flex flex-wrap justify-center">
        {stories.map((story, index) => (
          <StoryCard
            key={index}
            title={story.title}
            description={story.description}
            image={story.image}
          />
        ))}
      </div>
    </main>
  );
}
