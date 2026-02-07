"use client";

import { Suspense } from "react";
import LoginInner from "./login-inner";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
    return (
        <Suspense fallback={null}>
            <LoginInner />
        </Suspense>
    );
}
