'use client';

/**
 * Subscription Page
 * Manage subscription plans and billing
 */

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { useAuth } from '../../../hooks/useAuth';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Toast from '../../../components/ui/Toast';
import { subscriptionAPI } from '../../../lib/api';
import { cn } from '../../../lib/utils';

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  // Fetch subscription data and payment history on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true);
        const [plansRes, subRes, historyRes] = await Promise.all([
          subscriptionAPI.getPlans(),
          subscriptionAPI.getUserSubscription(),
          subscriptionAPI.getPaymentHistory()
        ]);

        setPlans(plansRes.data || []);
        setSubscription(subRes.data || null);
        setPaymentHistory(historyRes.data || []);
      } catch (err) {
        console.error('Failed to fetch subscription data:', err);
      } finally {
        setDataLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleUpgrade = async (plan) => {
    console.log('handleUpgrade called with plan:', plan);
    console.log('plan.id:', plan?.id);

    // Handle downgrade to free plan
    if (plan.id === 'free') {
      if (subscription?.planId !== 'free') {
        setLoading(true);
        try {
          await subscriptionAPI.cancelSubscription();
          const [subRes, historyRes] = await Promise.all([
            subscriptionAPI.getUserSubscription(),
            subscriptionAPI.getPaymentHistory()
          ]);
          setSubscription(subRes.data);
          setPaymentHistory(historyRes.data || []);
          showToast('Successfully switched to Free plan', 'success');
        } catch (err) {
          console.error('Failed to cancel subscription:', err);
          showToast('Failed to switch plan. Please try again.', 'error');
        } finally {
          setLoading(false);
        }
      }
      return;
    }

    setLoading(true);
    try {
      // Try to reactivate existing subscription first
      const reactivateResult = await subscriptionAPI.reactivateSubscription(plan.id);

      if (reactivateResult.success) {
        // Reactivation successful - no payment needed
        const [subRes, historyRes] = await Promise.all([
          subscriptionAPI.getUserSubscription(),
          subscriptionAPI.getPaymentHistory()
        ]);
        setSubscription(subRes.data);
        setPaymentHistory(historyRes.data || []);
        showToast(`Successfully reactivated ${plan.name}`, 'success');
        setLoading(false);
        return;
      }
    } catch (err) {
      // Reactivation failed - proceed with payment flow
      console.log('No valid subscription to reactivate, proceeding with payment');
    }

    // Proceed with payment flow
    try {
      const orderResponse = await subscriptionAPI.createOrder(plan.id);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_dummykey',
        amount: orderResponse.data?.amount || plan.price * 100,
        currency: orderResponse.data?.currency || 'INR',
        name: 'Mobiyantra AI',
        description: `Upgrade to ${plan.name}`,
        order_id: orderResponse.data?.id,
        handler: async function (response) {
          try {
            const verifyResult = await subscriptionAPI.verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              planId: plan.id,
            });

            if (verifyResult.success) {
              // Refetch subscription and payment history after successful payment
              const [subRes, historyRes] = await Promise.all([
                subscriptionAPI.getUserSubscription(),
                subscriptionAPI.getPaymentHistory()
              ]);
              setSubscription(subRes.data);
              setPaymentHistory(historyRes.data || []);
            }
          } catch (err) {
            console.error('Verification failed', err);
            showToast('Payment verification failed. Please contact support.', 'error');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#06b6d4',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        showToast('Payment failed. Please try again.', 'error');
      });
      rzp.open();
    } catch (err) {
      console.error('Order creation failed:', err);
      showToast('Failed to create order. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
      <div className="h-full overflow-y-auto bg-transparent">
        <div className="mx-auto max-w-6xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">
          <section className="rounded-[28px] border border-slate-200 bg-white/60 dark:border-white/10 dark:bg-white/5 p-6 shadow-[0_18px_60px_rgba(2,6,23,0.16)] backdrop-blur-xl sm:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-300">
              Billing and plans
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Subscription
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
              Manage your plan, billing, and payment history from a single clean dashboard.
            </p>
          </section>

          {dataLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-r-transparent"></div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Loading subscription data...</p>
              </div>
            </div>
          ) : (
            <>
              {subscription && <CurrentPlanCard subscription={subscription} />}

              <div>
                <h2 className="mb-4 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                  Choose Your Plan
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {plans.map((plan) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      currentPlanId={subscription?.planId || 'free'}
                      onUpgrade={() => handleUpgrade(plan)}
                      loading={loading}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-8 grid gap-8 lg:grid-cols-2">
                <div className="min-w-0">
                  <BillingSection user={user} />
                </div>
                <div className="min-w-0">
                  <PaymentHistorySection payments={paymentHistory} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function CurrentPlanCard({ subscription }) {
  const usagePercentage = (subscription.usage.messagesUsedToday / subscription.usage.messagesLimit) * 100;

  return (
    <Card className="border-cyan-400/30">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Your active subscription</CardDescription>
          </div>
          <div className="inline-flex w-fit items-center rounded-full bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-transparent px-3 py-1 text-sm font-medium text-cyan-600 dark:text-cyan-300">
            {subscription.status}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
              {subscription.plan.name}
            </h3>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">{subscription.plan.description}</p>
          </div>

          {subscription.plan.id === 'free' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Messages Today</span>
                <span className="text-sm font-medium text-slate-950 dark:text-white">
                  {subscription.usage.messagesUsedToday} / {subscription.usage.messagesLimit}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-teal-400 transition-all"
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PlanCard({ plan, currentPlanId, onUpgrade, loading }) {
  const isCurrent = plan.id === currentPlanId;
  const isEnterprise = plan.id === 'enterprise';

  return (
    <Card
      className={`relative ${
        plan.popular
          ? 'border-cyan-400/40 shadow-glow mt-4 md:mt-0'
          : isCurrent
          ? 'border-sky-300/60'
          : ''
      }`}
    >
      {plan.popular && (
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-sky-500 to-teal-400 px-4 py-1 text-sm font-semibold text-white shadow-glow">
          Most Popular
        </div>
      )}

      <CardHeader>
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div>
            {isEnterprise ? (
              <div className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Custom</div>
            ) : (
              <div className="flex items-end gap-2">
                <span className="text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">${plan.price}</span>
                <span className="pb-1 text-slate-500 dark:text-slate-400">/{plan.billingPeriod}</span>
              </div>
            )}
          </div>

          <ul className="space-y-3">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-cyan-500 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>

      <CardFooter>
        {isCurrent ? (
          <Button variant="outline" fullWidth disabled>
            Current plan
          </Button>
        ) : isEnterprise ? (
          <button
            onClick={onUpgrade}
            className="gradient-primary text-white px-6 py-3 rounded-xl shadow-lg font-medium hover:opacity-90 transition w-full"
          >
            Contact sales
          </button>
        ) : (
          <button
            onClick={onUpgrade}
            disabled={loading}
            className="gradient-primary text-white px-6 py-3 rounded-xl shadow-lg font-medium hover:opacity-90 transition w-full flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            Upgrade to {plan.name}
          </button>
        )}
      </CardFooter>
    </Card>
  );
}

function BillingSection({ user }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Billing Information</CardTitle>
        <CardDescription>Manage your payment method</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5 p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-14 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-xs font-bold text-white">
                VISA
              </div>
              <div>
                <p className="text-sm font-medium text-slate-950 dark:text-white">**** **** **** 4242</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Expires 12/2028</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Update
            </Button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5 p-4">
            <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Billing Email
            </label>
            <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">{user?.email || 'demo@example.com'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentHistorySection({ payments = [] }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-transparent text-emerald-600 dark:text-emerald-300';
      case 'pending':
        return 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-transparent text-amber-600 dark:text-amber-300';
      case 'failed':
        return 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-transparent text-rose-600 dark:text-rose-300';
      default:
        return 'bg-slate-50 dark:bg-slate-500/10 border-slate-200 dark:border-transparent text-slate-600 dark:text-slate-300';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
        <CardDescription>Your recent transactions</CardDescription>
      </CardHeader>

      <CardContent>
        {payments.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">No payment history yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10">
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500 dark:text-slate-400">ID</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-slate-200 dark:border-white/10 last:border-0">
                    <td className="px-4 py-3 text-sm text-slate-950 dark:text-white">
                      {formatDate(payment.paidAt || payment.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-950 dark:text-white">
                      ₹{payment.amount?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-slate-500 dark:text-slate-400">
                      {payment.id?.slice(-8) || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
