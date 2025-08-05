# DigiSol AI - Comprehensive Marketing & AI Platform

A full-stack marketing automation platform with AI-powered features, project management, analytics, and design tools.

## 🚀 Features

- **AI-Powered Marketing**: Automated content generation, lead scoring, and campaign optimization
- **Project Management**: Complete project lifecycle management with Gantt charts and resource allocation
- **Design Studio**: AI-powered design tools for logos, banners, social media posts, and more
- **Analytics & Reporting**: Comprehensive analytics dashboard with real-time insights
- **Budget Management**: Advanced budgeting and cost tracking systems
- **Campaign Automation**: Multi-channel campaign workflows with conditional logic
- **Contact Management**: CRM with lead scoring and persona analysis
- **Integration Hub**: Connect with popular marketing tools and platforms

## 🛠️ Tech Stack

### Backend
- **Django 4.2+** - Python web framework
- **Django REST Framework** - API development
- **PostgreSQL/SQLite** - Database
- **Celery** - Background task processing
- **Redis** - Caching and message broker
- **OpenAI API** - AI content generation
- **Stripe** - Payment processing

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **React Flow** - Workflow editor
- **Chart.js** - Data visualization

## 📋 Prerequisites

- Python 3.11+
- Node.js 18+
- Git
- Redis (for background tasks)
- PostgreSQL (optional, SQLite for development)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/digisolai/digisol.ai.git
cd digisol.ai
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp env.example .env
# Edit .env with your actual API keys and settings

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start the backend server
python manage.py runserver
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Django Settings
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# API Keys
OPENAI_API_KEY=your-openai-api-key-here
STRIPE_SECRET_KEY=your-stripe-secret-key-here
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key-here

# AWS Configuration (optional)
AWS_ACCESS_KEY_ID=your-aws-access-key-id-here
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key-here
AWS_STORAGE_BUCKET_NAME=your-s3-bucket-name-here

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-email-password-here
```

## 📁 Project Structure

```
DigiSol.AI/
├── backend/                 # Django backend
│   ├── accounts/           # User authentication & management
│   ├── ai_services/        # AI-powered features
│   ├── analytics/          # Analytics & reporting
│   ├── campaigns/          # Campaign management
│   ├── core/              # Core models & utilities
│   ├── project_management/ # Project management features
│   └── subscription_billing/ # Billing & subscriptions
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript types
│   └── public/            # Static assets
└── docs/                  # Documentation
```

## 🔧 Development

### Running Tests
```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests
cd frontend
npm test
```

### Code Quality
```bash
# Backend linting
cd backend
flake8 .
black .

# Frontend linting
cd frontend
npm run lint
```

## 🚀 Deployment

### Backend Deployment
1. Set up a production server (AWS, DigitalOcean, etc.)
2. Configure environment variables for production
3. Set up PostgreSQL database
4. Configure Redis for Celery
5. Set up SSL certificates
6. Deploy using Gunicorn + Nginx

### Frontend Deployment
1. Build the production version: `npm run build`
2. Deploy to Netlify, Vercel, or your preferred hosting service
3. Configure environment variables for production API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests for new functionality
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation in the `docs/` folder
- Review the troubleshooting guide

## 🔐 Security

- Never commit API keys or sensitive information
- Use environment variables for all secrets
- Keep dependencies updated
- Follow security best practices

## 📈 Roadmap

- [ ] Enhanced AI capabilities
- [ ] Mobile app development
- [ ] Advanced analytics
- [ ] Multi-tenant architecture
- [ ] API marketplace
- [ ] Advanced workflow automation

---

**DigiSol AI** - Transforming marketing with AI-powered automation and insights. 