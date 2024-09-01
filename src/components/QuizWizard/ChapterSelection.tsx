import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { harryPotterBooks } from "@/data/harryPotterBooks";

interface ChapterSelectionProps {
  onSelect: (chapters: number[]) => void;
  selectedChapters: number[];
  selectedBook: number;
}

const ChapterSelection: React.FC<ChapterSelectionProps> = ({ onSelect, selectedChapters, selectedBook }) => {
  const book = harryPotterBooks.find(b => b.id === selectedBook);
  const chapters = book ? book.chapters : [];

  const handleToggle = (chapterId: number) => {
    const updatedChapters = selectedChapters.includes(chapterId)
      ? selectedChapters.filter(c => c !== chapterId)
      : [...selectedChapters, chapterId];
    onSelect(updatedChapters);
  };

  if (!book) {
    return <div>No book selected</div>;
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {chapters.map((chapter) => (
        <div key={chapter.id} className="flex items-center space-x-2">
          <Checkbox
            id={`chapter-${chapter.id}`}
            checked={selectedChapters.includes(chapter.id)}
            onCheckedChange={() => handleToggle(chapter.id)}
          />
          <Label htmlFor={`chapter-${chapter.id}`}>{chapter.title}</Label>
        </div>
      ))}
    </div>
  );
};

export default ChapterSelection;