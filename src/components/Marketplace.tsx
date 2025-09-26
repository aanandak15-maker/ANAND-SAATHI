import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Star, Truck, Phone, Target, CreditCard, Shield } from "lucide-react";

const Marketplace = () => {
  const aiRecommendations = [
    {
      id: 1,
      name: "Urea Fertilizer (46% N)",
      price: "₹420",
      originalPrice: "₹500",
      rating: 4.5,
      vendor: "Agro Solutions",
      deliveryTime: "2-3 days",
      category: "Fertilizer",
      image: "🌾",
      reason: "AI detected low NDRE in your field - nitrogen deficiency",
      urgency: "High",
      fieldMatch: "Your Field - 1.2 hectares",
      discount: 16,
      aiConfidence: "95%",
      expectedYield: "+15%"
    },
    {
      id: 2,
      name: "Drip Irrigation Kit",
      price: "₹8,500",
      originalPrice: "₹9,500",
      rating: 4.6,
      vendor: "Irrigation Tech",
      deliveryTime: "5-7 days",
      category: "Equipment",
      image: "💧",
      reason: "AI detected water stress in field analysis",
      urgency: "Medium",
      fieldMatch: "All fields - water stress detected",
      discount: 11,
      aiConfidence: "87%",
      expectedYield: "+20%"
    },
    {
      id: 3,
      name: "Organic Pesticide Spray",
      price: "₹850",
      originalPrice: "₹950",
      rating: 4.3,
      vendor: "Green Farm Co.",
      deliveryTime: "1-2 days",
      category: "Pesticide",
      image: "🛡️",
      reason: "AI detected early pest activity in vegetation analysis",
      urgency: "High",
      fieldMatch: "Field edges - pest risk",
      discount: 11,
      aiConfidence: "92%",
      expectedYield: "+12%"
    }
  ];

  const allProducts = [
    ...aiRecommendations,
    {
      id: 4,
      name: "Soil pH Testing Kit",
      price: "₹450",
      originalPrice: "₹500",
      rating: 4.7,
      vendor: "Farm Tech",
      deliveryTime: "Same day",
      category: "Equipment",
      image: "🧪"
    },
    {
      id: 5,
      name: "Seed Treatment Solution",
      price: "₹320",
      originalPrice: "₹380",
      rating: 4.4,
      vendor: "Seed Care Co.",
      deliveryTime: "1-2 days",
      category: "Treatment",
      image: "🌱"
    },
    {
      id: 6,
      name: "Weather Station",
      price: "₹12,500",
      originalPrice: "₹15,000",
      rating: 4.8,
      vendor: "Weather Tech",
      deliveryTime: "3-5 days",
      category: "Equipment",
      image: "🌤️"
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          Smart Agri Marketplace
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="ai-recommended" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ai-recommended">AI Picks</TabsTrigger>
            <TabsTrigger value="browse">Browse All</TabsTrigger>
            <TabsTrigger value="payment">Quick Buy</TabsTrigger>
          </TabsList>

          <TabsContent value="ai-recommended" className="space-y-4">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="font-semibold">Field-Specific AI Recommendations</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Based on your latest satellite analysis and field health data
              </p>
            </div>

            {aiRecommendations.map((product) => (
              <div key={product.id} className="border rounded-lg p-4 space-y-3 bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="text-2xl">{product.image}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{product.name}</h4>
                        <Badge className="bg-destructive/20 text-destructive" variant="secondary">
                          {product.urgency} Priority
                        </Badge>
                        <Badge variant="destructive" className="text-xs">
                          {product.discount}% OFF
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{product.vendor}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-accent text-accent" />
                          <span className="text-xs">{product.rating}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Truck className="h-3 w-3" />
                          {product.deliveryTime}
                        </div>
                      </div>
                      
                      <div className="bg-primary/10 p-2 rounded mt-2">
                        <p className="text-xs font-medium text-primary mb-1">🎯 Why recommended:</p>
                        <p className="text-xs text-muted-foreground">{product.reason}</p>
                        <p className="text-xs text-primary font-medium">{product.fieldMatch}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground line-through">
                      {product.originalPrice}
                    </span>
                    <div className="text-lg font-bold text-primary">{product.price}</div>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {product.category}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button className="flex-1" size="sm">
                    <CreditCard className="h-4 w-4 mr-1" />
                    Quick Buy
                  </Button>
                  <Button variant="outline" size="sm">
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="browse" className="space-y-4">
            <div className="space-y-4">
              {allProducts.map((product) => (
                <div key={product.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className="text-2xl">{product.image}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{product.name}</h4>
                        <p className="text-sm text-muted-foreground">{product.vendor}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-accent text-accent" />
                            <span className="text-xs">{product.rating}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Truck className="h-3 w-3" />
                            {product.deliveryTime}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{product.price}</div>
                      <Badge variant="outline" className="mt-1">
                        {product.category}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1" size="sm">
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Add to Cart
                    </Button>
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4 mr-1" />
                      Call Vendor
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="payment" className="space-y-4">
            <div className="bg-success/10 border border-success/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-success" />
                <span className="font-semibold">Secure Payment Options</span>
              </div>
              <p className="text-sm text-muted-foreground">
                All vendors verified • COD available • UPI payments accepted
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl mb-2">📱</div>
                <p className="text-sm font-medium">UPI</p>
                <p className="text-xs text-muted-foreground">Instant payment</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl mb-2">💳</div>
                <p className="text-sm font-medium">Cards</p>
                <p className="text-xs text-muted-foreground">Secure checkout</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl mb-2">💰</div>
                <p className="text-sm font-medium">COD</p>
                <p className="text-xs text-muted-foreground">Pay on delivery</p>
              </div>
            </div>

            <Button className="w-full" size="lg">
              <CreditCard className="h-5 w-5 mr-2" />
              Proceed to Checkout
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Marketplace;