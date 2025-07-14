"use client";

import { signOutAction } from "@/app/actions";
import Link from "next/link";
import { Button } from "./ui/button";
import { ThemeSwitcher } from "./theme-switcher";
import { Logo } from "./logo";
import { usePathname } from "next/navigation";
import { MobileNav } from "./mobile-nav";
import { SignInModal } from "./auth/sign-in-modal";
import { useState } from "react";

interface HeaderProps {
  user: any;
}

interface NavItem {
  label: string;
  href: string;
}

export default function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  // 登录模态框状态
  const [showSignInModal, setShowSignInModal] = useState(false);

  // Main navigation items that are always shown
  const mainNavItems: NavItem[] = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "#contact" },
  ];

  // Dashboard items - empty array as we don't want navigation items in dashboard
  const dashboardItems: NavItem[] = [];

  // Choose which navigation items to show
  const navItems = isDashboard ? dashboardItems : mainNavItems;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2 md:gap-8">
          <Logo />
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          {user ? (
            <div className="hidden md:flex items-center gap-2">
              {isDashboard && (
                <span className="hidden sm:inline text-sm text-muted-foreground">
                  {user.email}
                </span>
              )}
              {!isDashboard && (
                <Button asChild size="sm" variant="default">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              )}
              <form action={signOutAction}>
                <Button type="submit" variant="outline" size="sm">
                  Sign out
                </Button>
              </form>
            </div>
          ) : (
            <div className="hidden md:flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowSignInModal(true)}
              >
                Sign in
              </Button>
              <Button asChild size="sm">
                <Link href="/sign-up">Sign up</Link>
              </Button>
            </div>
          )}
          <MobileNav
            items={navItems}
            user={user}
            isDashboard={isDashboard}
            onSignInClick={() => setShowSignInModal(true)}
          />
        </div>
      </div>

      {/* 登录模态框 */}
      <SignInModal
        open={showSignInModal}
        onOpenChange={setShowSignInModal}
        onSignInSuccess={() => {
          // 登录成功后刷新页面状态
          window.location.reload();
        }}
      />
    </header>
  );
}
