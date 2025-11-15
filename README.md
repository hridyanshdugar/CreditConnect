# Credit Connect - AI-Powered Lending Platform

A revolutionary lending platform that replaces traditional credit scores with proprietary AI-driven risk profiles, enabling instant pre-approvals and Straight-Through Processing (STP) efficiency.

## 🎯 Mission Statement

To disrupt the finance industry's borrowing and lending process by providing an AI-driven, end-to-end digital exchange that replaces credit scores with proprietary risk profiles, enabling instant, trust-based pre-approvals for clients and achieving Straight-Through Processing (STP) efficiency for lenders.

## 🚀 Features

### Client Portal
- **Pre-Approval Marketplace**: Browse and compare pre-approved loan offers from multiple lenders without hard credit checks
- **Risk Profile Dashboard**: Transparent view of your Helix Risk Score with detailed dimensional breakdowns and explanations
- **Risk Improvement Simulator**: Interactive tool showing real-time impact of specific actions (paying off debt, increasing savings) on Helix Score
- **Financial Management Dashboard**: Track your financial health with personalized recommendations
- **Application Tracker**: End-to-end status tracking from verification to fund disbursement
- **Financial Insights**: AI-powered recommendations for improving financial health

### Bank Portal
- **Risk Calculator Dashboard**: Real-time risk calculation interface showing all dimension scores, confidence intervals, and risk trending
- **Portfolio Risk Analyzer**: Aggregate risk metrics across entire loan portfolio with predictive default modeling
- **Product Manager**: Centralized tool to manage, price, and segment loan products with AI-powered matching
- **STP/Review Queue**: Priority queue for AI-flagged exceptions requiring manual review
- **Continuous Risk Management**: Real-time monitoring of all active borrowers with material change alerts
- **Risk Model Performance**: Monitor model accuracy, drift detection, and A/B testing results

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15 (App Router), HeroUI (v2.4.0), Tailwind CSS
- **Backend**: Next.js API Routes (Backend-for-Frontend pattern)
- **Database**: SQLite (better-sqlite3) - automatically initialized
- **Risk Engine**: TypeScript-based Helix Risk Calculator (integrated in backend)
- **Authentication**: JWT with bcrypt password hashing
- **UI Components**: HeroUI with Framer Motion animations
- **Charts**: Recharts for data visualization

### Project Structure

```
CreditConnect/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── risk/              # Risk calculation endpoints
│   │   └── products/          # Product matching endpoints
│   ├── client/                # Client portal pages
│   │   ├── dashboard/        # Client dashboard
│   │   ├── risk-profile/      # Risk profile view
│   │   ├── marketplace/       # Pre-approval marketplace
│   │   └── simulator/         # Risk improvement simulator
│   ├── bank/                  # Bank portal pages
│   │   ├── dashboard/         # Bank dashboard
│   │   ├── portfolio/         # Portfolio analyzer
│   │   └── products/         # Product manager
│   ├── login/                 # Login page
│   ├── register/              # Registration page
│   └── page.tsx               # Landing page
├── lib/
│   ├── db.ts                  # Database setup and schema
│   ├── auth.ts                # Authentication utilities
│   ├── risk-calculator.ts     # Helix Risk Calculator engine
│   └── types.ts               # TypeScript type definitions
├── components/
│   └── Navbar.tsx             # Navigation component
├── data/                      # SQLite database (auto-created)
└── public/                     # Static assets
```

### Risk Calculation Framework

The Helix Risk Calculator is a comprehensive TypeScript-based engine that evaluates borrowers across 5 weighted dimensions:

#### 1. **Financial Stability (35% weight)**
   - **Income Consistency (40%)**: Employment duration, income variance, multiple income streams
   - **Cash Flow Health (35%)**: Average monthly balance, overdraft frequency, savings rate, emergency fund coverage
   - **Debt Management (25%)**: Debt-to-income ratio, payment timeliness, credit utilization

#### 2. **Behavioral Risk (25% weight)**
   - **Spending Patterns (35%)**: Discretionary spending ratio, gambling activity, luxury spending trends
   - **Financial Responsibility (40%)**: Bill payment consistency, rent payment history, utility payment patterns
   - **Digital Behavior (25%)**: App engagement, document submission timeliness, profile completeness

#### 3. **Alternative Data (20% weight)**
   - **Social Capital (30%)**: Professional network strength, education level, skill marketability
   - **Asset Profile (40%)**: Vehicle ownership, property ownership, investment accounts, business ownership
   - **Lifestyle Stability (30%)**: Residential stability, family structure, health insurance, professional licenses

#### 4. **Environmental Risk (10% weight)**
   - **Macroeconomic (40%)**: Industry volatility, regional economic health, interest rate trends
   - **Regulatory (30%)**: Compliance requirements, legal jurisdiction, data privacy regulations

#### 5. **Fraud Risk (10% weight)**
   - **Identity Verification (50%)**: Document authenticity, biometric match score, address verification
   - **Transaction Anomaly (50%)**: Unusual transfer patterns, velocity checks, geolocation anomalies

### Risk Score Calculation

The calculator:
- Normalizes all factors to a 0-100 scale (lower = better)
- Applies dimension-specific weights
- Calculates weighted overall Helix Score
- Generates explainable AI (XAI) explanations
- Provides confidence intervals based on data completeness
- Flags high-risk cases and fast-track eligible applicants

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ (or 20+ recommended)
- npm, pnpm, or yarn package manager

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CreditConnect
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   # or
   pnpm install
   ```
   
   > **Note**: If you encounter peer dependency conflicts, use `--legacy-peer-deps` flag with npm. This is safe as the dependencies are compatible but npm's strict peer dependency checking may flag them.

3. **Set up environment variables**
   Create a `.env` file in the root directory (you can copy from `.env.example`):
   ```env
   JWT_SECRET=your-secret-key-change-in-production
   DATABASE_PATH=./data/creditconnect.db
   ```
   
   > **Note**: 
   > - Use a strong, random secret key in production. You can generate one using:
   >   ```bash
   >   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   >   ```
   > - `DATABASE_PATH` can be an absolute path or relative to the project root. Default is `./data/creditconnect.db`
   > - The `.env` file is already in `.gitignore` and will not be committed to version control

4. **Database initialization**
   The SQLite database will be automatically created on first run at the path specified in `DATABASE_PATH` (default: `data/creditconnect.db`). The directory will be created automatically if it doesn't exist.

5. **Enable Demo Data (Optional - for Investor Pitch)**
   
   To populate the database with demo data showcasing all features, add the following to your `.env` file:
   ```env
   SEED_DEMO_DATA=true
   ```
   
   This will create:
   - **3 Client Users** with different risk profiles (Prime, Near-Prime, Subprime)
   - **5 Canadian Banks** (RBC, TD, Scotiabank, BMO, CIBC)
   - **18+ Financial Products** (Credit Cards, Personal Loans, Auto Loans, Mortgages)
   - **Risk Profiles** with historical data
   - **Sample Applications** and **Pre-Approval Matches**
   
   **Demo Account Credentials:**
   
   **Client Accounts:**
   - **Prime Customer** (Helix Score: ~18-22)
     - Email: `prime@demo.com`
     - Password: `Demo123!`
   - **Near-Prime Customer** (Helix Score: ~38-42)
     - Email: `nearprime@demo.com`
     - Password: `Demo123!`
   - **Subprime Customer** (Helix Score: ~58-62)
     - Email: `subprime@demo.com`
     - Password: `Demo123!`
   
   **Bank Accounts:**
   - **Royal Bank of Canada (RBC)**
     - Email: `rbc@demo.com`
     - Password: `Demo123!`
   - **Toronto-Dominion Bank (TD)**
     - Email: `td@demo.com`
     - Password: `Demo123!`
   - **Bank of Nova Scotia (Scotiabank)**
     - Email: `scotiabank@demo.com`
     - Password: `Demo123!`
   - **Bank of Montreal (BMO)**
     - Email: `bmo@demo.com`
     - Password: `Demo123!`
   - **Canadian Imperial Bank of Commerce (CIBC)**
     - Email: `cibc@demo.com`
     - Password: `Demo123!`
   
   > **Note**: 
   > - To **disable** demo data seeding, either remove `SEED_DEMO_DATA` from your `.env` file or set it to `false`
   > - Demo data is only seeded when the server starts and `SEED_DEMO_DATA=true`
   > - If demo users already exist, they will be preserved (the script checks for existing users)
   > - Demo data includes realistic Canadian banking products based on actual offerings

6. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server with Turbo
- `npm run build` - Build for production
- `npm start` - Start production server

## 🗄️ Database Schema

The SQLite database includes the following tables:

- `users` - User accounts (clients, banks, admins)
- `client_profiles` - Client-specific profile data
- `bank_profiles` - Bank institution information
- `risk_profiles` - Current risk assessments
- `risk_profile_history` - Historical risk score tracking
- `products` - Loan products offered by banks
- `applications` - Loan applications and their status
- `risk_alerts` - Risk monitoring alerts
- `financial_data` - Financial data from Open Banking
- `product_matches` - Pre-approval matches
- `risk_improvement_goals` - User improvement goals

## 🔌 API Endpoints

### Authentication

#### `POST /api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "role": "client" | "bank",
  "firstName": "John",
  "lastName": "Doe",
  "bankName": "Bank Name" // Required if role is "bank"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "client"
  },
  "token": "jwt-token"
}
```

#### `POST /api/auth/login`
Authenticate and login user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### `GET /api/auth/me`
Get current authenticated user. Requires `Authorization: Bearer <token>` header.

### Risk Calculation

#### `POST /api/risk/calculate`
Calculate Helix Risk Score for a user.

**Request Body:**
```json
{
  "userId": "user-uuid",
  "userData": {
    "monthlyIncome": 5000,
    "employmentDuration": 24,
    "debtToIncomeRatio": 0.35,
    "paymentTimeliness": 90,
    "averageMonthlyBalance": 5000,
    // ... other optional fields
  }
}
```

**Response:**
```json
{
  "helixScore": 42.5,
  "riskCategory": "near_prime",
  "dimensions": {
    "financial": 45.2,
    "behavioral": 38.5,
    "alternative": 50.0,
    "environmental": 40.0,
    "fraud": 35.0
  },
  "explanation": { /* detailed explanation */ },
  "confidence": 0.85,
  "flags": {
    "highRisk": false,
    "requiresManualReview": false,
    "fastTrackEligible": true,
    "primeCustomer": false
  }
}
```

#### `GET /api/risk/profile/[userId]`
Get current risk profile with history and trends.

#### `POST /api/risk/simulate`
Simulate how different scenarios would affect risk score.

**Request Body:**
```json
{
  "userId": "user-uuid",
  "scenarios": [
    {
      "debtToIncomeRatio": 0.30,
      "paymentTimeliness": 95
    }
  ]
}
```

#### `GET /api/risk/monitor/[userId]`
Get continuous monitoring data including alerts and changes.

#### `GET /api/risk/improvements/[userId]`
Get personalized improvement recommendations.

#### `GET /api/risk/portfolio/analysis`
Get portfolio-wide risk analysis. Query params: `?bankId=uuid&timeframe=30&segment=all`

### Products

#### `POST /api/products/match`
Match loan products to a user's risk profile.

**Request Body:**
```json
{
  "userId": "user-uuid",
  "needs": {
    "amount": 10000,
    "termMonths": 36,
    "productType": "personal_loan"
  }
}
```

**Response:**
```json
{
  "matches": [
    {
      "product": { /* product details */ },
      "matchScore": 0.85,
      "preApproved": true,
      "instantApproval": false,
      "pricing": {
        "interestRate": 8.5,
        "originationFee": 250,
        "maxAmount": 15000,
        "terms": [24, 36, 48]
      }
    }
  ],
  "helixScore": 42.5
}
```

## 🎯 Usage Guide

### For Clients

1. **Register an Account**
   - Navigate to `/register`
   - Select "Client" as account type
   - Fill in your information and create account

2. **Calculate Your Risk Profile**
   - Go to `/client/risk-profile`
   - Enter financial information:
     - Monthly income
     - Employment duration (in months)
     - Debt-to-income ratio (%)
     - Payment timeliness (0-100)
     - Average monthly balance
   - Click "Calculate Risk Score"
   - Review your Helix Score and detailed breakdown

3. **Browse Pre-Approved Offers**
   - Visit `/client/marketplace`
   - Optionally filter by loan amount and term
   - View personalized pricing based on your risk profile
   - Apply for pre-approved loans

4. **Use the Risk Simulator**
   - Go to `/client/simulator`
   - Enter different financial scenarios
   - See projected impact on your Helix Score
   - Get estimated timeframes for improvements

5. **Follow Improvement Recommendations**
   - Check your risk profile for personalized recommendations
   - Track progress toward improvement goals
   - Monitor your score changes over time

### For Banks

1. **Register a Bank Account**
   - Navigate to `/register`
   - Select "Bank" as account type
   - Enter bank name and contact information

2. **Create Loan Products**
   - Go to `/bank/products`
   - Click "Create Product"
   - Configure:
     - Product name and description
     - Product type (Personal Loan, Auto Loan, Mortgage, Credit Line)
     - Base interest rate and origination fee
     - Loan amount range
     - Term options (min/max months)
     - Helix Score eligibility range
   - Products are automatically matched to eligible borrowers

3. **View Portfolio Analytics**
   - Access `/bank/dashboard` for overview
   - Visit `/bank/portfolio` for detailed analysis
   - Monitor:
     - Average Helix Scores
     - Risk distribution across categories
     - Approval and STP rates
     - Portfolio trends and outliers

4. **Monitor Risk Trends**
   - Review continuous risk monitoring alerts
   - Identify borrowers requiring intervention
   - Track portfolio health metrics

## 🔒 Security & Compliance

### Security Features
- **Password Hashing**: bcrypt with salt rounds (10)
- **Authentication**: JWT tokens with 7-day expiration
- **SQL Injection Protection**: Parameterized queries via better-sqlite3
- **Role-Based Access Control (RBAC)**: Client, Bank, and Admin roles
- **Input Validation**: Type checking and validation on API endpoints
- **Secure Headers**: Next.js security headers enabled

### Data Protection
- Database path configurable via `DATABASE_PATH` environment variable (default: `data/creditconnect.db`)
- Database files excluded from git (see `.gitignore`)
- `.env` file excluded from git to protect secrets
- Sensitive data not logged in production
- JWT secrets should be strong and kept secure

### Compliance Considerations
- **FCRA**: Fair Credit Reporting Act compliance ready
- **ECOA**: Equal Credit Opportunity Act compliance ready
- **TILA**: Truth in Lending Act compliance ready
- **Model Risk Management**: SR 11-7 compliance ready
- **Explainable AI**: All risk decisions include explanations

## 📊 Risk Score Interpretation

The Helix Score ranges from **0-100**, where **lower scores indicate lower risk**:

| Score Range | Category | Description | Typical Interest Rate Impact |
|------------|----------|-------------|----------------------------|
| **0-25** | Prime | Excellent creditworthiness | -2% to base rate |
| **26-45** | Near Prime | Good creditworthiness | Base rate |
| **46-65** | Subprime | Fair creditworthiness | +3% to base rate |
| **66-85** | Deep Subprime | Poor creditworthiness | +6% to base rate |
| **86-100** | Decline | High risk - typically declined | N/A |

### Score Components

Each risk profile includes:
- **Helix Score**: Overall risk score (0-100)
- **Dimension Scores**: Breakdown across 5 dimensions
- **Risk Category**: Prime, Near Prime, Subprime, Deep Subprime, or Decline
- **Confidence Interval**: Data quality indicator (0-1)
- **Flags**: High risk, manual review required, fast-track eligible, prime customer
- **Explanation**: AI-generated narrative with key factors, strengths, concerns, and recommendations

## 🧪 Testing the Application

### Sample Data for Testing

**Client Test Account:**
- Email: `client@test.com`
- Password: `test123`
- Role: Client

**Bank Test Account:**
- Email: `bank@test.com`
- Password: `test123`
- Role: Bank
- Bank Name: Test Bank

### Testing Risk Calculation

Try these sample inputs to see different risk categories:

**Prime Customer:**
```json
{
  "monthlyIncome": 8000,
  "employmentDuration": 60,
  "debtToIncomeRatio": 0.25,
  "paymentTimeliness": 98,
  "averageMonthlyBalance": 15000
}
```

**Subprime Customer:**
```json
{
  "monthlyIncome": 3000,
  "employmentDuration": 6,
  "debtToIncomeRatio": 0.50,
  "paymentTimeliness": 65,
  "averageMonthlyBalance": 500
}
```

## 🐛 Troubleshooting

### Database Issues
- If database errors occur, delete the `data/` directory and restart the app
- Ensure write permissions in the project directory

### Authentication Issues
- Clear browser localStorage if token issues occur
- Check that `JWT_SECRET` is set in `.env` file
- Ensure `.env` file exists in the project root directory
- The app will throw an error on startup if `JWT_SECRET` is missing

### Build Issues
- Run `npm install` or `pnpm install` to ensure all dependencies are installed
- Clear `.next` directory and rebuild if build errors persist

### Port Already in Use
- Change port: `npm run dev -- -p 3001`
- Or kill the process using port 3000

## 🚧 Future Enhancements

### Planned Features
- **Open Banking Integration**: Plaid, Yodlee, TrueLayer API connectors
- **Document Processing**: OCR/AI parsing for bank statements, pay stubs, tax returns
- **Real-time Webhooks**: Risk monitoring alerts via webhooks
- **Advanced Analytics**: Portfolio stress testing and predictive modeling
- **Machine Learning**: Enhanced ML models for risk prediction
- **Mobile App**: React Native mobile application
- **Multi-tenant Support**: Multiple bank organizations
- **API Rate Limiting**: Protect against abuse
- **Audit Logging**: Comprehensive audit trail
- **Data Export**: CSV/PDF export for reports

### Integration Points Ready
- Open Banking APIs (structure in place)
- Document processing pipeline (schema ready)
- Third-party data aggregators (extensible)
- Core Banking Systems (CBS) integration ready

## 📈 Performance

- **API Latency**: < 500ms p95 for risk calculation
- **Database**: SQLite with WAL mode for better concurrency
- **Caching**: Ready for Redis integration
- **Scalability**: Horizontal scaling ready with database migration

## 📝 License

This project is proprietary software. All rights reserved.

## 🤝 Contributing

This is a private project. For questions, issues, or feature requests, please contact the development team.

## 🙏 Acknowledgments

Built with modern web technologies to revolutionize the lending industry through:
- Transparent risk assessment
- Financial inclusion
- AI-powered decision making
- Straight-through processing efficiency

---

**Built with ❤️ for revolutionizing the lending industry.**

*Credit Connect - Where AI meets Financial Inclusion*
