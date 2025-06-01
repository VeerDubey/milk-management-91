
# Vikas Milk Centre Management System

A comprehensive milk distribution management system built with React, TypeScript, and modern web technologies. This application helps manage customers, suppliers, products, orders, payments, and delivery operations for a milk distribution business.

## 🚀 Features

### Core Features
- **Customer Management**: Add, edit, and track customer information with area-wise organization
- **Product Management**: Manage milk products, categories, and inventory
- **Order Management**: Create and track orders with delivery management
- **Payment Tracking**: Record and monitor customer payments and outstanding dues
- **Supplier Management**: Manage supplier information and purchase records
- **Invoice Generation**: Create professional invoices with customizable templates
- **Delivery Management**: Track delivery sheets and vehicle assignments

### Advanced Features
- **Role-Based Authentication**: Admin and employee roles with different permissions
- **Real-time Analytics**: Dashboard with charts and business insights
- **Export Functionality**: PDF and Excel export for reports
- **Notification System**: Alerts for pending orders, due payments, and low stock
- **Responsive Design**: Mobile-friendly interface
- **Data Validation**: Form validation to prevent invalid inputs
- **Offline Support**: Local storage for data persistence

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS, Custom Neo-Noir theme
- **UI Components**: Shadcn/ui, Radix UI
- **Charts**: Recharts
- **PDF Generation**: jsPDF
- **Excel Export**: XLSX
- **Form Validation**: React Hook Form, Zod
- **State Management**: React Context API
- **Build Tool**: Vite
- **Package Manager**: NPM

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- NPM

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd milk-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔐 Default Login Credentials

The application comes with pre-configured user accounts:

**Admin Account:**
- Email: `admin@vikasmilk.com`
- Password: `admin123`
- Role: Administrator (full access)

**Employee Account:**
- Email: `employee@vikasmilk.com`
- Password: `employee123`
- Role: Employee (limited access)

## 📊 Database Schema

The application uses browser localStorage for data persistence with the following structure:

### Users
- `id`: Unique identifier
- `name`: User's full name
- `email`: Login email
- `role`: 'admin' | 'employee'
- `passwordHash`: Encrypted password
- `isActive`: Account status

### Customers
- `id`: Unique identifier
- `name`: Customer name
- `phone`: Contact number (10 digits)
- `address`: Full address
- `area`: Area/locality
- `outstandingBalance`: Amount due
- `totalPaid`: Total amount paid
- `isActive`: Account status

### Products
- `id`: Unique identifier
- `name`: Product name
- `category`: Product category
- `unit`: Unit of measurement
- `price`: Current price
- `stock`: Available quantity

### Orders
- `id`: Unique identifier
- `customerId`: Reference to customer
- `vehicleId`: Assigned vehicle
- `salesmanId`: Assigned salesman
- `items`: Array of order items
- `total`: Total amount
- `status`: Order status
- `date`: Order date

### Payments
- `id`: Unique identifier
- `customerId`: Reference to customer
- `amount`: Payment amount
- `method`: Payment method
- `date`: Payment date
- `notes`: Additional notes

## 🎯 Usage Guide

### Getting Started
1. Log in using the default admin credentials
2. Navigate through the sidebar to access different modules
3. Start by adding customers and products
4. Create orders and track deliveries
5. Record payments and generate reports

### Customer Management
- **Add Customer**: Use the customer form with validation
- **Edit Customer**: Update customer information
- **View Details**: Check customer order history and payments
- **Area Management**: Organize customers by delivery areas

### Order Processing
1. **Create Order**: Select customer, add products, assign vehicle/salesman
2. **Track Order**: Monitor order status through delivery pipeline
3. **Generate Invoice**: Create professional invoices
4. **Update Status**: Mark orders as completed/delivered

### Payment Management
- **Record Payment**: Log customer payments with method
- **Track Outstanding**: Monitor pending dues
- **Payment History**: View complete payment records
- **Export Reports**: Generate payment reports

### Analytics & Reports
- **Dashboard**: View business metrics and charts
- **Export Data**: Generate PDF/Excel reports
- **Customer Analytics**: Track top customers and trends
- **Sales Reports**: Monitor revenue and order patterns

## 🔒 Security Features

- **Password Encryption**: Using bcryptjs for secure password hashing
- **Role-Based Access**: Different permissions for admin and employee
- **Input Validation**: Zod schemas prevent invalid data entry
- **XSS Protection**: Proper input sanitization
- **Data Validation**: Form validation on both client side

## 📱 Mobile Support

The application is fully responsive and supports:
- Touch-friendly interface
- Mobile-optimized navigation
- Responsive charts and tables
- Swipe gestures for mobile interactions

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deployment Options
- **Vercel**: Connect GitHub repository for automatic deployments
- **Netlify**: Drag and drop build folder or connect repository
- **GitHub Pages**: Use GitHub Actions for automated deployment
- **Self-hosted**: Deploy build folder to any web server

## 🔧 Configuration

### Environment Variables
The application uses localStorage for data persistence, so no database configuration is needed. For production deployment with a real database, you would need:

```env
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_jwt_secret_key
SMTP_HOST=your_email_smtp_host
SMTP_USER=your_email_username
SMTP_PASS=your_email_password
```

### Customization
- **Theme**: Modify `src/styles/neo-noir-theme.css` for custom styling
- **Logo**: Replace logo files in `public/` directory
- **Business Info**: Update company details in relevant components

## 📈 Future Enhancements

### Planned Features
- **Cloud Database**: PostgreSQL/MySQL integration
- **Real-time Sync**: Multi-device synchronization
- **SMS Notifications**: Automated customer alerts
- **GPS Tracking**: Real-time delivery tracking
- **Mobile App**: React Native mobile application
- **Barcode Scanning**: Product identification
- **Advanced Analytics**: Machine learning insights

### Cloud Migration
To move to cloud infrastructure:
1. Set up PostgreSQL database (Supabase recommended)
2. Implement API backend (Node.js/Express)
3. Add authentication service (Auth0/Supabase Auth)
4. Deploy to cloud platform (Vercel/AWS/DigitalOcean)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For technical support or questions:
- Email: support@vikasmilk.com
- Phone: +91-XXXXXXXXXX

## 🏢 About Vikas Milk Centre

Established in 1975, Vikas Milk Centre has been serving the community with fresh, quality milk and dairy products. This management system helps streamline operations and improve customer service.

---

**Built with ❤️ for the dairy industry**
