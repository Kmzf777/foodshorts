"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createCheckoutSession } from "@/app/actions/checkout";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

const PLANS = {
    monthly: {
        name: "Plano Mensal",
        price: "R$59,90",
        interval: "/mês",
        description: "Cobrado mensalmente",
        features: ["Acesso completo", "Cancele quando quiser"],
    },
    semiannual: {
        name: "Plano Semestral",
        price: "R$299,40",
        interval: "/semestre",
        description: "Equivalente a R$49,90/mês",
        features: ["Acesso por 6 meses", "Economia de 17%"],
    },
    annual: {
        name: "Plano Anual",
        price: "R$478,80",
        interval: "/ano",
        description: "Equivalente a R$39,90/mês",
        features: ["Acesso por 1 ano", "Melhor valor (Economia de 33%)"],
    },
};

export default function CheckoutPage() {
    const searchParams = useSearchParams();
    const planParam = searchParams.get("plan");
    const [isPending, startTransition] = useTransition();
    const [selectedPlanId, setSelectedPlanId] = useState<string>("monthly");

    useEffect(() => {
        if (planParam && Object.keys(PLANS).includes(planParam)) {
            setSelectedPlanId(planParam);
        }
    }, [planParam]);

    const selectedPlan = PLANS[selectedPlanId as keyof typeof PLANS];

    const handleCheckout = () => {
        startTransition(async () => {
            try {
                const url = await createCheckoutSession(selectedPlanId);
                window.location.href = url;
            } catch (error) {
                toast.error("Erro ao iniciar pagamento", {
                    description: error instanceof Error ? error.message : "Tente novamente mais tarde",
                });
            }
        });
    };

    if (!selectedPlan) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <h1 className="text-2xl font-bold">Plano não encontrado</h1>
                <Button asChild>
                    <Link href="/pricing">Voltar para Preços</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container max-w-4xl py-24">
            <h1 className="text-3xl font-bold text-center mb-10">Finalizar Assinatura</h1>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Resumo do Pedido */}
                <Card>
                    <CardHeader>
                        <CardTitle>Resumo do Pedido</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-4">
                            <div>
                                <p className="font-medium text-lg">{selectedPlan.name}</p>
                                <p className="text-sm text-muted-foreground">{selectedPlan.description}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-xl">{selectedPlan.price}</p>
                                <p className="text-sm text-muted-foreground">{selectedPlan.interval}</p>
                            </div>
                        </div>

                        <ul className="space-y-2">
                            {selectedPlan.features.map((feature, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Check className="h-4 w-4 text-green-500" />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <div className="flex justify-between items-center pt-4 font-bold text-lg">
                            <span>Total a pagar</span>
                            <span>{selectedPlan.price}</span>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-4">
                        <Button
                            className="w-full h-12 text-lg"
                            onClick={handleCheckout}
                            disabled={isPending}
                        >
                            {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                            Pagar com Pix
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                            Processado seguramente por AbacatePay. Acesso liberado imediatamente após confirmação.
                        </p>
                    </CardFooter>
                </Card>

                {/* Informações Adicionais / FAQ */}
                <div className="space-y-6">
                    <div className="bg-muted/50 p-6 rounded-lg">
                        <h3 className="font-semibold mb-2">Como funciona o pagamento?</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Utilizamos o AbacatePay para processar pagamentos via Pix com segurança. O código Pix é gerado na próxima tela.
                        </p>

                        <h3 className="font-semibold mb-2">Posso cancelar depois?</h3>
                        <p className="text-sm text-muted-foreground">
                            Sim, você pode cancelar sua assinatura a qualquer momento através do painel da sua conta.
                        </p>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">Dúvidas?</p>
                        <Button variant="link" asChild>
                            <Link href="https://wa.me/5511999999999">Fale com o suporte</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
