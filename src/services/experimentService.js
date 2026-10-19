// Modular Experiment Service: bridges bundled published experiments and local browser drafts
import publishedExperiments from '../data/experiments.json';
import { storageService } from './storageService';

export const experimentService = {
  /**
   * Return all official published experiments (available to all visitors)
   */
  getPublishedExperiments() {
    return publishedExperiments.map((exp) => ({
      ...exp,
      isPublished: true,
      isLocalDraft: false,
    }));
  },

  /**
   * Return a single experiment by ID (checking local drafts first, then published)
   */
  getExperimentById(id) {
    if (!id) return null;

    // Check if it's a direct draft ID
    const draft = storageService.getDraft(id);
    if (draft) return draft;

    // Check if there is an active local draft fork of a published lab
    const forkDraft = storageService.getDraftByExperimentId(id);
    const published = publishedExperiments.find((e) => e.id === id);

    if (published) {
      return {
        ...published,
        isPublished: true,
        isLocalDraft: false,
        hasLocalDraftFork: !!forkDraft,
        localDraftId: forkDraft ? forkDraft.id : null,
      };
    }

    return null;
  },

  /**
   * Get all categories
   */
  getCategories() {
    const cats = new Set(publishedExperiments.map((e) => e.category));
    return ['All Categories', ...Array.from(cats)];
  },

  /**
   * Create a local draft clone from a published experiment
   */
  createDraftFromPublished(experimentId) {
    const published = publishedExperiments.find((e) => e.id === experimentId);
    if (!published) throw new Error('Experiment not found');

    const existingDraft = storageService.getDraftByExperimentId(experimentId);
    if (existingDraft) {
      return existingDraft;
    }

    const newDraft = {
      id: `draft_${published.id}_${Date.now()}`,
      originalExperimentId: published.id,
      labNumber: published.labNumber,
      title: `${published.title} (My Local Draft)`,
      slug: published.slug,
      category: published.category,
      difficulty: published.difficulty,
      subject: published.subject,
      objective: published.objective,
      theory: published.theory,
      algorithm: published.algorithm,
      timeComplexity: published.timeComplexity,
      spaceComplexity: published.spaceComplexity,
      defaultStdin: published.defaultStdin,
      stdin: published.defaultStdin,
      notebookFile: published.notebookFile,
      code: published.code,
      sampleOutput: published.sampleOutput,
      tags: published.tags,
      isPublished: false,
      isLocalDraft: true,
      createdAt: new Date().toISOString(),
    };

    return storageService.saveDraft(newDraft);
  },

  /**
   * Create a local draft from an uploaded .ipynb notebook
   */
  createDraftFromUploadedNotebook(parsedNotebook) {
    const newDraft = {
      id: `custom_nb_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      originalExperimentId: null,
      labNumber: 'Custom Lab',
      title: parsedNotebook.title || 'Uploaded Notebook',
      slug: 'uploaded-notebook',
      category: 'Custom Notebooks',
      difficulty: 'Custom',
      subject: 'User Uploaded Experiments',
      objective: `Interactive execution of uploaded notebook: ${parsedNotebook.filename}`,
      theory: 'Uploaded directly via browser file parser. Parsed into markdown documentation and runnable Python code cells.',
      algorithm: [
        `Extracted ${parsedNotebook.codeCellCount} code cells and ${parsedNotebook.markdownCellCount} markdown cells.`,
        'Executable in client-side WebAssembly environment via Pyodide.'
      ],
      timeComplexity: 'N/A',
      spaceComplexity: 'N/A',
      defaultStdin: '',
      stdin: '',
      notebookFile: null,
      code: parsedNotebook.combinedCode,
      sampleOutput: parsedNotebook.combinedSampleOutput || '',
      tags: ['Uploaded Notebook', 'Custom'],
      isPublished: false,
      isLocalDraft: true,
      isUploadedNotebook: true,
      cells: parsedNotebook.cells,
      createdAt: new Date().toISOString(),
    };

    return storageService.saveDraft(newDraft);
  },

  /**
   * Reset local changes to the original published version
   */
  resetToPublished(experimentId) {
    const draft = storageService.getDraftByExperimentId(experimentId);
    if (draft) {
      storageService.deleteDraft(draft.id);
    }
    return this.getExperimentById(experimentId);
  },
};

