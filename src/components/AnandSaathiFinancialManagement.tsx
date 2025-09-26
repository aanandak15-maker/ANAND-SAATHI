/**
 * Anand Saathi Financial Management
 * Comprehensive financial planning, cost tracking, and revenue management for farmers
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calculator,
  PieChart,
  BarChart3,
  Calendar,
  Receipt,
  Target,
  PiggyBank,
  CreditCard,
  Wallet,
  FileText,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { toast } from 'sonner';

interface FinancialTransaction {
  id: string;
  type: 'income' | 'expense' | 'investment' | 'loan' | 'subsidy';
  category: string;
  amount: number;
  description: string;
  date: string;
  field_id?: string;
  crop_type?: string;
  recurring: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

interface BudgetPlan {
  id: string;
  name: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date: string;
  categories: BudgetCategory[];
  total_budget: number;
  spent_amount: number;
  status: 'active' | 'completed' | 'overdue';
}

interface BudgetCategory {
  name: string;
  allocated: number;
  spent: number;
  color: string;
}

interface RevenueProjection {
  id: string;
  crop_type: string;
  field_id: string;
  field_name: string;
  expected_yield: number;
  expected_price_per_unit: number;
  projected_revenue: number;
  harvest_date: string;
  confidence_level: 'high' | 'medium' | 'low';
  actual_revenue?: number;
}

const AnandSaathiFinancialManagement: React.FC = () => {
  const { t, isPunjabi, isHindi } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([
    {
      id: '1',
      type: 'expense',
      category: 'Fertilizer',
      amount: 2500,
      description: 'Urea and DAP for rice crop',
      date: '2024-09-20',
      field_id: '1',
      crop_type: 'Rice',
      recurring: false
    },
    {
      id: '2',
      type: 'expense',
      category: 'Irrigation',
      amount: 800,
      description: 'Diesel for water pump',
      date: '2024-09-18',
      field_id: '1',
      crop_type: 'Rice',
      recurring: true,
      frequency: 'weekly'
    },
    {
      id: '3',
      type: 'income',
      category: 'Crop Sale',
      amount: 15000,
      description: 'Wheat crop sale to local market',
      date: '2024-09-15',
      field_id: '2',
      crop_type: 'Wheat',
      recurring: false
    },
    {
      id: '4',
      type: 'subsidy',
      category: 'Government Subsidy',
      amount: 5000,
      description: 'PM Kisan scheme payment',
      date: '2024-09-10',
      recurring: true,
      frequency: 'quarterly'
    }
  ]);

  const [budgetPlans, setBudgetPlans] = useState<BudgetPlan[]>([
    {
      id: '1',
      name: 'Q4 2024 Crop Budget',
      period: 'quarterly',
      start_date: '2024-10-01',
      end_date: '2024-12-31',
      total_budget: 50000,
      spent_amount: 28500,
      status: 'active',
      categories: [
        { name: 'Seeds', allocated: 8000, spent: 7200, color: '#3B82F6' },
        { name: 'Fertilizer', allocated: 15000, spent: 12800, color: '#10B981' },
        { name: 'Irrigation', allocated: 10000, spent: 8500, color: '#F59E0B' },
        { name: 'Labor', allocated: 12000, spent: 5000, color: '#EF4444' },
        { name: 'Equipment', allocated: 5000, spent: 0, color: '#8B5CF6' }
      ]
    }
  ]);

  const [revenueProjections, setRevenueProjections] = useState<RevenueProjection[]>([
    {
      id: '1',
      crop_type: 'Rice',
      field_id: '1',
      field_name: 'North Rice Field',
      expected_yield: 2.4,
      expected_price_per_unit: 2200,
      projected_revenue: 52800,
      harvest_date: '2024-11-15',
      confidence_level: 'high'
    },
    {
      id: '2',
      crop_type: 'Wheat',
      field_id: '2',
      field_name: 'Wheat Field A',
      expected_yield: 3.2,
      expected_price_per_unit: 2400,
      projected_revenue: 76800,
      harvest_date: '2024-04-15',
      confidence_level: 'medium'
    }
  ]);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'income': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'expense': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'investment': return <Target className="h-4 w-4 text-blue-500" />;
      case 'loan': return <CreditCard className="h-4 w-4 text-orange-500" />;
      case 'subsidy': return <PiggyBank className="h-4 w-4 text-purple-500" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const calculateFinancialSummary = () => {
    const totalIncome = transactions
      .filter(t => t.type === 'income' || t.type === 'subsidy')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netProfit = totalIncome - totalExpenses;
    const totalProjectedRevenue = revenueProjections.reduce((sum, p) => sum + p.projected_revenue, 0);

    return {
      totalIncome,
      totalExpenses,
      netProfit,
      totalProjectedRevenue,
      profitMargin: totalIncome > 0 ? ((netProfit / totalIncome) * 100) : 0
    };
  };

  const summary = calculateFinancialSummary();

  const handleAddTransaction = () => {
    toast.success(isPunjabi ? 'ਵਿੱਤੀ ਲੈਣ-ਦੇਣ ਜੋੜਨ ਲਈ ਅੱਗੇ ਵਧ ਰਹੇ ਹਾਂ' : isHindi ? 'वित्तीय लेन-देन जोड़ने के लिए आगे बढ़ रहे हैं' : 'Adding financial transaction functionality coming soon');
  };

  const handleAddBudget = () => {
    toast.success(isPunjabi ? 'ਬਜਟ ਯੋਜਨਾ ਜੋੜਨ ਲਈ ਅੱਗੇ ਵਧ ਰਹੇ ਹਾਂ' : isHindi ? 'बजट योजना जोड़ने के लिए आगे बढ़ रहे हैं' : 'Adding budget planning functionality coming soon');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            {isPunjabi ? 'ਅਨੰਦ ਸਾਥੀ ਵਿੱਤੀ ਪ੍ਰਬੰਧਨ' : isHindi ? 'अनंद साथी वित्तीय प्रबंधन' : 'Anand Saathi Financial Management'}
          </CardTitle>
          <CardDescription>
            {isPunjabi ? 'ਆਪਣੀ ਖੇਤੀ ਦੀ ਲਾਗਤ, ਆਮਦਨ ਅਤੇ ਬਜਟ ਦਾ ਵਿਆਪਕ ਪ੍ਰਬੰਧਨ' : isHindi ? 'अपनी कृषि की लागत, आय और बजट का व्यापक प्रबंधन' : 'Comprehensive management of your farming costs, income, and budget'}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">₹{summary.totalIncome.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">
              {isPunjabi ? 'ਕੁਲ ਆਮਦਨ' : isHindi ? 'कुल आय' : 'Total Income'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">₹{summary.totalExpenses.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">
              {isPunjabi ? 'ਕੁਲ ਖਰਚੇ' : isHindi ? 'कुल खर्चे' : 'Total Expenses'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className={`text-2xl font-bold ${summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{summary.netProfit.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              {isPunjabi ? 'ਸ਼ੁੱਧ ਲਾਭ' : isHindi ? 'शुद्ध लाभ' : 'Net Profit'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {summary.profitMargin.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">
              {isPunjabi ? 'ਲਾਭ ਮਾਰਜਿਨ' : isHindi ? 'लाभ मार्जिन' : 'Profit Margin'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-1" />
            {isPunjabi ? 'ਅਵਲੋਕਨ' : isHindi ? 'अवलोकन' : 'Overview'}
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <Receipt className="h-4 w-4 mr-1" />
            {isPunjabi ? 'ਲੈਣ-ਦੇਣ' : isHindi ? 'लेन-देन' : 'Transactions'}
          </TabsTrigger>
          <TabsTrigger value="budget">
            <Calculator className="h-4 w-4 mr-1" />
            {isPunjabi ? 'ਬਜਟ' : isHindi ? 'बजट' : 'Budget'}
          </TabsTrigger>
          <TabsTrigger value="revenue">
            <TrendingUp className="h-4 w-4 mr-1" />
            {isPunjabi ? 'ਆਮਦਨ' : isHindi ? 'आय' : 'Revenue'}
          </TabsTrigger>
          <TabsTrigger value="reports">
            <PieChart className="h-4 w-4 mr-1" />
            {isPunjabi ? 'ਰਿਪੋਰਟਸ' : isHindi ? 'रिपोर्ट्स' : 'Reports'}
          </TabsTrigger>
          <TabsTrigger value="planning">
            <Target className="h-4 w-4 mr-1" />
            {isPunjabi ? 'ਯੋਜਨਾ' : isHindi ? 'योजना' : 'Planning'}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>{isPunjabi ? 'ਹਾਲੀਆ ਲੈਣ-ਦੇਣ' : isHindi ? 'हालिया लेन-देन' : 'Recent Transactions'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <p className="font-medium text-sm">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">{transaction.category}</p>
                        </div>
                      </div>
                      <div className={`font-medium ${transaction.type === 'income' || transaction.type === 'subsidy' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' || transaction.type === 'subsidy' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Budget Overview */}
            <Card>
              <CardHeader>
                <CardTitle>{isPunjabi ? 'ਬਜਟ ਅਵਲੋਕਨ' : isHindi ? 'बजट अवलोकन' : 'Budget Overview'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {budgetPlans.map((budget) => (
                    <div key={budget.id}>
                      <div className="flex justify-between text-sm mb-2">
                        <span>{budget.name}</span>
                        <span>{budget.spent_amount.toLocaleString()} / {budget.total_budget.toLocaleString()}</span>
                      </div>
                      <Progress value={(budget.spent_amount / budget.total_budget) * 100} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{Math.round((budget.spent_amount / budget.total_budget) * 100)}% used</span>
                        <Badge variant={budget.status === 'active' ? 'default' : 'secondary'}>
                          {budget.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Projections */}
          <Card>
            <CardHeader>
              <CardTitle>{isPunjabi ? 'ਆਮਦਨ ਪ੍ਰੋਜੈਕਸ਼ਨ' : isHindi ? 'आय प्रोजेक्शन' : 'Revenue Projections'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {revenueProjections.map((projection) => (
                  <Card key={projection.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{projection.crop_type}</CardTitle>
                        <Badge variant="outline" className={getConfidenceColor(projection.confidence_level)}>
                          {projection.confidence_level}
                        </Badge>
                      </div>
                      <CardDescription>{projection.field_name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            {isPunjabi ? 'ਅਨੁਮਾਨਿਤ ਉਤਪਾਦਨ' : isHindi ? 'अनुमानित उत्पादन' : 'Expected Yield'}
                          </span>
                          <span className="font-medium">{projection.expected_yield} tons</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            {isPunjabi ? 'ਅਨੁਮਾਨਿਤ ਕੀਮਤ' : isHindi ? 'अनुमानित कीमत' : 'Expected Price'}
                          </span>
                          <span className="font-medium">₹{projection.expected_price_per_unit}/ton</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            {isPunjabi ? 'ਪ੍ਰੋਜੈਕਟਡ ਆਮਦਨ' : isHindi ? 'प्रोजेक्टेड आय' : 'Projected Revenue'}
                          </span>
                          <span className="font-medium text-green-600">₹{projection.projected_revenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            {isPunjabi ? 'ਵਾਢੀ ਦੀ ਮਿਤੀ' : isHindi ? 'कटाई की तारीख' : 'Harvest Date'}
                          </span>
                          <span className="font-medium">{new Date(projection.harvest_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {isPunjabi ? 'ਸਾਰੇ ਲੈਣ-ਦੇਣ' : isHindi ? 'सभी लेन-देन' : 'All Transactions'}
            </h3>
            <Button onClick={handleAddTransaction}>
              <Plus className="h-4 w-4 mr-2" />
              {isPunjabi ? 'ਲੈਣ-ਦੇਣ ਜੋੜੋ' : isHindi ? 'लेन-देन जोड़ें' : 'Add Transaction'}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {transactions.map((transaction) => (
              <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTransactionIcon(transaction.type)}
                      <CardTitle className="text-lg">{transaction.category}</CardTitle>
                    </div>
                    <Badge variant={transaction.type === 'income' || transaction.type === 'subsidy' ? 'default' : 'secondary'}>
                      {transaction.type}
                    </Badge>
                  </div>
                  <CardDescription>{transaction.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className={`text-xl font-bold ${transaction.type === 'income' || transaction.type === 'subsidy' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' || transaction.type === 'subsidy' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {isPunjabi ? 'ਮਿਤੀ' : isHindi ? 'तारीख' : 'Date'}
                      </span>
                      <span>{new Date(transaction.date).toLocaleDateString()}</span>
                    </div>
                    {transaction.field_id && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {isPunjabi ? 'ਖੇਤ' : isHindi ? 'खेत' : 'Field'}
                        </span>
                        <span>{transaction.field_name}</span>
                      </div>
                    )}
                    {transaction.recurring && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {isPunjabi ? 'ਦੁਹਰਾਉਣ ਵਾਲਾ' : isHindi ? 'दोहराने वाला' : 'Recurring'}
                        </span>
                        <Badge variant="outline">{transaction.frequency}</Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Budget Tab */}
        <TabsContent value="budget" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {isPunjabi ? 'ਬਜਟ ਯੋਜਨਾਵਾਂ' : isHindi ? 'बजट योजनाएं' : 'Budget Plans'}
            </h3>
            <Button onClick={handleAddBudget}>
              <Plus className="h-4 w-4 mr-2" />
              {isPunjabi ? 'ਬਜਟ ਜੋੜੋ' : isHindi ? 'बजट जोड़ें' : 'Add Budget'}
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {budgetPlans.map((budget) => (
              <Card key={budget.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{budget.name}</CardTitle>
                    <Badge variant={budget.status === 'active' ? 'default' : 'secondary'}>
                      {budget.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {new Date(budget.start_date).toLocaleDateString()} - {new Date(budget.end_date).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>{isPunjabi ? 'ਕੁਲ ਬਜਟ' : isHindi ? 'कुल बजट' : 'Total Budget'}</span>
                        <span>₹{budget.total_budget.toLocaleString()}</span>
                      </div>
                      <Progress value={(budget.spent_amount / budget.total_budget) * 100} className="h-3" />
                      <div className="flex justify-between text-sm text-muted-foreground mt-1">
                        <span>₹{budget.spent_amount.toLocaleString()} spent</span>
                        <span>{Math.round((budget.spent_amount / budget.total_budget) * 100)}% used</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {budget.categories.map((category, index) => (
                        <div key={index} className="text-center">
                          <div
                            className="w-4 h-4 rounded mx-auto mb-1"
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <p className="text-xs font-medium">{category.name}</p>
                          <p className="text-xs text-muted-foreground">
                            ₹{category.spent.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {isPunjabi ? 'ਆਮਦਨ ਪ੍ਰੋਜੈਕਸ਼ਨਸ' : isHindi ? 'आय प्रोजेक्शन' : 'Revenue Projections'}
            </h3>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              {isPunjabi ? 'ਪ੍ਰੋਜੈਕਸ਼ਨ ਜੋੜੋ' : isHindi ? 'प्रोजेक्शन जोड़ें' : 'Add Projection'}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {revenueProjections.map((projection) => (
              <Card key={projection.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{projection.crop_type}</CardTitle>
                    <Badge variant="outline" className={getConfidenceColor(projection.confidence_level)}>
                      {projection.confidence_level}
                    </Badge>
                  </div>
                  <CardDescription>{projection.field_name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {isPunjabi ? 'ਅਨੁਮਾਨਿਤ ਉਤਪਾਦਨ' : isHindi ? 'अनुमानित उत्पादन' : 'Expected Yield'}
                      </span>
                      <span className="font-medium">{projection.expected_yield} tons</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {isPunjabi ? 'ਅਨੁਮਾਨਿਤ ਕੀਮਤ' : isHindi ? 'अनुमानित कीमत' : 'Expected Price'}
                      </span>
                      <span className="font-medium">₹{projection.expected_price_per_unit}/ton</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {isPunjabi ? 'ਪ੍ਰੋਜੈਕਟਡ ਆਮਦਨ' : isHindi ? 'प्रोजेक्टेड आय' : 'Projected Revenue'}
                      </span>
                      <span className="font-medium text-green-600 text-lg">₹{projection.projected_revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {isPunjabi ? 'ਵਾਢੀ ਦੀ ਮਿਤੀ' : isHindi ? 'कटाई की तारीख' : 'Harvest Date'}
                      </span>
                      <span className="font-medium">{new Date(projection.harvest_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-24 flex-col">
              <Download className="h-6 w-6 mb-2" />
              {isPunjabi ? 'ਵਿੱਤੀ ਰਿਪੋਰਟ' : isHindi ? 'वित्तीय रिपोर्ट' : 'Financial Report'}
            </Button>
            <Button variant="outline" className="h-24 flex-col">
              <BarChart3 className="h-6 w-6 mb-2" />
              {isPunjabi ? 'ਲਾਭ-ਹਾਨੀ ਰਿਪੋਰਟ' : isHindi ? 'लाभ-हानि रिपोर्ट' : 'Profit & Loss Report'}
            </Button>
            <Button variant="outline" className="h-24 flex-col">
              <PieChart className="h-6 w-6 mb-2" />
              {isPunjabi ? 'ਖਰਚ ਵੰਡ ਰਿਪੋਰਟ' : isHindi ? 'खर्च वितरण रिपोर्ट' : 'Expense Distribution Report'}
            </Button>
            <Button variant="outline" className="h-24 flex-col">
              <FileText className="h-6 w-6 mb-2" />
              {isPunjabi ? 'ਟੈਕਸ ਰਿਪੋਰਟ' : isHindi ? 'टैक्स रिपोर्ट' : 'Tax Report'}
            </Button>
          </div>
        </TabsContent>

        {/* Planning Tab */}
        <TabsContent value="planning" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{isPunjabi ? 'ਵਿੱਤੀ ਯੋਜਨਾ' : isHindi ? 'वित्तीय योजना' : 'Financial Planning'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border rounded">
                    <Target className="h-5 w-5 text-blue-500" />
                    <div>
                      <h4 className="font-medium">
                        {isPunjabi ? 'ਲਾਭ ਮਾਰਜਿਨ ਟਾਰਗੇਟ' : isHindi ? 'लाभ मार्जिन लक्ष्य' : 'Profit Margin Target'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {isPunjabi ? 'ਇਸ ਸਾਲ ਦਾ ਟਾਰਗੇਟ 25% ਲਾਭ ਮਾਰਜਿਨ' : isHindi ? 'इस साल का लक्ष्य 25% लाभ मार्जिन' : 'Target 25% profit margin this year'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded">
                    <PiggyBank className="h-5 w-5 text-green-500" />
                    <div>
                      <h4 className="font-medium">
                        {isPunjabi ? 'ਬਚਤ ਟਾਰਗੇਟ' : isHindi ? 'बचत लक्ष्य' : 'Savings Target'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {isPunjabi ? 'ਸਾਲਾਨਾ ₹50,000 ਬਚਤ ਦਾ ਟਾਰਗੇਟ' : isHindi ? 'सालाना ₹50,000 बचत का लक्ष्य' : 'Annual ₹50,000 savings target'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded">
                    <Calculator className="h-5 w-5 text-purple-500" />
                    <div>
                      <h4 className="font-medium">
                        {isPunjabi ? 'ਲਾਗਤ ਨਿਯੰਤਰਣ' : isHindi ? 'लागत नियंत्रण' : 'Cost Control'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {isPunjabi ? 'ਪ੍ਰਤੀ ਏਕੜ ਲਾਗਤ ਨੂੰ 15% ਘਟਾਓ' : isHindi ? 'प्रति एकड़ लागत को 15% घटाएं' : 'Reduce cost per acre by 15%'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{isPunjabi ? 'ਵਿੱਤੀ ਸਲਾਹ' : isHindi ? 'वित्तीय सलाह' : 'Financial Advice'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-800">
                      {isPunjabi ? 'ਸਰਕਾਰੀ ਸਬਸਿਡੀਆਂ' : isHindi ? 'सरकारी सब्सिडी' : 'Government Subsidies'}
                    </h4>
                    <p className="text-sm text-green-700">
                      {isPunjabi ? 'ਤੁਸੀਂ PM Kisan ਅਤੇ ਰਾਜ ਸਬਸਿਡੀਆਂ ਲਈ ਯੋਗ ਹੋ' : isHindi ? 'आप PM किसान और राज्य सब्सिडी के लिए योग्य हैं' : 'You are eligible for PM Kisan and state subsidies'}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800">
                      {isPunjabi ? 'ਬੀਮਾ ਕਵਰੇਜ' : isHindi ? 'बीमा कवरेज' : 'Insurance Coverage'}
                    </h4>
                    <p className="text-sm text-blue-700">
                      {isPunjabi ? 'ਆਪਣੀ ਫਸਲ ਅਤੇ ਉਪਕਰਨਾਂ ਦਾ ਬੀਮਾ ਕਰਵਾਓ' : isHindi ? 'अपनी फसल और उपकरणों का बीमा करवाएं' : 'Get insurance coverage for your crops and equipment'}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-medium text-yellow-800">
                      {isPunjabi ? 'ਲਾਗਤ ਘਟਾਓ' : isHindi ? 'लागत कम करें' : 'Reduce Costs'}
                    </h4>
                    <p className="text-sm text-yellow-700">
                      {isPunjabi ? 'ਸਮੂਹ ਖਰੀਦ ਅਤੇ ਜੈਵਿਕ ਖੇਤੀ ਨਾਲ ਲਾਗਤ ਘਟਾਓ' : isHindi ? 'समूह खरीद और जैविक खेती से लागत कम करें' : 'Reduce costs through group purchasing and organic farming'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnandSaathiFinancialManagement;
