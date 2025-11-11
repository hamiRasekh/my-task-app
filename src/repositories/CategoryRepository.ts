import { database } from '../database/database';
import Category from '../database/models/Category';
import { logger } from '../utils/logger';

export interface CategoryData {
  name: string;
  color: string;
  icon?: string;
  isCustom?: boolean;
}

export class CategoryRepository {
  /**
   * Create a new category
   */
  static async createCategory(data: CategoryData): Promise<Category> {
    try {
      logger.debug('Creating category', { name: data.name });
      const category = await database.write(async () => {
        return await database.get<Category>('categories').create((category) => {
          category.name = data.name;
          category.color = data.color;
          category.icon = data.icon;
          category.isCustom = data.isCustom ?? true;
          category.createdAt = Date.now();
          category.updatedAt = Date.now();
        });
      });
      logger.info('Category created', { categoryId: category.id, name: category.name });
      return category;
    } catch (error) {
      logger.error('Error creating category', error as Error, { categoryData: data });
      throw error;
    }
  }

  /**
   * Update a category
   */
  static async updateCategory(
    categoryId: string,
    data: Partial<CategoryData>
  ): Promise<Category> {
    return await database.write(async () => {
      const category = await database.get<Category>('categories').find(categoryId);
      
      return await category.update((category) => {
        if (data.name !== undefined) category.name = data.name;
        if (data.color !== undefined) category.color = data.color;
        if (data.icon !== undefined) category.icon = data.icon;
        category.updatedAt = Date.now();
      });
    });
  }

  /**
   * Delete a category
   */
  static async deleteCategory(categoryId: string): Promise<void> {
    await database.write(async () => {
      const category = await database.get<Category>('categories').find(categoryId);
      await category.markAsDeleted();
    });
  }

  /**
   * Get a category by ID
   */
  static async getCategoryById(categoryId: string): Promise<Category | null> {
    try {
      return await database.get<Category>('categories').find(categoryId);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get all categories
   */
  static async getAllCategories(): Promise<Category[]> {
    try {
      if (!database) {
        logger.warn('Database not available, returning empty categories');
        return [];
      }
      logger.debug('Fetching all categories');
      const categories = await database.get<Category>('categories').query().fetch();
      logger.debug('Categories fetched', { count: categories.length });
      return categories;
    } catch (error) {
      logger.error('Error fetching all categories', error as Error);
      return [];
    }
  }

  /**
   * Get custom categories only
   */
  static async getCustomCategories(): Promise<Category[]> {
    return await database
      .get<Category>('categories')
      .query()
      .where('is_custom', true)
      .fetch();
  }

  /**
   * Initialize default categories
   */
  static async initializeDefaultCategories(): Promise<void> {
    try {
      if (!database) {
        logger.warn('Database not available, skipping category initialization');
        return;
      }
      
      logger.debug('Initializing default categories');
      const existingCategories = await this.getAllCategories();
      
      if (existingCategories.length > 0) {
        logger.debug('Categories already initialized', { count: existingCategories.length });
        return; // Categories already initialized
      }

      logger.info('Creating default categories');
      const defaultCategories: CategoryData[] = [
        { name: 'کار', color: '#6366f1', icon: 'briefcase', isCustom: false },
        { name: 'شخصی', color: '#8b5cf6', icon: 'user', isCustom: false },
        { name: 'سلامت', color: '#10b981', icon: 'heart', isCustom: false },
        { name: 'آموزش', color: '#3b82f6', icon: 'book', isCustom: false },
        { name: 'سرگرمی', color: '#f59e0b', icon: 'film', isCustom: false },
      ];

      if (!database) {
        logger.warn('Database not available during category creation');
        return;
      }

      await database.write(async () => {
        for (const categoryData of defaultCategories) {
          try {
            await database.get<Category>('categories').create((category) => {
              category.name = categoryData.name;
              category.color = categoryData.color;
              category.icon = categoryData.icon;
              category.isCustom = categoryData.isCustom || false;
              category.createdAt = Date.now();
              category.updatedAt = Date.now();
            });
            logger.debug('Default category created', { name: categoryData.name });
          } catch (error) {
            logger.warn('Error creating category', error as Error, { categoryName: categoryData.name });
            // Continue with next category
          }
        }
      });
      logger.info('Default categories initialized successfully');
    } catch (error) {
      logger.error('Error initializing default categories', error as Error);
      // Don't throw - allow app to continue
    }
  }
}

