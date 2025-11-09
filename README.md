# Ignite Health Partnerships

**Transform healthcare decision-making with real-time cost comparisons between Traditional Insurance and DPC + Catastrophic coverage.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)

---

## 🌟 What is Ignite Health Partnerships?

Ignite Health Partnerships helps Americans make informed healthcare decisions by comparing:

**Traditional Insurance** vs. **DPC + Catastrophic + Out-of-Pocket**

- 💰 **Real Cost Comparisons** - Compare actual costs, not estimates
- 🏥 **2,734 DPC Providers** - Find Direct Primary Care providers nationwide
- 💊 **Prescription Pricing** - Walmart $4 program + pharmacy comparison
- 📊 **Healthcare.gov Integration** - Real marketplace insurance plans
- 🗺️ **Location-Based Search** - Find providers near you
- 💡 **Savings Recommendations** - Personalized cost-saving insights

---

## ⚡ Quick Start

### One-Command Setup

```bash
./scripts/setup-complete.sh
```

That's it! This will:
- ✅ Start PostgreSQL database
- ✅ Install dependencies
- ✅ Run migrations
- ✅ Import Walmart $4 program
- ✅ Test scraper
- ✅ Optionally scrape all 2,734 providers

**Time:** ~5 minutes (or ~73 minutes with full provider scraping)

### Manual Setup

```bash
# 1. Start database
docker-compose up -d

# 2. Install dependencies
npm install
cd apps/api && npm install

# 3. Run migrations
npx prisma migrate dev
npx prisma generate

# 4. Import Walmart program
npm run import:walmart

# 5. Start API server
npm run dev
```

**See detailed guide:** [GETTING_STARTED.md](docs/GETTING_STARTED.md)

---

## 🎯 Features

### ✅ Complete REST API (11 Endpoints)

| Category | Endpoints | Description |
|----------|-----------|-------------|
| **Providers** | 3 | Search, lookup, statistics |
| **Prescriptions** | 5 | Search, pricing, cost calculation |
| **Comparison** | 1 | DPC vs Traditional comparison |
| **System** | 2 | Health check, API info |

**Full documentation:** [API_REFERENCE.md](docs/API_REFERENCE.md)

### ✅ Real Data Sources

- **Healthcare.gov API** - Real-time marketplace plans
- **DPC Frontier** - 2,734 actual DPC practices
- **Walmart $4 Program** - 30+ medications
- **Costco Pharmacy** - Price estimates

### ✅ Automated Data Collection

- Web scraper for DPC providers
- Data quality scoring
- Source tracking
- Automatic updates

---

## 📊 Example Cost Comparison

**Scenario:** 35-year-old in NYC, $50k income, 3 doctor visits/year, 2 prescriptions

| Plan | Monthly | Annual | Details |
|------|---------|--------|---------|
| **Traditional** | $400 premium | $7,800 | $3,000 deductible |
| **DPC + Catastrophic** | $233 total | $3,296 | $75 DPC + $150 catastrophic + $8 Rx |
| **Savings** | $167/mo | **$4,504/year** | **58% savings** |

---

## 🚀 Quick API Examples

```bash
# Search providers
curl "http://localhost:4000/api/providers/search?zipCode=10001&radius=25"

# Get medication pricing
curl "http://localhost:4000/api/prescriptions/pricing?name=Metformin"

# Calculate prescription costs
curl -X POST http://localhost:4000/api/prescriptions/calculate-costs \
  -H "Content-Type: application/json" \
  -d '{"medications": ["Lisinopril", "Metformin"]}'

# Compare DPC vs Traditional
curl -X POST http://localhost:4000/api/comparison/calculate \
  -H "Content-Type: application/json" \
  -d '{"age": 35, "zipCode": "10001", "state": "NY", "income": 50000}'
```

---

## 💻 Tech Stack

- **Backend:** Node.js, TypeScript, Express, Prisma
- **Database:** PostgreSQL
- **Scraping:** Cheerio, Axios
- **Validation:** Zod
- **Infrastructure:** Docker, GitHub Actions

---

## 📦 Project Structure

```
DPC-Cost-Comparator/
├── apps/api/              # Express API server
│   ├── src/routes/        # API endpoints
│   ├── src/services/      # Business logic
│   └── prisma/            # Database schema
├── scripts/               # Automation scripts
│   ├── setup-complete.sh           # One-command setup
│   ├── scrape-dpc-providers.ts     # DPC scraper
│   └── import-walmart-programs.ts  # Walmart import
├── data/                  # Static data files
├── docs/                  # Comprehensive docs
└── docker-compose.yml     # PostgreSQL setup
```

---

## 🛠️ Development

```bash
# Start API server (hot reload)
cd apps/api && npm run dev

# View database
npx prisma studio

# Run linter
npm run lint

# Scrape providers
npm run scrape:dpc:test    # Test with 10 providers
npm run scrape:dpc         # Scrape all 2,734
```

---

## 📚 Documentation

- 📖 [Getting Started](docs/GETTING_STARTED.md)
- 📚 [API Reference](docs/API_REFERENCE.md)
- 🔧 [DPC Scraper Guide](docs/DPC_SCRAPER_GUIDE.md)
- 💊 [Prescription Pricing](docs/PRESCRIPTION_PRICING_ALTERNATIVES.md)
- 📊 [Week 2 Summary](docs/WEEK2_PROGRESS_SUMMARY.md)
- 🗄️ [Database Setup](docs/DATABASE_SETUP.md)

---

## 📈 Data Coverage

### DPC Providers
- **Total:** 2,734 practices
- **Coverage:** All 50 US states
- **Quality:** Average score 75-85/100
- **Includes:** Name, address, phone, website, fees, services, GPS coordinates

### Prescriptions
- **Walmart $4:** 30+ common generics
- **Pricing:** $4 (30-day), $10 (90-day)
- **Categories:** Cardiovascular, diabetes, mental health, pain, antibiotics, respiratory

### Insurance
- **Source:** Healthcare.gov API
- **Plans:** All metal tiers
- **Features:** Real-time pricing, subsidies, county-level data

---

## 🎓 Use Cases

### For Patients
- Compare DPC vs traditional insurance costs
- Find affordable DPC providers nearby
- Get accurate prescription pricing
- Save thousands per year

### For Providers
- List your DPC practice
- Reach patients seeking affordable care
- Showcase services and pricing

### For Researchers
- Analyze DPC adoption trends
- Study healthcare cost comparisons
- Access comprehensive provider data

---

## 🚧 Roadmap

### ✅ Completed (Weeks 1-2)
- Database schema & infrastructure
- DPC provider scraper (2,734 practices)
- Prescription pricing (Walmart $4)
- Healthcare.gov API integration
- Complete REST API (11 endpoints)
- Comprehensive documentation

### 🔄 In Progress (Weeks 3-4)
- [ ] Frontend UI (React/Next.js)
- [ ] User authentication
- [ ] Enhanced prescription pricing

### 📋 Planned (Week 5+)
- [ ] Lab test pricing
- [ ] Mobile app
- [ ] Provider dashboard
- [ ] Email notifications

---

## 🤝 Contributing

Contributions welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

---

## 👏 Acknowledgments

- **DPC Frontier** for provider data
- **Healthcare.gov** for marketplace API
- **Walmart** for $4 prescription program
- **Open source community** for amazing tools

---

## 📞 Support

- **Documentation:** See `/docs` folder
- **Issues:** [GitHub Issues](https://github.com/bhavenmurji/DPC-Cost-Comparator/issues)
- **Getting Started:** [GETTING_STARTED.md](docs/GETTING_STARTED.md)

---

**Built with ❤️ to make healthcare more affordable and transparent**

🤖 *Powered by Claude Code - Making development faster and more efficient*
