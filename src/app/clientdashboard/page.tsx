"use client";

import { useState } from "react";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { LoginForm } from "@/components/dashboard/login-form";

export default function ClientDashboardPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <div className="min-h-screen bg-secondary/50">
      {isLoggedIn ? (
        <div className="pt-24 pb-12">
          <DashboardSection />
        </div>
      ) : (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}
