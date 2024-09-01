import React from 'react';
import { Button } from "@/components/ui/button";
import { harryPotterBooks } from "@/data/harryPotterBooks";

interface BookSelectionProps {
  onSelect: (bookNumber: number) => void;
  selectedBook: number | null;
}

const BookSelection: React.FC<BookSelectionProps> = ({ onSelect, selectedBook }) => {
  return (
    <div className="space-y-2">
      {harryPotterBooks.map((book) => (
        <Button
          key={book.id}
          onClick={() => onSelect(book.id)}
          variant={selectedBook === book.id ? "secondary" : "outline"}
          className="w-full justify-start"
        >
          {book.title}
        </Button>
      ))}
    </div>
  );
};

export default BookSelection;