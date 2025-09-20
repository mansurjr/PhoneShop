export interface Phone {
  id: string;
  title: string;
  price: string;
  image: string[];
  memories: number[];
  hasDelivery: boolean;
  colours: string[];
}


export type NewPhone = Omit<Phone, "id">;