export type ApiCriterion = {
  id: number;
  name: string;
  description: string | null;
  max_score: number | string;
  coefficient: number | string;
  position: number;
};

export type ApiGrid = {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  criteria: ApiCriterion[];
};

const waitForLocalValidation = () => new Promise<void>((resolve) => setTimeout(resolve, 200));

let nextGridId = 2;
let nextCriterionId = 4;
let grids: ApiGrid[] = [{
  id: 1,
  name: 'Grille de soutenance EMIT',
  description: 'Évaluation locale de démonstration sur 20 points.',
  is_active: true,
  criteria: [
    { id: 1, name: 'Présentation', description: null, max_score: 5, coefficient: 1, position: 1 },
    { id: 2, name: 'Maîtrise technique', description: null, max_score: 10, coefficient: 1, position: 2 },
    { id: 3, name: 'Réponses aux questions', description: null, max_score: 5, coefficient: 1, position: 3 },
  ],
}];

export const evaluationsApi = {
  async listGrids(): Promise<ApiGrid[]> {
    return grids.map((grid) => ({ ...grid, criteria: grid.criteria.map((criterion) => ({ ...criterion })) }));
  },
  async createGrid(data: { name: string; description?: string; is_active?: boolean }): Promise<ApiGrid> {
    if (!data.name.trim()) throw new Error('Le nom de la grille est obligatoire.');
    await waitForLocalValidation();
    const grid: ApiGrid = {
      id: nextGridId++,
      name: data.name.trim(),
      description: data.description ?? null,
      is_active: data.is_active ?? true,
      criteria: [],
    };
    grids = [...grids, grid];
    return { ...grid, criteria: [] };
  },
  async createCriterion(gridId: number, data: { name: string; description?: string; max_score: number; coefficient: number; position?: number }): Promise<ApiCriterion> {
    const grid = grids.find((entry) => entry.id === gridId);
    if (!grid) throw new Error('Grille d’évaluation introuvable.');
    if (!data.name.trim() || data.max_score <= 0 || data.coefficient <= 0) {
      throw new Error('Le critère et son barème doivent être valides.');
    }
    await waitForLocalValidation();
    const criterion: ApiCriterion = {
      id: nextCriterionId++,
      name: data.name.trim(),
      description: data.description ?? null,
      max_score: data.max_score,
      coefficient: data.coefficient,
      position: data.position ?? grid.criteria.length + 1,
    };
    grids = grids.map((entry) => entry.id === gridId ? { ...entry, criteria: [...entry.criteria, criterion] } : entry);
    return { ...criterion };
  },
  async updateCriterion(criterionId: number, data: Partial<Pick<ApiCriterion, 'name' | 'description' | 'max_score' | 'coefficient' | 'position'>>): Promise<ApiCriterion> {
    const criterion = grids.flatMap((grid) => grid.criteria).find((entry) => entry.id === criterionId);
    if (!criterion) throw new Error('Critère d’évaluation introuvable.');
    await waitForLocalValidation();
    const updated = { ...criterion, ...data };
    grids = grids.map((grid) => ({
      ...grid,
      criteria: grid.criteria.map((entry) => entry.id === criterionId ? updated : entry),
    }));
    return { ...updated };
  },
};
