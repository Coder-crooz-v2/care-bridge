# Prescription Decoder - Enhanced Features Setup Guide

## Overview

This updated prescription decoder includes:

1. **Two-column interface** - Image preview on left, decoded information on right
2. **Enhanced medicine information** - Purpose, warnings, contraindications, and more
3. **Editable prescription results** - Manually edit, add, or delete medications
4. **Medicine reminder system** - Calendar-based email reminders using SendGrid
5. **Removed processing steps** component for cleaner UX

## Setup Instructions

### 1. Frontend Dependencies

The following packages have been installed:

- `react-day-picker` - For calendar functionality
- `date-fns` - Date manipulation utilities
- `@sendgrid/mail` - SendGrid email service
- Various shadcn/ui components (calendar, dialog, textarea, etc.)

### 2. SendGrid Email Service Setup

#### Step 1: Create SendGrid Account

1. Go to [SendGrid](https://sendgrid.com/) and create a free account
2. Verify your email address
3. Complete the account setup process

#### Step 2: Generate API Key

1. Go to SendGrid Dashboard → Settings → API Keys
2. Click "Create API Key"
3. Choose "Restricted Access" and configure the following permissions:
   - **Mail Send**: Full Access
   - **Mail Settings**: Read Access (optional)
4. Copy the generated API key

#### Step 3: Verify Sender Email (Important!)

1. Go to SendGrid Dashboard → Settings → Sender Authentication
2. Click "Single Sender Verification"
3. Add and verify the email address you want to send from
4. **Note**: Free SendGrid accounts can only send emails from verified sender addresses

#### Step 4: Configure Environment Variables

**Frontend (.env.local)**:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GROQ_API_KEY=your-groq-api-key
PYTHON_API_URL=http://127.0.0.1:8000

# SendGrid Configuration
SENDGRID_API_KEY=SG.your-sendgrid-api-key-here
SENDER_EMAIL=your-verified-email@example.com

NODE_ENV=development
```

**Backend (.env in carebridge-ml folder)**:

```bash
# API Keys
GROQ_API_KEY=your-groq-api-key
SENDGRID_API_KEY=SG.your-sendgrid-api-key-here

# Email Configuration
SENDER_EMAIL=your-verified-email@example.com

# API Configuration
PYTHON_API_URL=http://127.0.0.1:8000
```

### 3. Python Backend Setup

#### Install Required Dependencies

```bash
cd carebridge-ml
pip install sendgrid python-dotenv
```

#### Start the Backend Server

```bash
cd carebridge-ml
python server.py
```

The server will run on `http://127.0.0.1:8000` and include:

- `/dosage/extract-dosage` - Enhanced prescription extraction with medicine info
- `/reminder/send-reminder` - Email reminder functionality
- `/reminder/send-health-warning` - Health warning emails

### 4. Frontend Development

#### Start the Frontend

```bash
cd carebridge
npm run dev
```

The frontend will run on `http://localhost:3000`

## Features Guide

### 1. Two-Column Interface

- **Left Column**: Upload zone and image preview
- **Right Column**: Results with tabs for "Medicine Details" and "Reminders"

### 2. Enhanced Medicine Information

Each detected medicine now includes:

- **Purpose**: Why the medicine is prescribed
- **Avoid Groups**: People who should avoid this medicine
- **Warnings**: Important safety warnings
- **Interactions**: Drug interactions
- **Precautions**: Safety precautions
- **Contraindications**: When not to use

### 3. Editable Results

- **Edit**: Click the edit icon to modify medicine details
- **Add**: Click "Add Medicine" to add new medications
- **Delete**: Click trash icon to remove medicines
- **Auto-update**: When medicine names are edited, information updates automatically

### 4. Reminder System

- **Calendar View**: Visual calendar showing reminder dates
- **Email Setup**: Enter email address for reminders
- **Set Reminders**: Based on frequency and duration from prescription
- **Email Notifications**: Automated emails sent using SendGrid

### 5. Error Handling

- Proper error messages for missing API keys
- Fallback for offline Python API
- User-friendly error displays
- Retry functionality

## API Endpoints

### Frontend API Routes

- `POST /api/prescription-upload` - Upload and process prescription
- `POST /api/send-reminder` - Send reminder email

### Python Backend Routes

- `GET /` - API information
- `POST /dosage/extract-dosage` - Enhanced prescription extraction
- `POST /reminder/send-reminder` - Send medication reminder
- `POST /reminder/send-health-warning` - Send health warning

## Troubleshooting

### SendGrid Issues

1. **"Sender not verified"**: Verify your sender email in SendGrid dashboard
2. **API Key errors**: Ensure API key has proper permissions
3. **Daily limit exceeded**: Free tier has 100 emails/day limit

### Python API Issues

1. **Connection refused**: Ensure Python server is running on port 8000
2. **Import errors**: Install required dependencies with pip
3. **Environment variables**: Check .env file in carebridge-ml folder

### Frontend Issues

1. **Component not found**: Run `npm install` to install dependencies
2. **Build errors**: Ensure all shadcn components are properly installed
3. **TypeScript errors**: Check type definitions in types/prescription.ts

## Security Considerations

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Validate email addresses** before sending
4. **Rate limit** email sending in production
5. **Verify sender domains** for production use

## Production Deployment

### SendGrid Production Setup

1. **Domain Authentication**: Set up domain authentication for better deliverability
2. **Dedicated IP**: Consider dedicated IP for high-volume sending
3. **Webhooks**: Set up webhooks to track email delivery status
4. **Templates**: Use SendGrid templates for consistent email design

### Environment Configuration

- Use proper production URLs
- Enable CORS for your production domain
- Set up proper logging and monitoring
- Configure backup email service

## Support

For issues with:

- **SendGrid**: Check SendGrid documentation and support
- **API Integration**: Verify environment variables and API endpoints
- **Medicine Information**: Expand the medicine database in `medicine_info_service.py`
- **Calendar Features**: Refer to react-day-picker documentation
