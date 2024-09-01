export interface Book {
  id: number;
  title: string;
  chapters: Chapter[];
}

export interface Chapter {
  id: number;
  title: string;
  pageStart: number;
  pageEnd: number;
}


const book2Chapters: Chapter[] = [
    { "id": 1, "title": "The Worst Birthday", "pageStart": 1, "pageEnd": 18 },
    { "id": 2, "title": "Dobby's Warning", "pageStart": 19, "pageEnd": 36 },
    { "id": 3, "title": "The Burrow", "pageStart": 37, "pageEnd": 55 },
    { "id": 4, "title": "At Flourish and Blotts", "pageStart": 56, "pageEnd": 74 },
    { "id": 5, "title": "The Whomping Willow", "pageStart": 75, "pageEnd": 94 },
    { "id": 6, "title": "Gilderoy Lockhart", "pageStart": 95, "pageEnd": 114 },
    { "id": 7, "title": "Mudbloods and Murmurs", "pageStart": 115, "pageEnd": 133 },
    { "id": 8, "title": "The Deathday Party", "pageStart": 134, "pageEnd": 155 },
    { "id": 9, "title": "The Writing on the Wall", "pageStart": 156, "pageEnd": 176 },
    { "id": 10, "title": "The Rogue Bludger", "pageStart": 177, "pageEnd": 196 },
    { "id": 11, "title": "The Duelling Club", "pageStart": 197, "pageEnd": 215 },
    { "id": 12, "title": "Polyjuice Potion", "pageStart": 216, "pageEnd": 235 },
    { "id": 13, "title": "The Very Secret Diary", "pageStart": 236, "pageEnd": 257 },
    { "id": 14, "title": "Cornelius Fudge", "pageStart": 258, "pageEnd": 276 },
    { "id": 15, "title": "Aragog", "pageStart": 277, "pageEnd": 297 },
    { "id": 16, "title": "The Chamber of Secrets", "pageStart": 298, "pageEnd": 317 },
    { "id": 17, "title": "The Heir of Slytherin", "pageStart": 318, "pageEnd": 329 },
    { "id": 18, "title": "Dobby's Reward", "pageStart": 330, "pageEnd": 341 }
  ]
  

export const harryPotterBooks: Book[] = [
  {
    id: 2,
    title: "Harry Potter and the Chamber of Secrets",
    chapters: book2Chapters
  },
  // ... Other books can be added here in the future
];