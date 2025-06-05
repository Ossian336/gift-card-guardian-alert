
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, Search, Filter } from "lucide-react";
import { GiftCard } from "./Dashboard";

interface GiftCardTableProps {
  giftCards: GiftCard[];
  onEdit: (card: GiftCard) => void;
  onDelete: (id: string) => void;
}

const GiftCardTable = ({ giftCards, onEdit, onDelete }: GiftCardTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [expirationFilter, setExpirationFilter] = useState("all");

  const uniqueBrands = Array.from(new Set(giftCards.map(card => card.brand)));

  const filteredCards = giftCards.filter(card => {
    const matchesSearch = card.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBrand = brandFilter === "all" || card.brand === brandFilter;
    
    const matchesExpiration = expirationFilter === "all" || 
                            (expirationFilter === "expiring" && card.daysUntilExpiration <= 30) ||
                            (expirationFilter === "expired" && card.daysUntilExpiration < 0);
    
    return matchesSearch && matchesBrand && matchesExpiration;
  });

  const getExpirationBadge = (daysUntilExpiration: number) => {
    if (daysUntilExpiration < 0) {
      return <Badge variant="destructive">Expired</Badge>;
    } else if (daysUntilExpiration <= 7) {
      return <Badge variant="destructive">Expires in {daysUntilExpiration} days</Badge>;
    } else if (daysUntilExpiration <= 30) {
      return <Badge variant="secondary">Expires in {daysUntilExpiration} days</Badge>;
    } else {
      return <Badge variant="outline">{daysUntilExpiration} days remaining</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Filter className="w-5 h-5" />
          <span>Gift Cards</span>
        </CardTitle>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by brand or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={brandFilter} onValueChange={setBrandFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {uniqueBrands.map(brand => (
                <SelectItem key={brand} value={brand}>{brand}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={expirationFilter} onValueChange={setExpirationFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by expiration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cards</SelectItem>
              <SelectItem value="expiring">Expiring Soon (30 days)</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brand</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCards.map((card) => (
                <TableRow key={card.id}>
                  <TableCell className="font-medium">{card.brand}</TableCell>
                  <TableCell className="text-green-600 font-semibold">
                    ${card.balance.toFixed(2)}
                  </TableCell>
                  <TableCell>{new Date(card.expiration_date).toLocaleDateString()}</TableCell>
                  <TableCell>{getExpirationBadge(card.daysUntilExpiration)}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {card.notes || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(card)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(card.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredCards.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {giftCards.length === 0 ? "No gift cards added yet." : "No cards match your filters."}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GiftCardTable;
