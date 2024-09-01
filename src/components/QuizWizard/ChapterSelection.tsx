import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ChapterSelectionProps {
  onSelect: (chapters: number[]) => void;
  selectedChapters: number[];
}

const ChapterSelection: React.FC<ChapterSelectionProps> = ({ onSelect, selectedChapters }) => {
  const chapters = [
    "The Worst Birthday", "Dobby's Warning", "The Burrow", "At Flourish and Blotts",
    "The Whomping Willow", "Gilderoy Lockhart", "Mudbloods and Murmurs", "The Deathday Party",
    "The Writing on the Wall", "The Rogue Bludger", "The Dueling Club", "The Polyjuice Potion",
    "The Very Secret Diary", "Cornelius Fudge", "Aragog", "The Chamber of Secrets",
    "The Heir of Slytherin", "Dobby's Reward"
  ];

  const handleToggle = (index: number) => {
    const updatedChapters = selectedChapters.includes(index)
      ? selectedChapters.filter(c => c !== index)
      : [...selectedChapters, index];
    onSelect(updatedChapters);
  };

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {chapters.map((chapter, index) => (
        <div key={index} className="flex items-center space-x-2">
          <Checkbox
            id={`chapter-${index}`}
            checked={selectedChapters.includes(index)}
            onCheckedChange={() => handleToggle(index)}
          />
          <Label htmlFor={`chapter-${index}`}>{chapter}</Label>
        </div>
      ))}
    </div>
  );
};

export default ChapterSelection;