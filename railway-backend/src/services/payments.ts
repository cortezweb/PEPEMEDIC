export interface CheckoutRequest {
  kind: 'appointment_deposit' | 'saas_subscription';
  tenantId: string;
  tenantSlug?: string;
  appointmentId?: string;
  planId?: 'starter' | 'pro' | 'enterprise';
  amount: number;
  currency?: string;
  customerName: string;
  customerEmail?: string;
}

export interface CheckoutSessionResult {
  checkoutId: string;
  status: 'created';
  checkoutUrl: string;
  expiresAt: string;
  provider: 'stripe_railway' | 'qr_instant';
}

export function createCheckoutSession(req: CheckoutRequest): CheckoutSessionResult {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const checkoutId = `chk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const returnPath =
    req.kind === 'appointment_deposit' && req.tenantSlug
      ? `/c/${req.tenantSlug}?payment=success&checkoutId=${checkoutId}`
      : `/admin?subscription=upgraded&plan=${req.planId || 'pro'}&checkoutId=${checkoutId}`;

  return {
    checkoutId,
    status: 'created',
    checkoutUrl: `${frontendUrl}${returnPath}`,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    provider: 'stripe_railway'
  };
}
