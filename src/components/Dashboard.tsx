
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Gift, LogOut, Plus } from "lucide-react";
import GiftCardForm from "./GiftCardForm";
import GiftCardTable from "./GiftCardTable";
import GiftCardChart from "./GiftCardChart";
import { useToast } from "@/hooks/use-toast";

export interface GiftCard {
  id: string;
  brand: string;
  balance: number;
  expirationDate: string;
  notes?: string;
  daysUntilExpiration: number;
}

interface DashboardProps {
  user: { email: string } | null;
  onLogout: () => void;
}

const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState<GiftCard | null>(null);
  const { toast } = useToast();

  // Sample data
  useEffect(() => {
    const sampleCards: GiftCard[] = [
      {
        id: "1",
        brand: "Amazon",
        balance: 150.00,
        expirationDate: "2024-12-31",
        notes: "Birthday gift from mom",
        daysUntilExpiration: 0
      },
      {
        id: "2",
        brand: "Starbucks",
        balance: 25.50,
        expirationDate: "2024-08-15",
        notes: "From office gift exchange",
        daysUntilExpiration: 0
      },
      {
        id: "3",
        brand: "Target",
        balance: 100.00,
        expirationDate: "2025-01-15",
        notes: "",
        daysUntilExpiration: 0
      }
    ];

    // Calculate days until expiration
    const cardsWithExpiration = sampleCards.map(card => ({
      ...card,
      daysUntilExpiration: Math.ceil((new Date(card.expirationDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
    }));

    setGiftCards(cardsWithExpiration);
  }, []);

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

  const handleAddCard = (cardData: Omit<GiftCard, "id" | "daysUntilExpiration">) => {
    const newCard: GiftCard = {
      ...cardData,
      id: Date.now().toString(),
      daysUntilExpiration: Math.ceil((new Date(cardData.expirationDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
    };
    setGiftCards([...giftCards, newCard]);
    setShowForm(false);
    toast({
      title: "Gift Card Added",
      description: `${cardData.brand} gift card has been added successfully`,
    });
  };

  const handleEditCard = (cardData: Omit<GiftCard, "id" | "daysUntilExpiration">) => {
    if (editingCard) {
      const updatedCard: GiftCard = {
        ...cardData,
        id: editingCard.id,
        daysUntilExpiration: Math.ceil((new Date(cardData.expirationDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
      };
      setGiftCards(giftCards.map(card => card.id === editingCard.id ? updatedCard : card));
      setEditingCard(null);
      setShowForm(false);
      toast({
        title: "Gift Card Updated",
        description: `${cardData.brand} gift card has been updated successfully`,
      });
    }
  };

  const handleDeleteCard = (id: string) => {
    setGiftCards(giftCards.filter(card => card.id !== id));
    toast({
      title: "Gift Card Deleted",
      description: "Gift card has been removed successfully",
    });
  };

  const totalBalance = giftCards.reduce((sum, card) => sum + card.balance, 0);

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
              <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
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
