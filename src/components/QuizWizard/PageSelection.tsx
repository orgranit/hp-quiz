import React from 'react';
import { Button } from "@/components/ui/button";
import { harryPotterBooks } from "@/data/harryPotterBooks";

interface PageSelectionProps {
  onSelect: (pages: [number, number]) => void;
  selectedPages: [number, number] | null;
  selectedBook: number;
  selectedChapter: number;
}

const PageSelection: React.FC<PageSelectionProps> = ({ onSelect, selectedPages, selectedBook, selectedChapter }) => {
  const book = harryPotterBooks.find(b => b.id === selectedBook);
  const chapter = book?.chapters.find(c => c.id === selectedChapter);
  const totalPages = chapter ? chapter.pageEnd - chapter.pageStart + 1 : 0;

  const handlePageClick = (page: number) => {
   if (selectedPages && selectedPages[0] === selectedPages[1]) {
      onSelect(selectedPages[0] < page ? [selectedPages[0], page] : [page, selectedPages[0]]);
    } else {
      onSelect([page, page]);
  };
}

  const isSelected = (page: number) => {
    return selectedPages && page >= selectedPages[0] && page <= selectedPages[1];
  };

  return (
    <div className="grid grid-cols-6 gap-2">
      {Array.from({ length: totalPages }, (_, i) => i + chapter!.pageStart).map((page) => (
        <Button
          key={page}
          onClick={() => handlePageClick(page)}
          variant={isSelected(page) ? "secondary" : "outline"}
          className="w-full h-12"
        >
          {page}
        </Button>
      ))}
    </div>
  );
};

export default PageSelection;