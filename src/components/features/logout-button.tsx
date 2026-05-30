"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("demo_login");
    router.push("/");
  };

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      className="w-full h-11 gap-2 text-muted-foreground"
    >
      <LogOut className="h-4 w-4" />
      退出登录
    </Button>
  );
}
