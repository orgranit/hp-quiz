import React from 'react';
import { Button } from "@/components/ui/button";

interface BookSelectionProps {
  onSelect: (bookNumber: number) => void;
  selectedBook: number | null;
}

const BookSelection: React.FC<BookSelectionProps> = ({ onSelect, selectedBook }) => {
  const books = [
    { id: 2, title: "Harry Potter and the Chamber of Secrets", enabled: true },
    { id: 3, title: "Harry Potter and the Chamber of Secrets", enabled: false },
    // Add other books here, with enabled: false
  ];

  return (
    <div className="space-y-2">
      {books.map((book) => (
        <Button
          key={book.id}
          onClick={() => book.enabled && onSelect(book.id)}
          disabled={!book.enabled}
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