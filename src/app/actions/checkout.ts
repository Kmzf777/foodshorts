"use server";

import { abacatepay } from "@/lib/abacatepay";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

interface Plan {
    name: string;
    price: number;
    total?: number;
    frequency: "MONTHLY" | "YEARLY" | "ONE_TIME";
}

// Definindo os planos para garantir consistência com a página de pricing
const PLANS: Record<string, Plan> = {
    monthly: {
        name: "Plano Mensal",
        price: 5990, // em centavos
        frequency: "MONTHLY",
    },
    semiannual: {
        name: "Plano Semestral",
        price: 4990, // preço mensal
        total: 29940, // 49.90 * 6
        frequency: "ONE_TIME", // AbacatePay não tem semestral nativo, cobramos one-time por 6 meses ou mensal recorrente? 
        // O user pediu "MENSAL R$59,90", "SEMESTRAL R$49,90/mês", "ANUAL R$39,90/mês".
        // Geralmente planos semestrais/anuais são cobrados à vista para dar desconto. 
        // Vou assumir cobrança à vista pelo período (6 ou 12 meses).
    },
    annual: {
        name: "Plano Anual",
        price: 3990, // preço mensal
        total: 47880, // 39.90 * 12
        frequency: "YEARLY", // AbacatePay deve suportar YEARLY se for recorrente anual
    },
};

export async function createCheckoutSession(planId: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?next=/checkout");
    }

    // Buscar dados do restaurante/cliente
    const { data: restaurant, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("owner_id", user.id)
        .single();

    if (error || !restaurant) {
        console.error("Erro ao buscar restaurante:", error);
        throw new Error("Restaurante não encontrado");
    }

    // Verificar se o plano existe
    if (!PLANS[planId]) {
        throw new Error("Plano inválido");
    }

    const selectedPlan = PLANS[planId];

    // Define frequency e price total
    let frequency: "MONTHLY" | "YEARLY" | "ONE_TIME" = "ONE_TIME";
    let amount = 0;

    if (planId === 'monthly') {
        frequency = 'MONTHLY';
        amount = selectedPlan.price;
    } else if (planId === 'annual') {
        frequency = 'YEARLY';
        amount = selectedPlan.total!;
    } else if (planId === 'semiannual') {
        frequency = 'ONE_TIME';
        amount = selectedPlan.total!;
    }

    // Criar ou recuperar cliente no AbacatePay
    let abacateCustomerId = restaurant.abacatepay_customer_id;

    if (!abacateCustomerId) {
        // Garantir que user.email nao seja undefined (ja verificado pelo getUser mas TS reclama)
        const email = user.email;
        if (!email) throw new Error("Usuário sem email");

        const customer = await abacatepay.createCustomer({
            name: user.user_metadata.name || restaurant.name,
            email: email,
            // cellphone: user.phone, // se tiver
        });

        abacateCustomerId = customer.id;

        // Salvar ID do cliente no banco
        await supabase
            .from("restaurants")
            .update({ abacatepay_customer_id: abacateCustomerId })
            .eq("id", restaurant.id);
    }

    // Criar Billing
    const billing = await abacatepay.createBilling({
        customerId: abacateCustomerId,
        frequency,
        products: [
            {
                externalId: `plan_${planId}`,
                name: selectedPlan.name,
                quantity: 1,
                price: amount,
            },
        ],
        returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        completionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout_success=true`,
    });

    return billing.url;
}
