"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type BillingCycle = "monthly" | "semiannual" | "annual";

interface PricingOption {
    id: BillingCycle;
    label: string;
    price: string;
    period: string;
    description: string;
    savings?: string;
}

const pricingOptions: Record<BillingCycle, PricingOption> = {
    monthly: {
        id: "monthly",
        label: "Mensal",
        price: "R$59,90",
        period: "/mês",
        description: "Ideal para experimentar e começar.",
    },
    semiannual: {
        id: "semiannual",
        label: "Semestral",
        price: "R$49,90",
        period: "/mês",
        description: "Economize garantindo 6 meses de acesso.",
        savings: "Economize 17%",
    },
    annual: {
        id: "annual",
        label: "Anual",
        price: "R$39,90",
        period: "/mês",
        description: "Melhor valor. Acesso completo o ano todo.",
        savings: "Economize 33%",
    },
};

const benefits = [
    "Acesso ilimitado a todos os recursos",
    "Suporte prioritário 24/7",
    "Atualizações constantes",
    "Sem taxas escondidas",
    "Cancele quando quiser",
];

export default function PricingPage() {
    const [billingCycle, setBillingCycle] = useState<BillingCycle>("annual");

    const currentOption = pricingOptions[billingCycle];

    return (
        <div className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <h1 className="text-base font-semibold leading-7 text-primary">Preços</h1>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                        Escolha o plano ideal para você
                    </p>
                </div>
                <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-muted-foreground">
                    Comece hoje mesmo a transformar seus resultados com a nossa plataforma.
                </p>

                <div className="mt-16 flex justify-center">
                    <div className="grid grid-cols-3 gap-1 rounded-full bg-muted p-1 text-center text-xs font-semibold leading-5 ring-1 ring-inset ring-border">
                        {(["monthly", "semiannual", "annual"] as BillingCycle[]).map((cycle) => (
                            <button
                                key={cycle}
                                onClick={() => setBillingCycle(cycle)}
                                className={cn(
                                    "cursor-pointer rounded-full px-4 py-2.5 transition-all text-sm",
                                    billingCycle === cycle
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:bg-background/50"
                                )}
                            >
                                {pricingOptions[cycle].label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mx-auto mt-10 max-w-md">
                    <Card className={cn("relative flex flex-col overflow-hidden border-2", billingCycle === 'annual' ? "border-primary shadow-lg" : "")}>
                        {billingCycle === "annual" && (
                            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 rotate-45 bg-primary px-10 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
                                Popular
                            </div>
                        )}
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="text-2xl font-bold">{currentOption.label}</CardTitle>
                            <p className="text-muted-foreground">{currentOption.description}</p>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center pb-6">
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-bold tracking-tight">{currentOption.price}</span>
                                <span className="text-sm font-semibold leading-6 text-muted-foreground">{currentOption.period}</span>
                            </div>
                            {currentOption.savings && (
                                <span className="mt-2 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                    {currentOption.savings}
                                </span>
                            )}
                        </CardContent>
                        <CardContent className="flex flex-col gap-4">
                            <ul role="list" className="space-y-3 text-sm leading-6 text-muted-foreground">
                                {benefits.map((benefit) => (
                                    <li key={benefit} className="flex gap-x-3">
                                        <Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                                        {benefit}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Link href={`/checkout?plan=${billingCycle}`} className="w-full">
                                <Button className="w-full text-lg h-12" size="lg">
                                    Assinar Agora
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
