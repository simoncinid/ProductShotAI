# ProductShotAI

SaaS web application for AI-powered Amazon product photography. Transform your product photos into high-quality 8K images optimized for Amazon listings.

## Features

- **AI-Powered Generation**: Uses WaveSpeed's nano-banana-pro edit-ultra model for 8K image generation
- **Freemium Model**: 3 free watermarked images per month per device/IP
- **Credit-Based Pricing**: Pay only for what you use, no monthly subscriptions
- **User Authentication**: Secure JWT-based authentication
- **Generation History**: Track all your generated images
- **Watermarking**: Free tier images include watermarks, paid images are clean
- **Multiple Aspect Ratios**: 1:1 (Amazon main), 4:5 (portrait), 16:9 (landscape)

## Tech Stack

### Backend
- Python 3
- FastAPI
- PostgreSQL with SQLAlchemy (async)
- Uvicorn ASGI server
- WaveSpeed API integration
- JWT authentication
- S3-compatible storage (local or AWS S3)

### Frontend
- Next.js 14 (App Router)
- React 18 with TypeScript
- Tailwind CSS
- React Query for data fetching
- React Hot Toast for notifications

## Project Structure

```
ProductShotAI/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI application
│   │   ├── config.py        # Configuration settings
│   │   ├── database.py       # Database setup
│   │   ├── models.py         # SQLAlchemy models
│   │   ├── schemas.py        # Pydantic schemas
│   │   ├── auth.py           # Authentication logic
│   │   ├── storage.py        # Storage abstraction (S3/local)
│   │   ├── wavespeed.py      # WaveSpeed API client
│   │   ├── watermark.py      # Watermarking logic
│   │   ├── utils.py          # Utility functions
│   │   └── credit_packs.py   # Credit pack definitions
│   ├── requirements.txt
│   ├── alembic.ini
│   └── run.py
├── frontend/
│   ├── app/                  # Next.js app directory
│   ├── components/           # React components
│   ├── lib/                  # API client and utilities
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL database
- WaveSpeed API key

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the `backend` directory:
```env
# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/productshotai

# JWT
JWT_SECRET_KEY=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# WaveSpeed API
WAVESPEED_API_KEY=your-wavespeed-api-key

# Storage (choose one)
STORAGE_TYPE=local
STORAGE_PATH=./storage

# Or for S3:
# STORAGE_TYPE=s3
# AWS_ACCESS_KEY_ID=your-access-key
# AWS_SECRET_ACCESS_KEY=your-secret-key
# AWS_REGION=us-east-1
# S3_BUCKET_NAME=your-bucket-name

# App
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:3000

# Free tier
FREE_GENERATIONS_PER_MONTH=3
```

5. Create the database:
```bash
createdb productshotai  # Or use your PostgreSQL client
```

6. The database tables will be created automatically on first run. Alternatively, you can use Alembic for migrations:
```bash
# Initialize Alembic (if not already done)
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Initial migration"

# Apply migration
alembic upgrade head
```

7. Create the storage directory (if using local storage):
```bash
mkdir -p storage
```

8. Run the backend server:
```bash
python run.py
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Environment Variables

### Backend

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET_KEY` | Secret key for JWT tokens | Yes |
| `WAVESPEED_API_KEY` | WaveSpeed API key | Yes |
| `STORAGE_TYPE` | Storage type: `local` or `s3` | Yes |
| `STORAGE_PATH` | Local storage path (if using local) | If local |
| `AWS_ACCESS_KEY_ID` | AWS access key (if using S3) | If S3 |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key (if using S3) | If S3 |
| `AWS_REGION` | AWS region (if using S3) | If S3 |
| `S3_BUCKET_NAME` | S3 bucket name (if using S3) | If S3 |
| `CORS_ORIGINS` | Comma-separated list of allowed origins | Yes |
| `FREE_GENERATIONS_PER_MONTH` | Free generations limit | Yes |

### Frontend

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Sign up new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### User
- `GET /api/user/me` - Get current user info
- `GET /api/user/generations` - Get user's generation history

### Upload
- `POST /api/upload` - Upload product image

### Generation
- `POST /api/generate-free` - Generate free image (with watermark)
- `POST /api/generate-paid` - Generate paid image (no watermark)

### Credits
- `GET /api/credits/packs` - Get available credit packs
- `POST /api/credits/purchase` - Purchase credits

## Credit Packs

| Pack | Credits | Price per Credit | Total Price |
|------|---------|-------------------|-------------|
| Starter | 5 | $0.99 | $4.95 |
| Standard | 15 | $0.89 | $13.35 |
| Pro | 40 | $0.79 | $31.60 |
| Power | 100 | $0.69 | $69.00 |

## Database Schema

### Users
- `id` (UUID)
- `email` (unique)
- `password_hash`
- `credits_balance`
- `created_at`, `updated_at`, `last_login_at`

### Generations
- `id` (UUID)
- `user_id` (nullable for free users)
- `device_id`, `ip_address`
- `input_image_url`, `output_image_url`
- `prompt`, `model_name`, `resolution`, `aspect_ratio`
- `is_free`, `status`
- `created_at`, `completed_at`, `error_message`

### Credit Transactions
- `id` (UUID)
- `user_id`
- `change_amount` (positive for purchase, negative for usage)
- `type` (purchase, generation, adjust)
- `reference_id`
- `created_at`

### Free Generation Log
- `id` (UUID)
- `device_id`, `ip_address`
- `month_year` (format: YYYY-MM)
- `count`
- `created_at`, `updated_at`

## Deployment

### Backend (Render.com)

1. Connect your repository to Render
2. Create a new Web Service
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables
6. Add PostgreSQL database and set `DATABASE_URL`

### Frontend (Vercel)

1. Connect your repository to Vercel
2. Set root directory to `frontend`
3. Set build command: `npm run build`
4. Add environment variable: `NEXT_PUBLIC_API_URL` (your backend URL)

## Development

### Running Tests

Backend tests (to be implemented):
```bash
pytest
```

Frontend tests (to be implemented):
```bash
npm test
```

### Code Style

Backend: Follow PEP 8
Frontend: ESLint and Prettier (configured via Next.js)

## Security Considerations

- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- API keys are stored in environment variables
- Rate limiting is implemented on generation endpoints
- Input validation on all endpoints
- CORS is configured for allowed origins only

## License

Proprietary - All rights reserved

## Support

For support, email support@productshotai.com
