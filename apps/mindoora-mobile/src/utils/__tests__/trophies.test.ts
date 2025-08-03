import {
  Trophy,
  trophies,
  getTrophyById,
  getTrophiesByCategory,
  getAllCategories,
  getDefaultTrophies
} from '../trophies';

describe('Trophies Utility', () => {
  describe('Trophy Interface and Data', () => {
    it('should have a valid trophies array', () => {
      expect(trophies).toBeDefined();
      expect(Array.isArray(trophies)).toBe(true);
      expect(trophies.length).toBeGreaterThan(0);
    });

    it('should have trophies with required properties', () => {
      trophies.forEach((trophy: Trophy) => {
        expect(trophy).toHaveProperty('id');
        expect(trophy).toHaveProperty('name');
        expect(trophy).toHaveProperty('image');
        
        expect(typeof trophy.id).toBe('string');
        expect(typeof trophy.name).toBe('string');
        expect(trophy.id.length).toBeGreaterThan(0);
        expect(trophy.name.length).toBeGreaterThan(0);
      });
    });

    it('should have unique trophy IDs', () => {
      const ids = trophies.map(trophy => trophy.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids.length).toBe(uniqueIds.length);
    });

    it('should have trophies with categories', () => {
      const trophiesWithCategories = trophies.filter(trophy => trophy.category);
      expect(trophiesWithCategories.length).toBeGreaterThan(0);
    });
  });

  describe('getTrophyById', () => {
    it('should return a trophy when given a valid ID', () => {
      const trophy = getTrophyById('quiz-master-gold');
      
      expect(trophy).toBeDefined();
      expect(trophy?.id).toBe('quiz-master-gold');
      expect(trophy?.name).toBe('Quiz Master Gold');
      expect(trophy?.category).toBe('Achievement');
    });

    it('should return undefined when given an invalid ID', () => {
      const trophy = getTrophyById('non-existent-trophy');
      expect(trophy).toBeUndefined();
    });

    it('should return undefined when given an empty string', () => {
      const trophy = getTrophyById('');
      expect(trophy).toBeUndefined();
    });

    it('should handle case-sensitive IDs correctly', () => {
      const trophy = getTrophyById('QUIZ-MASTER-GOLD');
      expect(trophy).toBeUndefined();
    });

    it('should return correct trophy for each existing ID', () => {
      const testCases = [
        { id: 'champion', name: 'Champion', category: 'Victory' },
        { id: 'brainiac', name: 'Brainiac', category: 'Intelligence' },
        { id: 'rookie', name: 'Rookie', category: 'Beginner' },
        { id: 'math-genius', name: 'Math Genius', category: 'Subject' }
      ];

      testCases.forEach(({ id, name, category }) => {
        const trophy = getTrophyById(id);
        expect(trophy).toBeDefined();
        expect(trophy?.id).toBe(id);
        expect(trophy?.name).toBe(name);
        expect(trophy?.category).toBe(category);
      });
    });
  });

  describe('getTrophiesByCategory', () => {
    it('should return trophies for a valid category', () => {
      const achievementTrophies = getTrophiesByCategory('Achievement');
      
      expect(Array.isArray(achievementTrophies)).toBe(true);
      expect(achievementTrophies.length).toBeGreaterThan(0);
      
      achievementTrophies.forEach(trophy => {
        expect(trophy.category).toBe('Achievement');
      });
    });

    it('should return empty array for non-existent category', () => {
      const trophies = getTrophiesByCategory('NonExistentCategory');
      expect(Array.isArray(trophies)).toBe(true);
      expect(trophies.length).toBe(0);
    });

    it('should return empty array for empty string category', () => {
      const trophies = getTrophiesByCategory('');
      expect(Array.isArray(trophies)).toBe(true);
      expect(trophies.length).toBe(0);
    });

    it('should handle case-sensitive categories correctly', () => {
      const trophies = getTrophiesByCategory('achievement'); // lowercase
      expect(trophies.length).toBe(0);
    });

    it('should return correct trophies for each category', () => {
      const categories = ['Achievement', 'Performance', 'Victory', 'Intelligence', 'Subject'];
      
      categories.forEach(category => {
        const categoryTrophies = getTrophiesByCategory(category);
        expect(categoryTrophies.length).toBeGreaterThan(0);
        
        categoryTrophies.forEach(trophy => {
          expect(trophy.category).toBe(category);
        });
      });
    });

    it('should return different results for different categories', () => {
      const achievementTrophies = getTrophiesByCategory('Achievement');
      const performanceTrophies = getTrophiesByCategory('Performance');
      
      expect(achievementTrophies).not.toEqual(performanceTrophies);
    });
  });

  describe('getAllCategories', () => {
    it('should return an array of categories', () => {
      const categories = getAllCategories();
      
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
    });

    it('should return unique categories', () => {
      const categories = getAllCategories();
      const uniqueCategories = [...new Set(categories)];
      
      expect(categories.length).toBe(uniqueCategories.length);
    });

    it('should return sorted categories', () => {
      const categories = getAllCategories();
      const sortedCategories = [...categories].sort();
      
      expect(categories).toEqual(sortedCategories);
    });

    it('should include "Other" for trophies without categories', () => {
      // This test assumes there might be trophies without categories
      // If all trophies have categories, this test will still pass
      const categories = getAllCategories();
      const allTrophiesHaveCategories = trophies.every(trophy => trophy.category);
      
      if (!allTrophiesHaveCategories) {
        expect(categories).toContain('Other');
      }
    });

    it('should include expected categories', () => {
      const categories = getAllCategories();
      const expectedCategories = [
        'Achievement',
        'Performance',
        'Victory',
        'Intelligence',
        'Subject',
        'Entertainment',
        'Sports',
        'Special',
        'Speed',
        'Social',
        'Creative',
        'Beginner',
        'Accuracy'
      ];
      
      expectedCategories.forEach(expectedCategory => {
        expect(categories).toContain(expectedCategory);
      });
    });
  });

  describe('getDefaultTrophies', () => {
    it('should return an object with first, second, and third properties', () => {
      const defaultTrophies = getDefaultTrophies();
      
      expect(defaultTrophies).toHaveProperty('first');
      expect(defaultTrophies).toHaveProperty('second');
      expect(defaultTrophies).toHaveProperty('third');
    });

    it('should return correct default trophies', () => {
      const defaultTrophies = getDefaultTrophies();
      
      expect(defaultTrophies.first?.id).toBe('quiz-master-gold');
      expect(defaultTrophies.second?.id).toBe('quiz-master-silver');
      expect(defaultTrophies.third?.id).toBe('quiz-master-bronze');
    });

    it('should return trophy objects with all required properties', () => {
      const defaultTrophies = getDefaultTrophies();
      
      const positions = ['first', 'second', 'third'] as const;
      
      positions.forEach(position => {
        const trophy = defaultTrophies[position];
        expect(trophy).toBeDefined();
        expect(trophy).toHaveProperty('id');
        expect(trophy).toHaveProperty('name');
        expect(trophy).toHaveProperty('image');
        expect(trophy).toHaveProperty('category');
      });
    });

    it('should return different trophies for each position', () => {
      const defaultTrophies = getDefaultTrophies();
      
      expect(defaultTrophies.first?.id).not.toBe(defaultTrophies.second?.id);
      expect(defaultTrophies.second?.id).not.toBe(defaultTrophies.third?.id);
      expect(defaultTrophies.first?.id).not.toBe(defaultTrophies.third?.id);
    });

    it('should return trophies that exist in the main trophies array', () => {
      const defaultTrophies = getDefaultTrophies();
      const trophyIds = trophies.map(trophy => trophy.id);
      
      expect(trophyIds).toContain(defaultTrophies.first?.id);
      expect(trophyIds).toContain(defaultTrophies.second?.id);
      expect(trophyIds).toContain(defaultTrophies.third?.id);
    });
  });

  describe('Integration Tests', () => {
    it('should work together - get trophy by ID and check its category', () => {
      const trophy = getTrophyById('math-genius');
      expect(trophy).toBeDefined();
      
      const categoryTrophies = getTrophiesByCategory(trophy?.category || '');
      expect(categoryTrophies).toContain(trophy);
    });

    it('should have consistent data - all categories should have at least one trophy', () => {
      const categories = getAllCategories();
      
      categories.forEach(category => {
        if (category !== 'Other') {
          const categoryTrophies = getTrophiesByCategory(category);
          expect(categoryTrophies.length).toBeGreaterThan(0);
        }
      });
    });

    it('should have all default trophies in Achievement category', () => {
      const defaultTrophies = getDefaultTrophies();
      
      expect(defaultTrophies.first?.category).toBe('Achievement');
      expect(defaultTrophies.second?.category).toBe('Achievement');
      expect(defaultTrophies.third?.category).toBe('Achievement');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null and undefined inputs gracefully', () => {
      // @ts-ignore - Testing runtime behavior
      expect(getTrophyById(null)).toBeUndefined();
      // @ts-ignore - Testing runtime behavior
      expect(getTrophyById(undefined)).toBeUndefined();
      
      // @ts-ignore - Testing runtime behavior
      expect(getTrophiesByCategory(null)).toEqual([]);
      // @ts-ignore - Testing runtime behavior  
      expect(getTrophiesByCategory(undefined)).toEqual([]);
    });

    it('should handle special characters in trophy IDs', () => {
      const trophy = getTrophyById('quiz-master-gold'); // Contains hyphens
      expect(trophy).toBeDefined();
    });

    it('should maintain trophy image references', () => {
      trophies.forEach(trophy => {
        expect(trophy.image).toBeDefined();
        expect(trophy.image).not.toBeNull();
      });
    });
  });
});
