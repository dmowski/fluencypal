"use client";

import { LogOut } from "lucide-react";
import { useAuth } from "../Auth/useAuth";

export function Header() {
  const auth = useAuth();

  return (
    <div
      className={["w-full flex items-center justify-center py-4", "fixed top-0 left-0"].join(" ")}
    >
      <div
        className={[
          "flex flex-row items-center justify-between",
          "gap-10 w-full max-w-[1400px]",
          "px-4",
        ].join(" ")}
      >
        <img src="./logo.png" alt="logo" className="w-[100px] h-auto" />

        {auth.isAuthorized && (
          <button
            onClick={() => auth.logout()}
            className={[
              `text-[#eef6f9] hover:text-white`,
              `hover:shadow-[0_0_0_2px_rgba(255,255,255,1)]`,
              `font-[350] text-[16px]`,
              `opacity-90 hover:opacity-100`,
              "flex items-center justify-center gap-2",
              `w-auto p-2`,
            ].join(" ")}
          >
            <LogOut size="20" color="#fff" />
            Logout
          </button>
        )}
      </div>
    </div>
  );
}
