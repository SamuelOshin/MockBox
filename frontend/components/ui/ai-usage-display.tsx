import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Zap, Calendar, Clock, AlertCircle, TrendingUp, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIUsageDisplayProps {
  usage: {
    requestsToday: number;
    requestsThisMonth: number;
    tokensUsedToday: number;
    tokensUsedThisMonth: number;
    rateLimitRemaining: number;
    planName?: string;
    dailyRequestQuota?: number;
    monthlyTokenQuota?: number;
  };
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

export function AIUsageDisplay({ usage, variant = 'default', className }: AIUsageDisplayProps) {
  // Provide safe defaults for potentially undefined values
  const dailyRequestQuota = usage.dailyRequestQuota ?? 10;
  const monthlyTokenQuota = usage.monthlyTokenQuota ?? 10000;
  const planName = usage.planName ?? 'free';
  
  const dailyUsagePercentage = Math.min((usage.requestsToday / dailyRequestQuota) * 100, 100);
  const monthlyTokenPercentage = Math.min((usage.tokensUsedThisMonth / monthlyTokenQuota) * 100, 100);
  const remainingTokens = monthlyTokenQuota - usage.tokensUsedThisMonth;

  if (variant === 'compact') {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium">AI Usage</span>
          </div>
          <Badge variant="outline" className="capitalize text-xs">
            {planName} Plan
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Daily Requests</span>
            <span className="font-medium">{usage.requestsToday}/{dailyRequestQuota}</span>
          </div>
          <Progress value={dailyUsagePercentage} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {usage.rateLimitRemaining} requests remaining today
          </p>
        </div>

        {usage.rateLimitRemaining <= 2 && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-3 w-3" />
            <AlertDescription className="text-xs">
              Only {usage.rateLimitRemaining} AI generations remaining today
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={cn("space-y-4", className)}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            <h3 className="text-base font-semibold">AI Usage Dashboard</h3>
          </div>
          <Badge variant="outline" className="capitalize">
            {planName} Plan
          </Badge>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3">
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">{usage.requestsToday}</div>
              <div className="text-xs text-muted-foreground">Today</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{usage.tokensUsedToday.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Tokens</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">{usage.rateLimitRemaining}</div>
              <div className="text-xs text-muted-foreground">Remaining</div>
            </div>
          </Card>
        </div>

        {/* Daily Requests */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              Daily Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Used: <span className="font-semibold">{usage.requestsToday}</span></span>
              <span>Limit: <span className="font-semibold">{dailyRequestQuota}</span></span>
            </div>
            <Progress value={dailyUsagePercentage} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{dailyUsagePercentage.toFixed(1)}% used</span>
              <span>{usage.rateLimitRemaining} remaining</span>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Tokens */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              Monthly Tokens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Used: <span className="font-semibold">{usage.tokensUsedThisMonth.toLocaleString()}</span></span>
              <span>Limit: <span className="font-semibold">{monthlyTokenQuota.toLocaleString()}</span></span>
            </div>
            <Progress value={monthlyTokenPercentage} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{monthlyTokenPercentage.toFixed(1)}% used</span>
              <span>{(remainingTokens / 1000).toFixed(1)}k remaining</span>
            </div>
          </CardContent>
        </Card>

        {/* Warnings */}
        {usage.rateLimitRemaining <= 2 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              ⚠️ Only {usage.rateLimitRemaining} AI generations remaining today. 
              {usage.rateLimitRemaining === 0 && " You've reached your daily limit."}
            </AlertDescription>
          </Alert>
        )}

        {monthlyTokenPercentage > 80 && (
          <Alert className="border-orange-200 bg-orange-50">
            <TrendingUp className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              🔥 You've used {monthlyTokenPercentage.toFixed(0)}% of your monthly tokens. 
              Consider upgrading your plan if you need more.
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Brain className="h-4 w-4 text-purple-500" />
            AI Usage
          </CardTitle>
          <Badge variant="outline" className="capitalize text-xs">
            {planName} Plan
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Usage Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-muted-foreground text-xs">Daily Requests</div>
            <div className="font-semibold text-base">
              {usage.requestsToday}<span className="text-muted-foreground font-normal">/{dailyRequestQuota}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground text-xs">Monthly Tokens</div>
            <div className="font-semibold text-base">
              {usage.tokensUsedThisMonth.toLocaleString()}<span className="text-muted-foreground font-normal">/{monthlyTokenQuota.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Daily Progress</span>
            <span>{dailyUsagePercentage.toFixed(0)}% used</span>
          </div>
          <Progress value={dailyUsagePercentage} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {usage.rateLimitRemaining} requests remaining today
          </p>
        </div>

        {/* Warnings */}
        {usage.rateLimitRemaining <= 2 && (
          <Alert variant={usage.rateLimitRemaining === 0 ? "destructive" : "default"} className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              {usage.rateLimitRemaining === 0 
                ? "Daily limit reached. Try again tomorrow." 
                : `Only ${usage.rateLimitRemaining} AI generations remaining today.`
              }
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
