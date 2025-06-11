
import { z } from 'zod';

// Gift card validation schema
export const giftCardSchema = z.object({
  brand: z.string()
    .min(1, "Brand name is required")
    .max(50, "Brand name must be 50 characters or less")
    .regex(/^[a-zA-Z0-9\s\-&'.]+$/, "Brand name contains invalid characters"),
  
  balance: z.number()
    .min(0.01, "Balance must be at least $0.01")
    .max(10000, "Balance cannot exceed $10,000")
    .refine((val) => Number(val.toFixed(2)) === val, "Balance can only have 2 decimal places"),
  
  expiration_date: z.string()
    .refine((date) => {
      const inputDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return inputDate >= today;
    }, "Expiration date cannot be in the past")
    .refine((date) => {
      const inputDate = new Date(date);
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 10);
      return inputDate <= maxDate;
    }, "Expiration date cannot be more than 10 years in the future"),
  
  notes: z.string()
    .max(500, "Notes must be 500 characters or less")
    .optional()
});

export type ValidatedGiftCard = z.infer<typeof giftCardSchema>;

export const validateGiftCard = (data: any) => {
  return giftCardSchema.safeParse(data);
};

// Sanitize HTML to prevent XSS
export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Rate limiting utility
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  isAllowed(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    
    const keyRequests = this.requests.get(key)!;
    
    // Remove old requests outside the window
    const validRequests = keyRequests.filter(timestamp => timestamp > windowStart);
    
    if (validRequests.length >= maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }
}

export const rateLimiter = new RateLimiter();
