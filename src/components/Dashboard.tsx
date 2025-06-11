
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Gift, LogOut, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import GiftCardForm from "./GiftCardForm";
import GiftCardTable from "./GiftCardTable";
import GiftCardChart from "./GiftCardChart";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/utils/secureLogging";
import { rateLimiter } from "@/utils/validation";

export interface GiftCard {
  id: string;
  brand: string;
  balance: number;
  expiration_date: string;
  notes?: string;
  daysUntilExpiration: number;
}

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState<GiftCard | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchGiftCards = async () => {
    // Rate limiting check
    if (!rateLimiter.isAllowed(`fetch-cards-${user.id}`, 10, 60000)) {
      toast({
        title: "Too Many Requests",
        description: "Please wait before refreshing data.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("table 1 test")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        logger.error("Error fetching gift cards", { error: error.message, userId: user.id });
        toast({
          title: "Error",
          description: "Failed to fetch gift cards",
          variant: "destructive",
        });
        return;
      }

      // Calculate days until expiration and format data
      const cardsWithExpiration = (data || []).map((card: any) => ({
        id: card.id,
        brand: card.brand || "",
        balance: parseFloat(card.balance) || 0,
        expiration_date: card.expiration_date || "",
        notes: card.notes || "",
        daysUntilExpiration: card.expiration_date 
          ? Math.ceil((new Date(card.expiration_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
          : 0
      }));

      setGiftCards(cardsWithExpiration);
      logger.info("Gift cards fetched successfully", { count: cardsWithExpiration.length });
    } catch (error) {
      logger.error("Unexpected error fetching gift cards", { error });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGiftCards();
  }, [user.id]);

  // Check for expiring cards
  useEffect(() => {
    const expiringCards = giftCards.filter(card => 
      card.daysUntilExpiration <= 7 && card.daysUntilExpiration > 0
    );

    expiringCards.forEach(card => {
      toast({
        title: "Gift Card Expiring Soon!",
        description: `Your ${card.brand} gift card expires in ${card.daysUntilExpiration} days`,
        variant: "destructive",
      });
    });
  }, [giftCards, toast]);

  const handleAddCard = async (cardData: Omit<GiftCard, "id" | "daysUntilExpiration">) => {
    try {
      const { error } = await supabase
        .from("table 1 test")
        .insert({
          user_id: user.id,
          brand: cardData.brand,
          balance: cardData.balance,
          expiration_date: cardData.expiration_date,
          notes: cardData.notes,
          created_at: new Date().toISOString()
        });

      if (error) {
        logger.error("Error adding gift card", { error: error.message, userId: user.id });
        toast({
          title: "Error",
          description: "Failed to add gift card",
          variant: "destructive",
        });
        return;
      }

      setShowForm(false);
      fetchGiftCards();
      toast({
        title: "Gift Card Added",
        description: `${cardData.brand} gift card has been added successfully`,
      });
      logger.info("Gift card added successfully", { brand: cardData.brand });
    } catch (error) {
      logger.error("Unexpected error adding gift card", { error });
    }
  };

  const handleEditCard = async (cardData: Omit<GiftCard, "id" | "daysUntilExpiration">) => {
    if (!editingCard) return;

    try {
      const { error } = await supabase
        .from("table 1 test")
        .update({
          brand: cardData.brand,
          balance: cardData.balance,
          expiration_date: cardData.expiration_date,
          notes: cardData.notes,
        })
        .eq("id", editingCard.id)
        .eq("user_id", user.id);

      if (error) {
        logger.error("Error updating gift card", { error: error.message, cardId: editingCard.id });
        toast({
          title: "Error",
          description: "Failed to update gift card",
          variant: "destructive",
        });
        return;
      }

      setEditingCard(null);
      setShowForm(false);
      fetchGiftCards();
      toast({
        title: "Gift Card Updated",
        description: `${cardData.brand} gift card has been updated successfully`,
      });
      logger.info("Gift card updated successfully", { cardId: editingCard.id, brand: cardData.brand });
    } catch (error) {
      logger.error("Unexpected error updating gift card", { error });
    }
  };

  const handleDeleteCard = async (id: string) => {
    try {
      const { error } = await supabase
        .from("table 1 test")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        logger.error("Error deleting gift card", { error: error.message, cardId: id });
        toast({
          title: "Error",
          description: "Failed to delete gift card",
          variant: "destructive",
        });
        return;
      }

      fetchGiftCards();
      toast({
        title: "Gift Card Deleted",
        description: "Gift card has been removed successfully",
      });
      logger.info("Gift card deleted successfully", { cardId: id });
    } catch (error) {
      logger.error("Unexpected error deleting gift card", { error });
    }
  };

  const totalBalance = giftCards.reduce((sum, card) => sum + card.balance, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-lg">Loading your gift cards...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <Gift className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                GiftKeeper
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.email}</span>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <h3 className="text-sm font-medium text-gray-500">Total Balance</h3>
            <p className="text-3xl font-bold text-green-600">${totalBalance.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <h3 className="text-sm font-medium text-gray-500">Total Cards</h3>
            <p className="text-3xl font-bold text-blue-600">{giftCards.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <h3 className="text-sm font-medium text-gray-500">Expiring Soon</h3>
            <p className="text-3xl font-bold text-red-600">
              {giftCards.filter(card => card.daysUntilExpiration <= 7 && card.daysUntilExpiration > 0).length}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="mb-8">
          <GiftCardChart giftCards={giftCards} />
        </div>

        {/* Add Card Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Gift Cards</h2>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Gift Card
          </Button>
        </div>

        {/* Gift Cards Table */}
        <GiftCardTable 
          giftCards={giftCards} 
          onEdit={(card) => {
            setEditingCard(card);
            setShowForm(true);
          }}
          onDelete={handleDeleteCard}
        />

        {/* Form Modal */}
        {showForm && (
          <GiftCardForm
            card={editingCard}
            onSubmit={editingCard ? handleEditCard : handleAddCard}
            onCancel={() => {
              setShowForm(false);
              setEditingCard(null);
            }}
          />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
