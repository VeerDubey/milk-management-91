
import { Product } from '@/types';

export class ProductCodeService {
  private static usedCodes = new Set<string>();

  /**
   * Generate a unique product code based on product name
   */
  static generateCode(productName: string, existingProducts: Product[] = []): string {
    // Initialize used codes from existing products
    this.updateUsedCodes(existingProducts);

    const baseName = productName.trim().toUpperCase();
    let code = '';

    // Strategy 1: First letters of each word + numbers
    const words = baseName.split(/\s+/).filter(word => word.length > 0);
    
    if (words.length === 1) {
      // Single word: take first 3-4 characters
      code = words[0].substring(0, Math.min(4, words[0].length));
    } else {
      // Multiple words: take first letter of each word
      code = words.map(word => word.charAt(0)).join('');
      
      // If code is too long, trim to 6 characters
      if (code.length > 6) {
        code = code.substring(0, 6);
      }
    }

    // Add numbers from the product name if present
    const numbers = productName.match(/\d+/g);
    if (numbers && numbers.length > 0) {
      const numberStr = numbers[0];
      // Ensure total length doesn't exceed 8 characters
      const maxNumberLength = 8 - code.length;
      if (maxNumberLength > 0) {
        code += numberStr.substring(0, maxNumberLength);
      }
    }

    // Ensure minimum length of 2
    if (code.length < 2) {
      code = code.padEnd(2, 'X');
    }

    // Make code unique by adding suffix if needed
    let finalCode = code;
    let suffix = 1;
    
    while (this.usedCodes.has(finalCode)) {
      const suffixStr = suffix.toString();
      const baseLength = Math.max(2, 8 - suffixStr.length);
      finalCode = code.substring(0, baseLength) + suffixStr;
      suffix++;
    }

    this.usedCodes.add(finalCode);
    return finalCode;
  }

  /**
   * Update the set of used codes from existing products
   */
  static updateUsedCodes(products: Product[]) {
    this.usedCodes.clear();
    products.forEach(product => {
      if (product.code) {
        this.usedCodes.add(product.code.toUpperCase());
      }
    });
  }

  /**
   * Validate if a code is unique
   */
  static isCodeUnique(code: string, products: Product[], excludeProductId?: string): boolean {
    const upperCode = code.toUpperCase();
    return !products.some(product => 
      product.code?.toUpperCase() === upperCode && product.id !== excludeProductId
    );
  }

  /**
   * Auto-assign codes to products that don't have them
   */
  static assignMissingCodes(products: Product[]): Product[] {
    this.updateUsedCodes(products);
    
    return products.map(product => {
      if (!product.code || product.code.trim() === '') {
        const newCode = this.generateCode(product.name, products);
        return { ...product, code: newCode };
      }
      return product;
    });
  }

  /**
   * Get suggested codes for a product name
   */
  static getSuggestedCodes(productName: string, existingProducts: Product[], count: number = 3): string[] {
    const suggestions: string[] = [];
    const baseName = productName.trim().toUpperCase();
    
    // Suggestion 1: Standard generation
    suggestions.push(this.generateCode(productName, existingProducts));
    
    // Suggestion 2: Abbreviation style
    if (baseName.length >= 6) {
      const abbrev = baseName.substring(0, 3) + baseName.substring(baseName.length - 3);
      if (this.isCodeUnique(abbrev, existingProducts)) {
        suggestions.push(abbrev);
      }
    }
    
    // Suggestion 3: Vowel removal
    const consonants = baseName.replace(/[AEIOU]/g, '').substring(0, 6);
    if (consonants.length >= 2 && this.isCodeUnique(consonants, existingProducts)) {
      suggestions.push(consonants);
    }
    
    return suggestions.slice(0, count);
  }

  /**
   * Format code for display (uppercase with consistent formatting)
   */
  static formatCode(code: string): string {
    return code.trim().toUpperCase();
  }

  /**
   * Validate code format
   */
  static validateCode(code: string): { isValid: boolean; error?: string } {
    const trimmedCode = code.trim();
    
    if (trimmedCode.length === 0) {
      return { isValid: false, error: 'Code cannot be empty' };
    }
    
    if (trimmedCode.length < 2) {
      return { isValid: false, error: 'Code must be at least 2 characters long' };
    }
    
    if (trimmedCode.length > 8) {
      return { isValid: false, error: 'Code cannot exceed 8 characters' };
    }
    
    if (!/^[A-Za-z0-9]+$/.test(trimmedCode)) {
      return { isValid: false, error: 'Code can only contain letters and numbers' };
    }
    
    return { isValid: true };
  }
}
