export type User = {
  id: string;
  name: string;
  email: string;
};

export type FormStatus = "DRAFT" | "PUBLISHED";

export type FormListItem = {
  pin: string;
  isPrivate: boolean;
  id: string;
  title: string;
  description?: string | null;
  status: FormStatus;
  createdAt: string;
  updatedAt: string;
  _count?: { questions: number; submissions: number };
};

export type FormDetail = {
  id: string;
  title: string;
  description?: string | null;
  status: FormStatus;
  createdAt: string;
  updatedAt: string;
  questions: Array<{
    id: string;
    title: string;
    type: "SHORT_ANSWER" | "MULTIPLE_CHOICE" | "CHECKBOX" | "DROPDOWN";
    isRequired: boolean;
    order: number;
    options: Array<{ id: string; text: string; order: number }>;
  }>;
};