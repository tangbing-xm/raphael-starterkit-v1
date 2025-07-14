"use client";

import React, { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ClickSwitchPricingProps {
  subscriptionContent: React.ReactNode;
  creditsContent: React.ReactNode;
  className?: string;
}

type TabType = 'subscription' | 'credits';

export function ClickSwitchPricing({
  subscriptionContent,
  creditsContent,
  className,
}: ClickSwitchPricingProps) {
  const [activeTab, setActiveTab] = useState<TabType>('subscription');

  // 优化性能：使用useCallback避免不必要的重渲染
  const handleTabSwitch = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  // 键盘导航支持
  const handleKeyDown = useCallback((event: React.KeyboardEvent, tab: TabType) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleTabSwitch(tab);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const newTab = tab === 'subscription' ? 'credits' : 'subscription';
      handleTabSwitch(newTab);
    }
  }, [handleTabSwitch]);

  return (
    <div className={cn("relative", className)}>
      {/* 切换指示器 */}
      <div className="flex justify-center mb-8">
        <div
          className="flex items-center gap-1 p-1 bg-muted rounded-lg"
          role="tablist"
          aria-label="Pricing options"
        >
          <button
            id="subscription-tab"
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ease-out",
              activeTab === 'subscription'
                ? "bg-background text-foreground shadow-sm scale-105 cursor-default"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50 cursor-pointer"
            )}
            onClick={() => handleTabSwitch('subscription')}
            onKeyDown={(e) => handleKeyDown(e, 'subscription')}
            aria-pressed={activeTab === 'subscription'}
            aria-controls="subscription-panel"
            aria-selected={activeTab === 'subscription'}
            role="tab"
            type="button"
            disabled={activeTab === 'subscription'}
            tabIndex={activeTab === 'subscription' ? -1 : 0}
          >
            Subscription Plans
          </button>
          <button
            id="credits-tab"
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ease-out",
              activeTab === 'credits'
                ? "bg-background text-foreground shadow-sm scale-105 cursor-default"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50 cursor-pointer"
            )}
            onClick={() => handleTabSwitch('credits')}
            onKeyDown={(e) => handleKeyDown(e, 'credits')}
            aria-pressed={activeTab === 'credits'}
            aria-controls="credits-panel"
            aria-selected={activeTab === 'credits'}
            role="tab"
            type="button"
            disabled={activeTab === 'credits'}
            tabIndex={activeTab === 'credits' ? -1 : 0}
          >
            Credit Packages
          </button>
        </div>
      </div>

      {/* 内容切换区域 */}
      <div className="relative overflow-hidden rounded-lg">
        {/* Subscription Plans Content */}
        <div
          id="subscription-panel"
          className={cn(
            "w-full transition-all duration-500 ease-out",
            activeTab === 'subscription'
              ? "opacity-100 translate-y-0 scale-100 relative z-10"
              : "opacity-0 translate-y-6 scale-95 absolute top-0 left-0 right-0 z-0 pointer-events-none"
          )}
          style={{
            willChange: 'opacity, transform',
            transformOrigin: 'center top'
          }}
          role="tabpanel"
          aria-labelledby="subscription-tab"
          aria-hidden={activeTab !== 'subscription'}
          tabIndex={activeTab === 'subscription' ? 0 : -1}
        >
          {subscriptionContent}
        </div>

        {/* Credits Content */}
        <div
          id="credits-panel"
          className={cn(
            "w-full transition-all duration-500 ease-out",
            activeTab === 'credits'
              ? "opacity-100 translate-y-0 scale-100 relative z-10"
              : "opacity-0 translate-y-6 scale-95 absolute top-0 left-0 right-0 z-0 pointer-events-none"
          )}
          style={{
            willChange: 'opacity, transform',
            transformOrigin: 'center top'
          }}
          role="tabpanel"
          aria-labelledby="credits-tab"
          aria-hidden={activeTab !== 'credits'}
          tabIndex={activeTab === 'credits' ? 0 : -1}
        >
          {creditsContent}
        </div>
      </div>

      {/* 交互提示 */}
      <div className="text-center mt-6">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>💡</span>
          <span>Click the tabs above to switch between subscription plans and credit packages</span>
        </div>
      </div>
    </div>
  );
}
