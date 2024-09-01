import React from 'react';
import { Button } from "@/components/ui/button";

interface PageSelectionProps {
  onSelect: (pages: [number, number]) => void;
  selectedPages: [number, number] | null;
}

const PageSelection: React.FC<PageSelectionProps> = ({ onSelect, selectedPages }) => {
  const totalPages = 18; // Mock data, replace with actual page count later

  const handlePageClick = (page: number) => {
    if (!selectedPages) {
      onSelect([page, page]);
    } else if (selectedPages[0] === page && selectedPages[1] === page) {
      onSelect([page, page]);
    } else if (page < selectedPages[0]) {
      onSelect([page, selectedPages[1]]);
    } else {
      onSelect([selectedPages[0], page]);
    }
  };

  const isSelected = (page: number) => {
    return selectedPages && page >= selectedPages[0] && page <= selectedPages[1];
  };

  return (
    <div className="grid grid-cols-6 gap-2">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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