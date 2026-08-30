/**
 * Dummy subscription plans data
 */

export const subscriptionPlans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    billingPeriod: 'month',
    description: 'Perfect for trying out our AI assistant',
    features: [
      '50 messages per day',
      'GPT-3.5 equivalent model',
      'Basic chat history (7 days)',
      'Standard response speed',
      'Web access only',
    ],
    limits: {
      messagesPerDay: 50,
      chatHistory: 7, // days
      modelAccess: 'basic',
    },
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 20,
    billingPeriod: 'month',
    description: 'For power users who need more',
    features: [
      'Unlimited messages',
      'GPT-4 equivalent model',
      'Unlimited chat history',
      'Priority response speed',
      'Web, mobile, and API access',
      'Custom instructions',
      'Export conversations',
      'Early access to new features',
    ],
    limits: {
      messagesPerDay: -1, // unlimited
      chatHistory: -1, // unlimited
      modelAccess: 'advanced',
    },
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'VIP / Enterprise',
    price: 'Custom',
    billingPeriod: 'month',
    description: 'For teams and organizations',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Dedicated support',
      'Custom model fine-tuning',
      'SSO and advanced security',
      'Admin dashboard',
      'API with higher rate limits',
      'Custom integrations',
      'SLA guarantee',
      'Priority feature requests',
    ],
    limits: {
      messagesPerDay: -1,
      chatHistory: -1,
      modelAccess: 'enterprise',
    },
    popular: false,
  },
];

// Current user subscription for demo
export const currentSubscription = {
  plan: subscriptionPlans[0], // Free plan
  status: 'active',
  startDate: '2026-01-01T00:00:00.000Z',
  endDate: null,
  usage: {
    messagesUsedToday: 23,
    messagesLimit: 50,
  },
};
