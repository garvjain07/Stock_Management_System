# Stock Maintenance System with Billing

A comprehensive full-stack web application for managing inventory, billing, and customer relationships. Built with React.js, Node.js, Express, and **MongoDB Atlas** with real-time inventory tracking and automated stock management.

🌐 **Production-Ready**: Configured for deployment on Vercel with GitHub integration.

## 🚀 Features

### Core Modules
- **User Management**: Role-based access control (Admin/Cashier) with JWT authentication
- **Stock Management**: Complete inventory tracking with categories, suppliers, and low-stock alerts
- **Billing System**: Invoice generation with automatic stock deduction and tax calculation
- **Customer Management**: Customer database with purchase history and contact information
- **Supplier Management**: Supplier information with product associations
- **Reports & Dashboard**: Real-time analytics, charts, and comprehensive reporting

### Key Capabilities
- ✅ Real-time inventory tracking with automatic updates
- ✅ Automatic stock deduction on sales
- ✅ Role-based permissions and security
- ✅ Responsive design (Mobile/Tablet/Desktop)
- ✅ Low stock alerts and notifications
- ✅ Sales analytics with interactive charts
- ✅ Customer purchase history tracking
- ✅ Multi-category product management
- ✅ Supplier relationship management
- ✅ Comprehensive audit trails
- ✅ **Cloud-ready with MongoDB Atlas**
- ✅ **Serverless deployment on Vercel**

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Hook Form** - Performant form management
- **Chart.js & React-Chartjs-2** - Interactive data visualization
- **Lucide React** - Beautiful icons
- **React Hot Toast** - Elegant notifications
- **Axios** - Promise-based HTTP client

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast web framework
- **Mongoose** - MongoDB object modeling
- **MongoDB Atlas** - Cloud database service
- **JWT (jsonwebtoken)** - Secure authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Deployment
- **Vercel** - Serverless hosting platform
- **GitHub** - Version control and CI/CD
- **MongoDB Atlas** - Cloud database

### Development Tools
- **ESLint** - Code linting
- **Nodemon** - Auto-restart development server

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB Atlas Account** (free tier available at [mongodb.com/atlas](https://www.mongodb.com/atlas))
- **Git** - Version control
- **npm** - Package manager
- **GitHub Account** (for deployment)
- **Vercel Account** (free at [vercel.com](https://vercel.com))

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd stock-maintenance-system
```

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Environment Configuration
Create a `.env` file in the backend directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=stock_management
DB_USER=root
DB_PASSWORD=your_password
DB_DIALECT=mysql

## 🚀 Quick Start (Local Development)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd stock-maintenance-system
```

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. MongoDB Atlas Setup
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create a database user
4. Get your connection string
5. Whitelist your IP address (or use `0.0.0.0/0` for development)

### 4. Environment Configuration
Create a `.env` file in the backend directory:
```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/Stock_Management?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-complex
JWT_EXPIRE=24h

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Security
BCRYPT_ROUNDS=12
```

### 5. Seed Database
```bash
# Initialize database with admin user and sample data
npm run seed:mongo
```

### 6. Start Backend Server
```bash
npm start
# Or for development with auto-reload:
npm run dev
```
Backend server will start on `http://localhost:5000`

### 7. Frontend Setup
Open a new terminal:
```bash
cd frontend
npm install
```

### 8. Start Frontend Development Server
```bash
npm run dev
```
Frontend will start on `http://localhost:3000`

## 👤 Default Login Credentials

After running the seed script, you can login with:

**Administrator Account:**
- Username: `admin`
- Password: `admin123`
- Access: Full system access

## 🌐 Production Deployment

For detailed deployment instructions to Vercel, see **[DEPLOYMENT.md](./DEPLOYMENT.md)**

Quick deployment steps:
1. Push code to GitHub
2. Deploy backend to Vercel (configure as Node.js serverless)
3. Deploy frontend to Vercel (configure as Vite app)
4. Set environment variables in Vercel dashboard
5. Update CORS settings

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete step-by-step guide.

## 📁 Project Structure

```
stock-maintenance-system/
├── backend/
│   ├── api/
│   │   └── index.js          # Serverless API entry point
│   ├── src/
│   │   ├── config/           # Database configuration
│   │   │   └── mongo.js
│   │   └── models/           # Mongoose models
│   │       └── mongo/
│   │           ├── User.js
│   │           ├── Stock.js
│   │           ├── Bill.js
│   │           ├── Customer.js
│   │           ├── Supplier.js
│   │           ├── Category.js
│   │           └── Unit.js
│   ├── scripts/              # Database scripts
│   │   ├── seed-mongo.js
│   │   ├── seed-admin-only.js
│   │   └── drop-collections.js
│   ├── server-mongo.js       # Local development server
│   ├── vercel.json           # Vercel configuration
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── Layout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Header.jsx
│   │   │   └── modals/
│   │   ├── context/          # React context
│   │   │   └── AuthContext.jsx
│   │   ├── pages/            # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Stock.jsx
│   │   │   ├── Bills.jsx
│   │   │   ├── CreateEditBill.jsx
│   │   │   ├── Customers.jsx
│   │   │   ├── Suppliers.jsx
│   │   │   └── Reports.jsx
│   │   ├── utils/            # Utility functions
│   │   │   └── api.js
│   │   ├── App.jsx           # Main app component
│   │   └── main.jsx          # Entry point
│   ├── public/               # Static assets
│   ├── index.html
│   └── package.json
└── README.md
```

## 🗄️ Database Schema

### Core Tables and Relationships

#### Users Table
```sql
- id (Primary Key)
- username (Unique)
- password (Hashed)
- role (Admin/Cashier)
- created_at, updated_at
```

#### Stock Table
```sql
- id (Primary Key)
- name
- category
- quantity
- price
- supplier_id (Foreign Key → suppliers.id)
- low_stock_threshold
- expiry_date
- created_at, updated_at
```

#### Suppliers Table
```sql
- id (Primary Key)
- name
- contact_person
- phone
- email
- address
- created_at, updated_at
```

#### Customers Table
```sql
- id (Primary Key)
- name
- phone
- email
- address
- created_at, updated_at
```

#### Bills Table
```sql
- id (Primary Key)
- bill_number (Auto-generated)
- customer_id (Foreign Key → customers.id)
- total_amount
- tax_amount
- discount_amount
- grand_total
- created_at, updated_at
```

#### Bill Items Table
```sql
- id (Primary Key)
- bill_id (Foreign Key → bills.id)
- stock_id (Foreign Key → stock.id)
- quantity
- unit_price
- total_price
- created_at, updated_at
```

### Key Relationships
- **Stock** ↔ **Suppliers**: Many-to-One
- **Bills** ↔ **Customers**: Many-to-One  
- **Bills** ↔ **BillItems**: One-to-Many
- **BillItems** ↔ **Stock**: Many-to-One

## 🔐 API Endpoints

### Authentication Routes
```
POST   /api/auth/login        # User login
POST   /api/auth/register     # User registration (admin only)
GET    /api/auth/me           # Get current user profile
POST   /api/auth/logout       # User logout
```

### Stock Management Routes
```
GET    /api/stock             # Get all stock items
POST   /api/stock             # Create new stock item
GET    /api/stock/:id         # Get specific stock item
PUT    /api/stock/:id         # Update stock item
DELETE /api/stock/:id         # Delete stock item
GET    /api/stock/low-stock   # Get low stock items
```

### Billing Routes
```
GET    /api/bills             # Get all bills (with pagination)
POST   /api/bills             # Create new bill
GET    /api/bills/:id         # Get specific bill with items
PUT    /api/bills/:id         # Update bill
DELETE /api/bills/:id         # Delete bill
```

### Customer Management Routes
```
GET    /api/customers         # Get all customers
POST   /api/customers         # Create new customer
GET    /api/customers/:id     # Get specific customer
PUT    /api/customers/:id     # Update customer
DELETE /api/customers/:id     # Delete customer
```

### Supplier Management Routes
```
GET    /api/suppliers         # Get all suppliers
POST   /api/suppliers         # Create new supplier
GET    /api/suppliers/:id     # Get specific supplier
PUT    /api/suppliers/:id     # Update supplier
DELETE /api/suppliers/:id     # Delete supplier
```

### Dashboard & Analytics Routes
```
GET    /api/dashboard/stats   # Get dashboard statistics
GET    /api/dashboard/sales   # Get sales chart data
GET    /api/dashboard/stock   # Get stock level data
```

## 🎨 Frontend Features

### User Interface
- **Responsive Design**: Mobile-first approach with breakpoints
- **Modern UI**: Clean, intuitive interface with Tailwind CSS
- **Interactive Charts**: Real-time data visualization
- **Toast Notifications**: User feedback for actions
- **Modal Dialogs**: Create/edit forms in overlay modals
- **Loading States**: Skeleton loaders and spinners

### User Experience
- **Role-based Navigation**: Different menu items per user role
- **Search & Filter**: Quick find functionality across all modules
- **Pagination**: Efficient data handling for large datasets
- **Form Validation**: Real-time validation with error messages
- **Confirmation Dialogs**: Prevent accidental data deletion
- **Auto-save**: Draft functionality for long forms

## 📊 Dashboard & Reports

### Dashboard Widgets
1. **Sales Overview**: Total sales, daily/monthly trends
2. **Stock Status**: Low stock alerts, total inventory value
3. **Recent Activities**: Last bills, stock updates
4. **Top Products**: Best-selling items
5. **Customer Stats**: New customers, frequent buyers

### Available Reports
1. **Sales Reports**: 
   - Daily/Weekly/Monthly sales
   - Product-wise sales analysis
   - Customer purchase patterns

2. **Inventory Reports**:
   - Current stock levels
   - Low stock alerts
   - Stock valuation reports
   - Expiry date tracking

3. **Financial Reports**:
   - Revenue analysis
   - Tax calculations
   - Profit margins

4. **Customer Reports**:
   - Customer purchase history
   - Top customers by value
   - Customer contact information

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test                    # Run all tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage report
```

### Frontend Testing
```bash
cd frontend
npm test                   # Run component tests
npm run test:e2e          # Run end-to-end tests
```

### Manual Testing Checklist
- [ ] User authentication (login/logout)
- [ ] Stock CRUD operations
- [ ] Bill creation with stock deduction
- [ ] Customer and supplier management
- [ ] Dashboard data accuracy
- [ ] Responsive design on different devices
- [ ] Role-based access control

## 🔧 Development Scripts

### Backend Scripts
```bash
npm run dev          # Start development server with nodemon
npm start            # Start production server
npm test             # Run test suite
npm run seed         # Seed database with sample data
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### Frontend Scripts
```bash
npm run dev          # Start Vite development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## 🚀 Production Deployment

### Backend Deployment (Node.js/Express)
1. **Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=5000
   DB_HOST=your-production-db-host
   DB_NAME=your-production-database
   JWT_SECRET=your-very-secure-production-jwt-secret
   ```

2. **Database Setup**:
   - Create production database
   - Run migrations: `npm run seed`
   - Configure database connection

3. **Deploy Options**:
   - **Heroku**: `git push heroku main`
   - **AWS EC2**: Use PM2 for process management
   - **DigitalOcean**: Docker deployment
   - **Railway**: Connect GitHub repository

### Frontend Deployment (React/Vite)
1. **Build Application**:
   ```bash
   npm run build
   ```

2. **Update API Base URL**:
   - Configure production API endpoint in `src/utils/api.js`

3. **Deploy Options**:
   - **Vercel**: Connect GitHub repository
   - **Netlify**: Drag and drop `dist` folder
   - **AWS S3 + CloudFront**: Static hosting
   - **GitHub Pages**: For demo deployments

### Database Deployment
- **MySQL**: AWS RDS, DigitalOcean Managed Database
- **PostgreSQL**: Heroku Postgres, Supabase

## 🛡️ Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure, stateless authentication
- **Password Hashing**: bcryptjs with salt rounds
- **Role-based Access**: Admin vs Cashier permissions
- **Token Expiration**: Automatic logout after 24 hours

### Data Protection
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Sequelize ORM parameterized queries
- **XSS Protection**: Helmet.js security headers
- **CORS Configuration**: Restrict cross-origin requests
- **Rate Limiting**: Prevent brute force attacks

### Best Practices
- Environment variables for sensitive data
- Secure HTTP headers
- Input sanitization
- Error handling without information leakage

## 🔄 Data Flow Architecture

### Bill Creation Flow
1. **Frontend**: User selects items and quantities
2. **Validation**: Check stock availability
3. **Backend**: Create bill record
4. **Stock Update**: Automatically deduct quantities
5. **Response**: Return bill details with updated stock

### Authentication Flow
1. **Login**: User submits credentials
2. **Verification**: Check password hash
3. **Token Generation**: Create JWT with user info
4. **Frontend Storage**: Store token in memory
5. **API Requests**: Include token in headers

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### Development Setup
1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a feature branch: `git checkout -b feature/amazing-feature`
4. **Install** dependencies: `npm install` (both frontend and backend)
5. **Setup** local database and environment variables

### Code Standards
- **ESLint**: Follow the existing code style
- **Prettier**: Format code before committing
- **Commit Messages**: Use conventional commits format
- **Testing**: Add tests for new features

### Pull Request Process
1. **Update** documentation for any API changes
2. **Test** your changes thoroughly
3. **Run** linting and fix any issues
4. **Submit** PR with clear description
5. **Respond** to review feedback

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### MIT License Summary
- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use
- ❌ Liability
- ❌ Warranty

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/your-username/stock-maintenance-system/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/stock-maintenance-system/discussions)
- **Email**: your-email@example.com

## 🎯 Roadmap

### Version 2.0 (Planned Features)
- [ ] **Multi-store Support**: Manage multiple store locations
- [ ] **Barcode Scanning**: Mobile app for inventory management
- [ ] **Purchase Orders**: Supplier order management
- [ ] **Inventory Transfers**: Inter-store stock transfers
- [ ] **Advanced Reporting**: Custom report builder
- [ ] **API Rate Limiting**: Enhanced security
- [ ] **Real-time Notifications**: WebSocket integration
- [ ] **Mobile App**: React Native companion app

### Version 2.1 (Future Enhancements)
- [ ] **Multi-language Support**: i18n implementation
- [ ] **Dark Mode**: UI theme options
- [ ] **Export/Import**: Excel/CSV data operations
- [ ] **Audit Logs**: Comprehensive activity tracking
- [ ] **Backup/Restore**: Database backup functionality

---

**Built with ❤️ by the development team**

**Happy Coding! 🎉**