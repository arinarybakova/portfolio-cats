export type TestCat = {
  name: string;
  age: number;
  status: 'AVAILABLE' | 'ADOPTED' | 'PENDING';
  breedId: number;
  image?: string;
};

export function createTestCats(
  breedAId: number,
  breedBId: number,
): TestCat[] {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return [
    {
      name: `Search Alpha Cat ${id}`,
      age: 2,
      status: 'AVAILABLE',
      breedId: breedAId,
    },
    {
      name: `Search Beta Cat ${id}`,
      age: 5,
      status: 'AVAILABLE',
      breedId: breedBId,
    },
    {
      name: `Different Gamma Cat ${id}`,
      age: 8,
      status: 'AVAILABLE',
      breedId: breedAId,
    },
  ];
}