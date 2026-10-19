// Modular Storage Service for browser-local preferences, drafts, and backups
// Designed to be swappable with a cloud database/auth layer in the future

const DRAFTS_KEY = 'ailab_user_drafts_v1';
const PREFS_KEY = 'ailab_user_preferences_v1';

const DEFAULT_PREFERENCES = {
  theme: 'dark',
  timeoutSeconds: 15,
  fontSize: 14,
  wordWrap: 'on',
  autoScrollOutput: true,
  showReferenceOutput: true,
};

export const storageService = {
  /**
   * Preferences
   */
  getPreferences() {
    try {
      const data = localStorage.getItem(PREFS_KEY);
      if (!data) return DEFAULT_PREFERENCES;
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(data) };
    } catch (err) {
      console.warn('Failed to read preferences from localStorage:', err);
      return DEFAULT_PREFERENCES;
    }
  },

  savePreferences(prefs) {
    try {
      const current = this.getPreferences();
      const updated = { ...current, ...prefs };
      localStorage.setItem(PREFS_KEY, JSON.stringify(updated));
      return updated;
    } catch (err) {
      console.error('Failed to save preferences to localStorage:', err);
      return prefs;
    }
  },

  /**
   * Drafts & Local Modifications
   */
  getAllDrafts() {
    try {
      const data = localStorage.getItem(DRAFTS_KEY);
      if (!data) return [];
      const drafts = JSON.parse(data);
      return Array.isArray(drafts) ? drafts : [];
    } catch (err) {
      console.error('Failed to load drafts from localStorage:', err);
      return [];
    }
  },

  getDraft(draftId) {
    const drafts = this.getAllDrafts();
    return drafts.find((d) => d.id === draftId) || null;
  },

  getDraftByExperimentId(expId) {
    const drafts = this.getAllDrafts();
    return drafts.find((d) => d.originalExperimentId === expId) || null;
  },

  saveDraft(draft) {
    try {
      const drafts = this.getAllDrafts();
      const now = new Date().toISOString();
      const updatedDraft = {
        ...draft,
        id: draft.id || `draft_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        lastModified: now,
        isLocalDraft: true,
        storageNote: 'Saved in browser storage (Private to this machine)',
      };

      const existingIndex = drafts.findIndex((d) => d.id === updatedDraft.id);
      if (existingIndex >= 0) {
        drafts[existingIndex] = updatedDraft;
      } else {
        drafts.unshift(updatedDraft);
      }

      localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
      return updatedDraft;
    } catch (err) {
      console.error('Failed to save draft to localStorage:', err);
      throw new Error('Failed to save to local browser storage.');
    }
  },

  deleteDraft(draftId) {
    try {
      const drafts = this.getAllDrafts();
      const filtered = drafts.filter((d) => d.id !== draftId);
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(filtered));
      return true;
    } catch (err) {
      console.error('Failed to delete draft from localStorage:', err);
      return false;
    }
  },

  clearAllDrafts() {
    try {
      localStorage.removeItem(DRAFTS_KEY);
      return true;
    } catch (err) {
      console.error('Failed to clear drafts:', err);
      return false;
    }
  },

  /**
   * Full Backup Export / Import
   */
  exportAllData() {
    const payload = {
      app: 'AI-Lab-Platform',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      storageNotice: 'This backup contains local drafts and preferences from your browser.',
      preferences: this.getPreferences(),
      drafts: this.getAllDrafts(),
    };
    return JSON.stringify(payload, null, 2);
  },

  importData(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid JSON format');
      }

      let importedDraftsCount = 0;
      if (Array.isArray(parsed.drafts)) {
        const currentDrafts = this.getAllDrafts();
        // Merge drafts by id
        const mergedMap = new Map();
        currentDrafts.forEach((d) => mergedMap.set(d.id, d));
        parsed.drafts.forEach((d) => {
          if (d && d.id) {
            mergedMap.set(d.id, { ...d, isLocalDraft: true });
            importedDraftsCount++;
          }
        });
        localStorage.setItem(DRAFTS_KEY, JSON.stringify(Array.from(mergedMap.values())));
      }

      if (parsed.preferences && typeof parsed.preferences === 'object') {
        this.savePreferences(parsed.preferences);
      }

      return {
        success: true,
        count: importedDraftsCount,
      };
    } catch (err) {
      return {
        success: false,
        error: err.message || 'Failed to parse JSON backup file.',
      };
    }
  },
};

