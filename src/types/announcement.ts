
export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  authorId: string;
  authorName?: string; // Optional, can be fetched or denormalized
}
