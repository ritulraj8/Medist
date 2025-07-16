# Med Assist - AI-Powered Medical Assistant

A Next.js application that provides medical assistance through text-based chat and medical image analysis using Gemini AI and PyTorch.

## Features

- **AI Chat Assistant**: Ask health-related questions and get helpful responses
- **User Authentication**: Secure login and signup system
- **Chat History**: View past conversations

## Getting Started

### Prerequisites

1. **Google Gemini API Key**:
   - Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Add it to your `.env.local` file as `GEMINI_API_KEY=your_api_key_here`

2. **Python Environment**:
   - Python 3.8+ for the Flask server that handles image analysis

### Setup and Running

1. **Install Next.js dependencies**:
   ```bash
   npm install
   ```

2. **Set up Flask server**:
   ```bash
   cd flask-server
   pip install -r requirements.txt
   ```

3. **Start the Flask server**:
   ```bash
   cd flask-server
   python app.py
   ```
4. **Start the Next.js development server**:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## How to Use

1. **Login or Sign up** to access the application
2. **Ask health-related questions** in the chat interface

## Technologies Used

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**:  Flask
- **AI**: Google Gemini API, PyTorch
- **Authentication**: NextAuth.js
- **Database**: MongoDB

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [Google Gemini API](https://ai.google.dev/docs)
- [PyTorch](https://pytorch.org/docs/stable/index.html)
- [Flask](https://flask.palletsprojects.com/)

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
