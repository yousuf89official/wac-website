# We Are Collaborative - Website

A modern, full-featured website for the We Are Collaborative marketing agency, built with Next.js, TypeScript, and Tailwind CSS.

## 🌟 Features

- **Modern Frontend**: Built with Next.js 16, React, and TypeScript
- **AI-Powered Chat**: Integrated Gemini AI chat widget for customer engagement
- **Database Management**: Prisma ORM with PostgreSQL/MySQL support
- **Admin Dashboard**: Content management system for blogs, case studies, and site content
- **Newsletter Integration**: Email subscription management
- **SEO Optimized**: Built-in SEO utilities and metadata management
- **Dark Theme**: Beautiful dark mode design with Tailwind CSS and Radix UI components
- **Responsive Design**: Mobile-first, fully responsive layout
- **Real-time Analytics**: Visitor tracking and analytics integration
- **Type-Safe**: Full TypeScript support throughout the codebase

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (recommended: 20.x or 22.x)
- npm or yarn
- PostgreSQL or MySQL (for production)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/wac-website.git
   cd wac-website
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration:
   ```
   DATABASE_URL="file:./dev.db"  # SQLite for development
   GOOGLE_GENERATIVE_AI_API_KEY="your_api_key"
   NEXTAUTH_SECRET="your_secret_key"
   NEXT_PUBLIC_SITE_URL="http://localhost:3000"
   ```

4. **Initialize the database:**
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Available Scripts

- `npm run dev` - Start development server with Turbo compilation
- `npm run build` - Create an optimized production build
- `npm start` - Start the production server
- `npm run lint` - Run ESLint code quality checks
- `npx prisma db push` - Sync database schema
- `npx prisma db seed` - Seed the database with initial data

## 📁 Project Structure

```
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   ├── admin/                # Admin dashboard
│   ├── blog/                 # Blog pages
│   ├── work/                 # Case studies
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   └── providers.tsx         # Global providers
├── components/               # Reusable React components
│   ├── admin/                # Admin components
│   ├── chat/                 # Chat widget
│   ├── layout/               # Layout components
│   ├── marketing/            # Marketing components
│   ├── modals/               # Modal components
│   ├── pages/                # Page components
│   ├── sections/             # Section components
│   └── ui/                   # UI library (shadcn)
├── contexts/                 # React contexts
├── hooks/                    # Custom React hooks
├── lib/                      # Utility functions and configuration
├── prisma/                   # Database schema and migrations
├── public/                   # Static assets
├── utils/                    # Helper functions
├── next.config.mjs           # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```

## 🗄️ Database

This project uses Prisma as the ORM. The schema is defined in `prisma/schema.prisma`.

### Supported Databases

- **Development**: SQLite (file-based, no setup required)
- **Production**: PostgreSQL or MySQL (recommended)

### Database Commands

```bash
# Create migrations
npx prisma migrate dev --name migration_name

# Push schema to database
npx prisma db push

# Open Prisma Studio GUI
npx prisma studio

# Seed database
npm run db:seed
```

## 🤖 AI Integration

This project integrates with Google Generative AI (Gemini) for the chat widget.

1. Get your API key from [Google AI Studio](https://ai.google.dev/)
2. Add it to your `.env.local`:
   ```
   GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
   ```

## 🎨 Styling

The project uses Tailwind CSS with shadcn/ui component library.

- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Unstyled, accessible component primitives
- **Custom Components**: Custom dark-themed components in `/components/ui`

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Database connection string | Yes |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Gemini API key | Yes (for chat) |
| `NEXTAUTH_SECRET` | Authentication secret | Yes (for auth) |
| `NEXT_PUBLIC_SITE_URL` | Public site URL | Yes |
| `NEXT_PUBLIC_STAGING` | Staging environment flag | No |

## 🧪 Testing & Quality

The project uses ESLint for code quality checks.

```bash
npm run lint
```

TypeScript is configured for strict type checking.

## 📊 Analytics

The project includes visitor tracking and event analytics. Configure tracking endpoints in the API routes.

## 🔐 Security

- Environment variables are properly isolated
- Database credentials are not committed to the repository
- Authentication is configured via NextAuth (if enabled)
- Input validation on all API endpoints

## 🚢 Deployment

### Vercel (Recommended)

The project is optimized for Vercel deployment:

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Hosting

See [DEPLOY.md](./DEPLOY.md) for detailed deployment instructions for other platforms.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## 📞 Support

For issues and questions, please open an issue on the [GitHub repository](https://github.com/your-username/wac-website).

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Prisma](https://www.prisma.io/)
- [Google Generative AI](https://ai.google.dev/)
- [Radix UI](https://www.radix-ui.com/)
