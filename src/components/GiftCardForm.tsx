
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { GiftCard } from "./Dashboard";
import { validateGiftCard, sanitizeHtml, rateLimiter } from "@/utils/validation";
import { logger } from "@/utils/secureLogging";
import { useToast } from "@/hooks/use-toast";

interface GiftCardFormProps {
  card?: GiftCard | null;
  onSubmit: (cardData: Omit<GiftCard, "id" | "daysUntilExpiration">) => void;
  onCancel: () => void;
}

const GiftCardForm = ({ card, onSubmit, onCancel }: GiftCardFormProps) => {
  const [brand, setBrand] = useState("");
  const [balance, setBalance] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (card) {
      setBrand(card.brand);
      setBalance(card.balance.toString());
      setExpirationDate(card.expiration_date);
      setNotes(card.notes || "");
    }
  }, [card]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check
    const userId = 'current-user'; // In a real app, get from auth context
    if (!rateLimiter.isAllowed(`form-submit-${userId}`, 5, 60000)) {
      toast({
        title: "Too Many Requests",
        description: "Please wait before submitting another gift card.",
        variant: "destructive",
      });
      return;
    }

    if (!brand || !balance || !expirationDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const formData = {
      brand: sanitizeHtml(brand.trim()),
      balance: parseFloat(balance),
      expiration_date: expirationDate,
      notes: notes ? sanitizeHtml(notes.trim()) : ""
    };

    // Validate the form data
    const validation = validateGiftCard(formData);
    
    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message || "Invalid input data";
      toast({
        title: "Validation Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      logger.warn("Form validation failed", {
        errors: validation.error.errors,
        formData: { ...formData, balance: "[REDACTED]" }
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      onSubmit(validation.data);
      logger.info("Gift card form submitted successfully", {
        action: card ? "update" : "create",
        brand: formData.brand
      });
    } catch (error) {
      logger.error("Error submitting gift card form", { error });
      toast({
        title: "Submission Error",
        description: "Failed to save gift card. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>{card ? "Edit Gift Card" : "Add New Gift Card"}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand Name</Label>
              <Input
                id="brand"
                placeholder="e.g., Amazon, Starbucks, Target"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                maxLength={50}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="balance">Balance (USD)</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                min="0.01"
                max="10000"
                placeholder="0.00"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiration">Expiration Date</Label>
              <Input
                id="expiration"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this gift card..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
                rows={3}
              />
            </div>
            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              >
                {isSubmitting ? "Saving..." : card ? "Update Card" : "Add Card"}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default GiftCardForm;
