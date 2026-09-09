export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  image: string;
  authorId: string;
  channelId: string;
  likes: number;
  saves: number;
  createdAt: string;
  updatedAt: string;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  image: string;
  ownerId: string;
  createdAt: string;
}
