import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Chapter } from "@/data/harryPotterBooks";

interface ChapterSelectionProps {
  chapters: Chapter[];
  onSelect: (chapters: Chapter[]) => void;
  selectedChapters: Chapter[];
}

const ChapterSelection: React.FC<ChapterSelectionProps> = ({ chapters, onSelect, selectedChapters }) => {
  const handleToggle = (chapter: Chapter) => {
    const updatedChapters = selectedChapters.includes(chapter)
      ? selectedChapters.filter(c => c.id !== chapter.id)
      : [...selectedChapters, chapter];
    onSelect(updatedChapters);
  };

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {chapters.map((chapter) => (
        <div key={chapter.id} className="flex items-center space-x-2">
          <Checkbox
            id={`chapter-${chapter.id}`}
            checked={selectedChapters.some(c => c.id === chapter.id)}
            onCheckedChange={() => handleToggle(chapter)}
          />
          <Label htmlFor={`chapter-${chapter.id}`}>{chapter.title}</Label>
        </div>
      ))}
    </div>
  );
};

export default ChapterSelection;