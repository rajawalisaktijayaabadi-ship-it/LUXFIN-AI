export type LicenseStatus = 'AVAILABLE' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'REVOKED';

export type LicenseErrorCode =
  | 'INVALID_KEY'
  | 'ALREADY_ACTIVATED'
  | 'EXPIRED'
  | 'SUSPENDED'
  | 'REVOKED'
  | 'DEVICE_CONFLICT'
  | 'NETWORK_ERROR';

export type LicenseAuditEventType =
  | 'ACTIVATION'
  | 'VALIDATION'
  | 'DEVICE_BINDING'
  | 'DEVICE_RESET'
  | 'EXPIRATION'
  | 'SUSPENSION'
  | 'REVOCATION';

export interface LicenseUserBinding {
  userId: string;
  userEmail: string;
  userName: string;
  boundAt: string;
}

export interface LicenseDeviceBinding {
  primaryDeviceId: string;
  primaryDeviceName: string;
  ipAddress: string;
  boundAt: string;
}

export interface LicenseActivationMetadata {
  ipAddress: string;
  userAgent: string;
  location?: string;
  platform?: string;
}

export interface LicenseValidationRecord {
  timestamp: string;
  status: LicenseStatus;
  deviceId: string;
  success: boolean;
  message: string;
}

export interface LicenseAuditMetadata {
  createdAt: string;
  createdBy: string;
  version: number;
}

export interface LicenseAuditLogItem {
  id: string;
  licenseKey: string;
  eventType: LicenseAuditEventType;
  timestamp: string;
  actor: string;
  details: string;
  metadata?: any;
}

export interface License {
  id: string;
  key: string;
  status: LicenseStatus;
  plan: 'PREMIUM_MONTHLY' | 'PREMIUM_ANNUAL' | 'VIP_LIFETIME' | 'DEMO' | string;
  createdDate: string;
  activatedDate?: string;
  expirationDate?: string;
  userBinding?: LicenseUserBinding | null;
  deviceBinding?: LicenseDeviceBinding | null;
  activationMetadata?: LicenseActivationMetadata | null;
  lastValidation?: LicenseValidationRecord | null;
  auditMetadata?: LicenseAuditMetadata | null;
  maxDevices: number;
}

export interface LicenseValidationResult {
  valid: boolean;
  licenseKey?: string;
  status?: LicenseStatus;
  errorCode?: LicenseErrorCode;
  errorMessage?: string;
  plan?: string;
  userBinding?: LicenseUserBinding | null;
  deviceBinding?: LicenseDeviceBinding | null;
  expirationDate?: string;
  serverTimestamp?: string;
}

export interface OnboardingFinancialContext {
  monthlyIncomeRange?: string; // e.g. '5m-10m', '10m-25m', '25m-50m', '50m+'
  mainGoal?: string; // 'EMERGENCY_FUND' | 'INVESTMENT' | 'DEBT_FREE' | 'BUY_PROPERTY' | 'RETIREMENT'
  typicalExpenses?: number;
  existingDebt?: number;
  emergencyFundStatus?: string; // 'NONE' | '1-3_MONTHS' | '3-6_MONTHS' | '6+_MONTHS'
  preferredSavingsTarget?: number;
  completedAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role?: 'ADMIN' | 'USER';
  licenseKey: string;
  licenseStatus: LicenseStatus;
  licensePlan: string;
  registeredAt: string;
  preferredCurrency: string; // 'IDR'
  locale: string; // 'id-ID'
  securityPin?: string;
  twoFactorEnabled?: boolean;
  isEmailVerified?: boolean;
  financialContext?: OnboardingFinancialContext;
}

export interface AuthSession {
  sessionId: string;
  userId: string;
  token: string;
  loginAt: string;
  expiresAt: string;
  deviceName: string;
  ipAddress: string;
  isCurrent?: boolean;
}

export type TransactionStatus = 'COMPLETED' | 'PENDING' | 'REFUNDED' | 'REVERSED' | 'CANCELLED';

export type AccountType =
  | 'CASH'
  | 'BANK'
  | 'E_WALLET'
  | 'CREDIT_CARD'
  | 'SAVINGS'
  | 'DEPOSIT'
  | 'INVESTMENT'
  | 'OTHER';

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  provider: string; // BCA, Mandiri, Gopay, OVO, Bibit, Cash, etc.
  balance: number;
  initialBalance?: number;
  accountNumber?: string;
  color: string;
  icon: string;
  notes?: string;
  isExcludedFromNetWorth?: boolean;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export interface TransactionItem {
  id?: string;
  transactionId?: string;
  userId?: string;
  name: string;
  price: number;
  qty: number;
  totalPrice?: number;
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
  color?: string;
}

export interface TransactionTag {
  id: string;
  userId: string;
  transactionId: string;
  tagId: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  accountId: string;
  targetAccountId?: string; // For TRANSFER
  categoryId: string;
  subcategory?: string;
  status: TransactionStatus;
  isRefund?: boolean;
  parentTransactionId?: string; // For refunded / reversed transactions
  date: string; // YYYY-MM-DD
  time?: string;
  vendor?: string;
  merchant?: string; // Alias for vendor
  notes?: string;
  tags?: string[];
  receiptUrl?: string;
  attachments?: { id: string; fileName: string; fileUrl: string; mimeType: string; uploadedAt: string }[];
  items?: TransactionItem[];
  subtotal?: number;
  tax?: number;
  discount?: number;
  isRecurring?: boolean;
  recurringFrequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  recurringId?: string;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ReceiptOCRItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface ReceiptOCRResult {
  merchant: string;
  date: string;
  items: ReceiptOCRItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  confidenceScores: {
    merchant: 'HIGH' | 'MEDIUM' | 'LOW';
    date: 'HIGH' | 'MEDIUM' | 'LOW';
    items: 'HIGH' | 'MEDIUM' | 'LOW';
    total: 'HIGH' | 'MEDIUM' | 'LOW';
  };
  uncertainFields: string[];
  rawSummary?: string;
  imageUrl?: string;
}

export interface ImportLogRowError {
  row: number;
  field: string;
  message: string;
}

export interface ImportLog {
  id: string;
  timestamp: string;
  fileName: string;
  fileType: 'CSV' | 'XLSX' | 'JSON';
  totalRows: number;
  importedRows: number;
  skippedRows: number;
  duplicateRows: number;
  errorCount: number;
  errors: ImportLogRowError[];
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
}

export interface Subcategory {
  id: string;
  categoryId: string;
  userId: string;
  name: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon: string;
  color: string;
  subcategories: string[];
  isSystem?: boolean;
}

export type BudgetPeriodType = 'WEEKLY' | 'MONTHLY' | 'ANNUAL' | 'CUSTOM';

export interface BudgetItem {
  id: string;
  budgetId: string;
  userId: string;
  categoryId: string;
  subcategoryName?: string;
  allocatedAmount: number;
  spentAmount?: number;
}

export interface Budget {
  id: string;
  userId: string;
  name?: string;
  categoryId: string;
  monthlyLimit: number; // or limit amount
  spent: number;
  period: string; // e.g. "2026-08" or "2026" or custom label
  periodType?: BudgetPeriodType;
  startDate?: string;
  endDate?: string;
  overspendingThreshold?: number; // e.g. 80 or 100 percentage
  items?: BudgetItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface GoalContribution {
  id: string;
  goalId: string;
  userId: string;
  accountId: string;
  amount: number;
  date: string;
  notes?: string;
}

export type GoalCategory =
  | 'EMERGENCY_FUND'
  | 'HOUSE'
  | 'VEHICLE'
  | 'EDUCATION'
  | 'WEDDING'
  | 'VACATION'
  | 'GADGET'
  | 'INVESTMENT'
  | 'CUSTOM'
  | 'PURCHASE'
  | 'OTHER';

export interface FinancialGoal {
  id: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  category: GoalCategory;
  icon: string;
  notes?: string;
  status?: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED';
  isArchived?: boolean;
  contributions?: GoalContribution[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BillSubscription {
  id: string;
  userId: string;
  name: string;
  amount: number;
  accountId: string;
  categoryId: string;
  dueDateDay: number; // 1-31
  nextDueDate?: string; // YYYY-MM-DD
  billingCycle: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  type?: 'BILL' | 'SUBSCRIPTION';
  autoPaid: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'PAUSED' | 'CANCELLED';
  reminderDaysBefore?: number;
  providerLogo?: string;
  lastPaidDate?: string;
  notes?: string;
  createdAt?: string;
}

export interface RecurringTransaction {
  id: string;
  userId: string;
  name: string;
  amount: number;
  type: TransactionType;
  accountId: string;
  targetAccountId?: string;
  categoryId: string;
  subcategory?: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';
  customIntervalDays?: number;
  startDate: string;
  nextRunDate: string;
  lastRunDate?: string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  notes?: string;
  createdAt?: string;
}

export type DebtType = 'DEBT_OWED' | 'RECEIVABLE'; // Utang Saya vs Piutang Orang

export type DebtCategory =
  | 'CREDIT_CARD'
  | 'PERSONAL_LOAN'
  | 'KPR'
  | 'KKB'
  | 'MOTORCYCLE_LOAN'
  | 'PAYLATER'
  | 'BNPL'
  | 'OTHER';

export interface DebtPayment {
  id: string;
  debtId: string;
  userId: string;
  accountId: string;
  amount: number;
  principalPaid?: number;
  interestPaid?: number;
  date: string;
  notes?: string;
}

export interface Debt {
  id: string;
  userId: string;
  personOrInstitution: string;
  type: DebtType;
  category?: DebtCategory;
  originalAmount: number;
  remainingAmount: number;
  interestRateAnnual: number;
  dueDate?: string; // YYYY-MM-DD or Day
  dueDateDay?: number; // 1 - 31
  minimumMonthlyPayment: number;
  installment?: number; // Angsuran per bulan
  termMonths?: number; // Jangka waktu pinjaman (bulan)
  notes?: string;
  isCleared?: boolean;
  payments: DebtPayment[];
  createdAt?: string;
  updatedAt?: string;
}

export type InvestmentCategory =
  | 'SAHAM'
  | 'REKSADANA'
  | 'OBLIGASI'
  | 'EMAS'
  | 'DEPOSITO'
  | 'KRIPTO'
  | 'PROPERTI'
  | 'OTHER';

export interface InvestmentTransaction {
  id: string;
  investmentId: string;
  userId: string;
  type: 'BUY' | 'SELL' | 'DIVIDEND';
  units: number;
  pricePerUnit: number;
  totalAmount: number;
  accountId: string;
  date: string;
  fee?: number;
  notes?: string;
}

export interface InvestmentAsset {
  id: string;
  userId: string;
  name: string;
  symbol: string;
  category: InvestmentCategory;
  units: number; // quantity
  averageBuyPrice: number; // purchase price per unit
  currentPrice: number; // current value per unit
  totalPurchaseValue?: number; // units * averageBuyPrice
  totalValue: number; // units * currentPrice
  unrealizedGainLoss: number;
  unrealizedGainLossPercentage: number;
  allocationPercentage?: number; // % of total investment portfolio
  notes?: string;
  transactions?: InvestmentTransaction[];
  createdAt?: string;
  updatedAt?: string;
}

export type AssetCategory = 'CASH' | 'BANK' | 'E_WALLET' | 'INVESTMENT' | 'PROPERTY' | 'VEHICLE' | 'OTHER';

export interface TangibleAsset {
  id: string;
  userId: string;
  name: string;
  category: AssetCategory;
  estimatedValue: number;
  purchaseValue: number;
  purchaseDate?: string;
  notes?: string;
  createdAt?: string;
}

export type LiabilityCategory = 'CREDIT_CARD' | 'PERSONAL_LOAN' | 'PAYLATER' | 'MORTGAGE' | 'OTHER';

export interface Liability {
  id: string;
  userId: string;
  name: string;
  category: LiabilityCategory;
  totalOwed: number;
  monthlyPayment: number;
  interestRate?: number;
  dueDateDay?: number;
  notes?: string;
  createdAt?: string;
}

export interface Attachment {
  id: string;
  userId: string;
  entityType: 'TRANSACTION' | 'RECEIPT' | 'DEBT' | 'GOAL' | 'ASSET';
  entityId: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  fileSize: number; // in bytes
  uploadedAt: string;
}

export interface FinancialHealthScore {
  id?: string;
  userId?: string;
  calculatedAt?: string;
  score: number; // 0 - 100
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  summary: string;
  metrics: {
    savingsRateScore: number; // % saved from income
    emergencyFundScore: number; // months covered
    debtRatioScore: number; // debt to income ratio
    budgetAdherenceScore: number; // budget adherence
    investmentRatioScore: number; // net worth in investment
  };
  recommendations: string[];
}

export type AIProposedActionType = 
  | 'CREATE_BUDGET'
  | 'CREATE_GOAL'
  | 'CREATE_TRANSACTION'
  | 'UPDATE_CATEGORY'
  | 'CREATE_BILL'
  | 'PAY_DEBT';

export interface AIProposedAction {
  id: string;
  type: AIProposedActionType;
  title: string;
  description: string;
  payload: {
    categoryName?: string;
    categoryId?: string;
    amount?: number;
    limit?: number;
    title?: string;
    targetAmount?: number;
    targetMonths?: number;
    targetDate?: string;
    type?: 'INCOME' | 'EXPENSE' | 'TRANSFER';
    vendor?: string;
    accountId?: string;
    notes?: string;
    dueDate?: string;
    [key: string]: any;
  };
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}

export interface AIMessage {
  id: string;
  sender: 'USER' | 'LUX_AI';
  text: string;
  timestamp: string;
  quickActions?: { label: string; action: string; payload?: any }[];
  proposedAction?: AIProposedAction;
  metadata?: any;
  isError?: boolean;
}

export interface AIConversationSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: AIMessage[];
}

export interface AuditLog {
  id: string;
  userId?: string;
  timestamp: string;
  action: string;
  details: string;
  ipAddress?: string;
  deviceId?: string;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'AI_INSIGHT';
  timestamp: string;
  isRead: boolean;
  linkTab?: string;
}

// --- AI INTELLIGENCE ENGINE TYPES (PROMPT 09) ---

export interface StructuredFinancialContext {
  userProfile: {
    userName: string;
    currency: string;
    plan: string;
  };
  accountSummary: {
    totalAccounts: number;
    totalBalance: number;
    accounts: { name: string; type: string; balance: number }[];
  };
  cashflowSummary: {
    monthlyIncome: number;
    monthlyExpense: number;
    netCashflow: number;
    savingsRate: number;
  };
  categorySpending: { categoryName: string; amount: number; percentage: number }[];
  budgetSummary: {
    totalBudgets: number;
    overBudgetCount: number;
    items: { category: string; limit: number; spent: number; remaining: number }[];
  };
  goalSummary: {
    totalGoals: number;
    items: { title: string; target: number; current: number; deadline: string; progressPct: number }[];
  };
  billSubscriptionSummary: {
    upcomingBillsCount: number;
    totalMonthlyBillsCost: number;
    subscriptionsCount: number;
    totalMonthlySubscriptionCost: number;
    subscriptions: { name: string; price: number; frequency: string }[];
  };
  debtSummary: {
    totalOwed: number;
    totalReceivables: number;
    debtCount: number;
    debts: { name: string; remaining: number; interestRate: number; minPayment: number }[];
  };
  investmentSummary: {
    totalValue: number;
    totalGainLoss: number;
    totalGainLossPct: number;
    assetAllocations: { assetClass: string; totalValue: number; percentage: number }[];
  };
  netWorthSummary: {
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
  };
  historicalTrends: {
    recentMonths: { month: string; income: number; expense: number; netWorth: number }[];
  };
}

export interface AILogEntry {
  id: string;
  timestamp: string;
  featureName: string;
  model: string;
  executionMs: number;
  tokenEstimate: number;
  status: 'SUCCESS' | 'ERROR' | 'TIMEOUT';
  sanitizedMetadata?: Record<string, any>;
}

export interface TransactionCategorizationResult {
  suggestedCategory: string;
  suggestedSubcategory?: string;
  confidenceScore: number;
  tags: string[];
  explanation: string;
  disclaimer: string;
}

export interface SpendingAnalysisResult {
  summary: string;
  topSpendingCategory: string;
  unnecessarySpendingEstimate: number;
  insights: string[];
  benchmarkComparison: string;
  disclaimer: string;
}

export interface SpendingPatternResult {
  detectedPatterns: {
    title: string;
    description: string;
    frequency: string;
    estimatedMonthlyImpact: number;
    type: 'POSITIVE' | 'NEUTRAL' | 'WARNING';
  }[];
  primaryPatternSummary: string;
  disclaimer: string;
}

export interface BudgetRecommendationResult {
  recommendedMonthlyBudget: number;
  categoryBreakdown: { categoryName: string; recommendedLimit: number; reasoning: string }[];
  savingsTargetRecommendation: number;
  advice: string;
  disclaimer: string;
}

export interface HealthScoreExplanationResult {
  score: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  keyStrengths: string[];
  vulnerabilities: string[];
  actionableSteps: string[];
  summary: string;
  disclaimer: string;
}

export interface FinancialForecastResult {
  horizonMonths: number;
  projectedNetWorth: number;
  projectedSavings: number;
  scenarios: {
    conservative: number;
    moderate: number;
    optimistic: number;
  };
  keyAssumptions: string[];
  disclaimer: string;
}

export interface GoalPlanningResult {
  goalTitle: string;
  targetAmount: number;
  currentAmount: number;
  recommendedMonthlyContribution: number;
  projectedCompletionDate: string;
  isFeasible: boolean;
  feasibilityAssessment: string;
  actionPlan: string[];
  disclaimer: string;
}

export interface DebtStrategyAnalysisResult {
  recommendedStrategy: 'AVALANCHE' | 'SNOWBALL';
  estimatedMonthsToPayoff: number;
  estimatedInterestSaved: number;
  payoffOrder: { debtName: string; remainingAmount: number; interestRate: number; order: number }[];
  monthlyFastTrackPayment: number;
  advice: string;
  disclaimer: string;
}

export interface SubscriptionAnalysisResult {
  activeSubscriptionsCount: number;
  totalMonthlyCost: number;
  totalAnnualCost: number;
  unusedOrRedundantSuggestions: { name: string; monthlyPrice: number; reason: string }[];
  optimizationAdvice: string;
  disclaimer: string;
}

export interface AnomalyDetectionResult {
  anomaliesFound: boolean;
  detectedAnomalies: {
    transactionId?: string;
    vendor: string;
    amount: number;
    date: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    reason: string;
  }[];
  safetyScore: number;
  summary: string;
  disclaimer: string;
}

export interface AffordabilityAnalysisResult {
  itemName: string;
  price: number;
  status: 'SAFE' | 'WARNING' | 'UNSAFE';
  badgeText: string;
  score: number;
  impactSummary: string;
  recoveryMonths: number;
  advicePoints: string[];
  disclaimer: string;
}

export interface MonthlyReviewResult {
  reviewPeriod: string;
  financialHeadline: string;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRatePct: number;
  top3Expenses: { category: string; amount: number }[];
  wins: string[];
  areasToImprove: string[];
  nextMonthStrategy: string;
  disclaimer: string;
}

export interface PersonalizedInsightsResult {
  insights: {
    id: string;
    title: string;
    description: string;
    category: 'BUDGET' | 'GOAL' | 'DEBT' | 'INVESTMENT' | 'SUBSCRIPTION' | 'ANOMALY';
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    actionText?: string;
    actionTab?: string;
  }[];
  generatedAt: string;
  disclaimer: string;
}

