/**
 * Anand Saathi Unified Marketplace
 * Simple marketplace for agricultural products and services
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShoppingCart, 
  Package, 
  Truck, 
  Star,
  Search,
  Filter,
  Heart,
  Share2,
  Phone,
  MapPin,
  Brain,
  Target
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface AnandSaathiUnifiedMarketplaceProps {
  farmId?: string;
}

const AnandSaathiUnifiedMarketplace: React.FC<AnandSaathiUnifiedMarketplaceProps> = ({ farmId }) => {
  const { t, isPunjabi, isHindi } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  // Enhanced marketplace data with AI recommendations
  const products = [
    {
      id: '1',
      name: isPunjabi ? 'ਉੱਨਤ ਖਾਦ (46% N)' : isHindi ? 'उन्नत खाद (46% N)' : 'Premium Fertilizer (46% N)',
      price: 420,
      originalPrice: 500,
      unit: isPunjabi ? 'ਬੋਰੀ' : isHindi ? 'बोरी' : 'bag',
      rating: 4.5,
      vendor: isPunjabi ? 'ਪੰਜਾਬ ਖੇਤੀ ਸੇਵਾਵਾਂ' : isHindi ? 'पंजाब खेती सेवाएं' : 'Punjab Agriculture Services',
      location: isPunjabi ? 'ਲੁਧਿਆਣਾ' : isHindi ? 'लुधियाना' : 'Ludhiana',
      category: 'fertilizer',
      image: '🌾',
      reason: isPunjabi ? 'AI ਨੇ ਤੁਹਾਡੇ ਖੇਤ ਵਿੱਚ ਘੱਟ NDRE ਖੋਜਿਆ - ਨਾਈਟ੍ਰੋਜਨ ਦੀ ਕਮੀ' : isHindi ? 'AI ने आपके खेत में कम NDRE खोजा - नाइट्रोजन की कमी' : 'AI detected low NDRE in your field - nitrogen deficiency',
      urgency: 'high',
      fieldMatch: isPunjabi ? 'ਤੁਹਾਡਾ ਖੇਤ - 1.2 ਹੈਕਟੇਅਰ' : isHindi ? 'आपका खेत - 1.2 हेक्टेयर' : 'Your Field - 1.2 hectares',
      discount: 16,
      aiConfidence: '95%',
      expectedYield: '+15%',
      deliveryTime: isPunjabi ? '2-3 ਦਿਨ' : isHindi ? '2-3 दिन' : '2-3 days'
    },
    {
      id: '2',
      name: isPunjabi ? 'ਡ੍ਰਿਪ ਸਿੰਚਾਈ ਕਿਟ' : isHindi ? 'ड्रिप सिंचाई किट' : 'Drip Irrigation Kit',
      price: 8500,
      originalPrice: 9500,
      unit: isPunjabi ? 'ਕਿਟ' : isHindi ? 'किट' : 'kit',
      rating: 4.6,
      vendor: isPunjabi ? 'ਸਿੰਚਾਈ ਟੈਕ' : isHindi ? 'सिंचाई टेक' : 'Irrigation Tech',
      location: isPunjabi ? 'ਚੰਡੀਗੜ੍ਹ' : isHindi ? 'चंडीगढ़' : 'Chandigarh',
      category: 'equipment',
      image: '💧',
      reason: isPunjabi ? 'AI ਨੇ ਖੇਤ ਵਿਸ਼ਲੇਸ਼ਣ ਵਿੱਚ ਪਾਣੀ ਦਾ ਤਣਾਅ ਖੋਜਿਆ' : isHindi ? 'AI ने खेत विश्लेषण में पानी का तनाव खोजा' : 'AI detected water stress in field analysis',
      urgency: 'medium',
      fieldMatch: isPunjabi ? 'ਸਾਰੇ ਖੇਤ - ਪਾਣੀ ਦਾ ਤਣਾਅ ਖੋਜਿਆ ਗਿਆ' : isHindi ? 'सभी खेत - पानी का तनाव खोजा गया' : 'All fields - water stress detected',
      discount: 11,
      aiConfidence: '87%',
      expectedYield: '+20%',
      deliveryTime: isPunjabi ? '5-7 ਦਿਨ' : isHindi ? '5-7 दिन' : '5-7 days'
    },
    {
      id: '3',
      name: isPunjabi ? 'ਜੈਵਿਕ ਕੀਟਨਾਸ਼ਕ ਸਪ੍ਰੇ' : isHindi ? 'जैविक कीटनाशक स्प्रे' : 'Organic Pesticide Spray',
      price: 850,
      originalPrice: 950,
      unit: isPunjabi ? 'ਲੀਟਰ' : isHindi ? 'लीटर' : 'liter',
      rating: 4.3,
      vendor: isPunjabi ? 'ਗ੍ਰੀਨ ਫਾਰਮ ਕੋ.' : isHindi ? 'ग्रीन फार्म को.' : 'Green Farm Co.',
      location: isPunjabi ? 'ਅੰਮ੍ਰਿਤਸਰ' : isHindi ? 'अमृतसर' : 'Amritsar',
      category: 'pesticide',
      image: '🌿',
      reason: isPunjabi ? 'AI ਨੇ ਖੇਤ ਵਿੱਚ ਕੀਟ ਦੇ ਲੱਛਣ ਖੋਜੇ' : isHindi ? 'AI ने खेत में कीट के लक्षण खोजे' : 'AI detected pest signs in field',
      urgency: 'high',
      fieldMatch: isPunjabi ? 'ਖੇਤ 1 - ਕੀਟ ਦੇ ਲੱਛਣ' : isHindi ? 'खेत 1 - कीट के लक्षण' : 'Field 1 - pest signs',
      discount: 11,
      aiConfidence: '92%',
      expectedYield: '+12%',
      deliveryTime: isPunjabi ? '1-2 ਦਿਨ' : isHindi ? '1-2 दिन' : '1-2 days'
    }
  ];

  const categories = [
    { id: 'all', name: isPunjabi ? 'ਸਭ' : isHindi ? 'सभी' : 'All' },
    { id: 'fertilizer', name: isPunjabi ? 'ਖਾਦ' : isHindi ? 'खाद' : 'Fertilizer' },
    { id: 'seeds', name: isPunjabi ? 'ਬੀਜ' : isHindi ? 'बीज' : 'Seeds' },
    { id: 'pesticide', name: isPunjabi ? 'ਕੀਟਨਾਸ਼ਕ' : isHindi ? 'कीटनाशक' : 'Pesticide' },
    { id: 'equipment', name: isPunjabi ? 'ਉਪਕਰਣ' : isHindi ? 'उपकरण' : 'Equipment' }
  ];

  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.vendor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-primary" />
            {isPunjabi ? 'ਅਨੰਦ ਸਾਥੀ ਮਾਰਕੀਟਪਲੇਸ' : isHindi ? 'अनंद साथी मार्केटप्लेस' : 'Anand Saathi Marketplace'}
          </CardTitle>
          <CardDescription>
            {isPunjabi 
              ? 'ਖੇਤੀ ਉਤਪਾਦਾਂ ਅਤੇ ਸੇਵਾਵਾਂ ਲਈ ਇੱਕ ਮਾਰਕੀਟਪਲੇਸ'
              : isHindi 
              ? 'खेती उत्पादों और सेवाओं के लिए एक मार्केटप्लेस'
              : 'A marketplace for agricultural products and services'
            }
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products">
            <Package className="h-4 w-4 mr-1" />
            {isPunjabi ? 'ਉਤਪਾਦ' : isHindi ? 'उत्पाद' : 'Products'}
          </TabsTrigger>
          <TabsTrigger value="services">
            <Truck className="h-4 w-4 mr-1" />
            {isPunjabi ? 'ਸੇਵਾਵਾਂ' : isHindi ? 'सेवाएं' : 'Services'}
          </TabsTrigger>
          <TabsTrigger value="vendors">
            <MapPin className="h-4 w-4 mr-1" />
            {isPunjabi ? 'ਵਿਕਰੇਤਾ' : isHindi ? 'विक्रेता' : 'Vendors'}
          </TabsTrigger>
          <TabsTrigger value="orders">
            <ShoppingCart className="h-4 w-4 mr-1" />
            {isPunjabi ? 'ਆਰਡਰ' : isHindi ? 'ऑर्डर' : 'Orders'}
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={isPunjabi ? 'ਉਤਪਾਦ ਖੋਜੋ...' : isHindi ? 'उत्पाद खोजें...' : 'Search products...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* AI Recommendations Header */}
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">
                  {isPunjabi ? 'AI ਸਿਫਾਰਸ਼ਾਂ' : isHindi ? 'AI सिफारिशें' : 'AI Recommendations'}
                </h3>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {isPunjabi ? 'ਤੁਹਾਡੇ ਖੇਤ ਲਈ' : isHindi ? 'आपके खेत के लिए' : 'For Your Field'}
                </Badge>
              </div>
              <p className="text-sm text-blue-700">
                {isPunjabi 
                  ? 'AI ਨੇ ਤੁਹਾਡੇ ਖੇਤ ਦੇ ਡੇਟਾ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕੀਤਾ ਹੈ ਅਤੇ ਇਹ ਉਤਪਾਦ ਸਿਫਾਰਸ਼ ਕੀਤੇ ਹਨ'
                  : isHindi 
                  ? 'AI ने आपके खेत के डेटा का विश्लेषण किया है और ये उत्पाद सिफारिश किए हैं'
                  : 'AI has analyzed your field data and recommended these products'
                }
              </p>
            </CardContent>
          </Card>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  {/* AI Recommendation Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <Badge 
                      variant={product.urgency === 'high' ? 'destructive' : product.urgency === 'medium' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {product.urgency === 'high' 
                        ? (isPunjabi ? 'ਤੁਰੰਤ' : isHindi ? 'तुरंत' : 'Urgent')
                        : product.urgency === 'medium'
                        ? (isPunjabi ? 'ਮੱਧਮ' : isHindi ? 'मध्यम' : 'Medium')
                        : (isPunjabi ? 'ਘੱਟ' : isHindi ? 'कम' : 'Low')
                      }
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      AI {product.aiConfidence}
                    </Badge>
                  </div>

                  {/* Product Image */}
                  <div className="aspect-video bg-gray-100 rounded-md mb-3 flex items-center justify-center text-4xl">
                    {product.image}
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-medium">{product.name}</h3>
                    
                    {/* AI Reason */}
                    <div className="bg-blue-50 p-2 rounded-md">
                      <p className="text-xs text-blue-800 font-medium mb-1">
                        {isPunjabi ? 'AI ਕਾਰਨ:' : isHindi ? 'AI कारण:' : 'AI Reason:'}
                      </p>
                      <p className="text-xs text-blue-700">{product.reason}</p>
                    </div>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-sm text-muted-foreground ml-1">
                        {product.rating}
                      </span>
                    </div>
                    
                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-green-600">
                          ₹{product.price}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through ml-2">
                            ₹{product.originalPrice}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground ml-1">/{product.unit}</span>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {product.discount}% {isPunjabi ? 'ਛੂਟ' : isHindi ? 'छूट' : 'OFF'}
                      </Badge>
                    </div>
                    
                    {/* Field Match */}
                    <div className="text-xs text-muted-foreground">
                      <p className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {product.fieldMatch}
                      </p>
                    </div>
                    
                    {/* Expected Yield */}
                    <div className="bg-green-50 p-2 rounded-md">
                      <p className="text-xs text-green-800">
                        <span className="font-medium">
                          {isPunjabi ? 'ਅਪੇਖਿਤ ਉਪਜ:' : isHindi ? 'अपेक्षित उपज:' : 'Expected Yield:'}
                        </span> {product.expectedYield}
                      </p>
                    </div>
                    
                    {/* Vendor Info */}
                    <div className="text-sm text-muted-foreground">
                      <p className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {product.vendor}, {product.location}
                      </p>
                      <p className="flex items-center gap-1 mt-1">
                        <Truck className="h-3 w-3" />
                        {product.deliveryTime}
                      </p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        {isPunjabi ? 'ਖਰੀਦੋ' : isHindi ? 'खरीदें' : 'Buy Now'}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">
            <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{isPunjabi ? 'ਸੇਵਾਵਾਂ ਜਲਦੀ ਆ ਰਹੀਆਂ ਹਨ' : isHindi ? 'सेवाएं जल्दी आ रही हैं' : 'Services coming soon'}</p>
          </div>
        </TabsContent>

        {/* Vendors Tab */}
        <TabsContent value="vendors" className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{isPunjabi ? 'ਵਿਕਰੇਤਾ ਸੂਚੀ ਜਲਦੀ ਆ ਰਹੀ ਹੈ' : isHindi ? 'विक्रेता सूची जल्दी आ रही है' : 'Vendor list coming soon'}</p>
          </div>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{isPunjabi ? 'ਆਰਡਰ ਇਤਿਹਾਸ ਜਲਦੀ ਆ ਰਿਹਾ ਹੈ' : isHindi ? 'ऑर्डर इतिहास जल्दी आ रहा है' : 'Order history coming soon'}</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnandSaathiUnifiedMarketplace;