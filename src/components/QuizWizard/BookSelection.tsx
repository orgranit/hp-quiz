import React from 'react';
import { Button } from "@/components/ui/button";
import { Book } from "@/data/harryPotterBooks";

interface BookSelectionProps {
  books: Book[];
  onSelect: (book: Book) => void;
  selectedBook: Book | null;
}

const BookSelection: React.FC<BookSelectionProps> = ({ books, onSelect, selectedBook }) => {
  return (
    <div className="space-y-2">
      {books.map((book) => (
        <Button
          key={book.id}
          onClick={() => onSelect(book)}
          variant={selectedBook?.id === book.id ? "secondary" : "outline"}
          className="w-full justify-start"
        >
          {book.title}
        </Button>
      ))}
    </div>
  );
};

export default BookSelection;