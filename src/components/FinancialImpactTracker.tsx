import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Banknote, Leaf, Shield, Award, Target } from 'lucide-react';
import { FinancialImpact } from '@/data/enhancedDemoData';

interface FinancialImpactTrackerProps {
  financialData: FinancialImpact;
  timeframe: string;
}

const FinancialImpactTracker: React.FC<FinancialImpactTrackerProps> = ({ 
  financialData, 
  timeframe 
}) => {
  const formatCurrency = (amount: number | undefined) => {
    if (!amount || isNaN(amount)) {
      return '₹0';
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  const netProfit = (financialData.currentRevenue || 0) - (financialData.inputCosts || 0) + (financialData.savedCosts || 0);
  const profitGrowth = financialData.currentRevenue && financialData.projectedRevenue 
    ? ((financialData.projectedRevenue - financialData.currentRevenue) / financialData.currentRevenue) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Revenue Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-success" />
            <span>Revenue Impact ({timeframe})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Current Revenue</div>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(financialData.currentRevenue)}
              </div>
              <div className="text-xs text-muted-foreground">From {timeframe} harvest</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Projected Revenue</div>
              <div className="text-2xl font-bold text-success">
                {formatCurrency(financialData.projectedRevenue)}
              </div>
              <Badge variant="outline" className="text-success border-success">
                +{profitGrowth.toFixed(1)}% growth
              </Badge>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Revenue Progress</span>
              <span>{financialData.currentRevenue && financialData.projectedRevenue ? ((financialData.currentRevenue / financialData.projectedRevenue) * 100).toFixed(0) : 0}%</span>
            </div>
            <Progress 
              value={financialData.currentRevenue && financialData.projectedRevenue ? (financialData.currentRevenue / financialData.projectedRevenue) * 100 : 0} 
              className="h-3"
            />
          </div>
        </CardContent>
      </Card>

      {/* Cost Savings & Efficiency */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Banknote className="h-5 w-5 text-green-600" />
            <span>Cost Optimization</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm text-green-700 mb-1">Input Costs</div>
              <div className="text-xl font-bold text-green-800">
                {formatCurrency(financialData.inputCosts)}
              </div>
              <div className="text-xs text-green-600">Seeds, fertilizer, pesticides</div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-700 mb-1">Costs Saved</div>
              <div className="text-xl font-bold text-blue-800">
                {formatCurrency(financialData.savedCosts)}
              </div>
              <div className="text-xs text-blue-600">Through smart farming</div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-primary mb-1">Net Profit</div>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(netProfit)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Profit Margin</div>
                <div className="text-lg font-semibold">
                  {financialData.profitMargin || 0}%
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ROI & Investment Returns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-purple-600" />
            <span>Investment Returns</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium">Total ROI</div>
                  <div className="text-sm text-muted-foreground">On Soil Saathi investment</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {financialData.roiPercentage || 0}%
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Leaf className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Carbon Credits</span>
                </div>
                <div className="text-lg font-bold">{formatCurrency(financialData.carbonCredits || 0)}</div>
                <div className="text-xs text-muted-foreground">Sustainable farming bonus</div>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Gov. Subsidy</span>
                </div>
                <div className="text-lg font-bold">{formatCurrency(financialData.governmentSubsidy || 0)}</div>
                <div className="text-xs text-muted-foreground">Digital farming incentive</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-amber-600" />
            <span>Achievement Unlocked</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="text-amber-600 text-lg">🏆</div>
              <div>
                <div className="font-medium text-amber-800">Top Performer</div>
                <div className="text-sm text-amber-700">
                  Achieved {financialData.roiPercentage || 0}% ROI - Top 5% of farmers in region
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-green-600 text-lg">🌱</div>
              <div>
                <div className="font-medium text-green-800">Sustainability Champion</div>
                <div className="text-sm text-green-700">
                  Earned {formatCurrency(financialData.carbonCredits || 0)} in carbon credits
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-blue-600 text-lg">💡</div>
              <div>
                <div className="font-medium text-blue-800">Innovation Adopter</div>
                <div className="text-sm text-blue-700">
                  Early adopter of satellite-based farming technology
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialImpactTracker;
