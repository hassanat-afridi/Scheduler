# 📅 Employee Scheduler

A robust, modern employee scheduling application built with Node.js, Express, and React. Perfect for managers and HR professionals who need to efficiently manage employee schedules, track shifts, and maintain workforce organization.

## ✨ Features

### 🎯 Core Functionality
- **Employee Management**: Add, edit, and manage employee information
- **Schedule Creation**: Create detailed schedules with time slots and roles
- **Conflict Detection**: Automatic detection of scheduling conflicts
- **Status Management**: Track schedule status (pending, confirmed, cancelled)
- **Role-based Scheduling**: Assign specific roles to each shift

### 📊 Dashboard & Analytics
- **Real-time Statistics**: View total employees, schedules, and pending items
- **Role Distribution**: See how many employees are in each role
- **Today's Overview**: Quick view of today's scheduled shifts
- **System Status**: Monitor application health

### 🔍 Advanced Features
- **Smart Filtering**: Filter schedules by date, employee, and status
- **Search Functionality**: Find schedules by employee name or role
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Real-time Updates**: Instant feedback when creating or modifying schedules

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Scheduler
   ```

2. **Install server dependencies**
   ```bash
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Start the backend server**
   ```bash
   npm run dev
   ```
   The API will be available at `http://localhost:4000`

5. **Start the frontend application**
   ```bash
   cd client
   npm run dev
   ```
   The application will open at `http://localhost:5173`

## 🏗️ Architecture

### Backend (Node.js + Express)
- **RESTful API**: Clean, intuitive endpoints for all operations
- **Data Validation**: Comprehensive input validation and error handling
- **Conflict Detection**: Smart algorithms to prevent double-booking
- **In-memory Storage**: Fast, efficient data storage (easily replaceable with database)

### Frontend (React + Vite)
- **Component-based Architecture**: Modular, maintainable code structure
- **Modern UI/UX**: Beautiful, intuitive interface with smooth animations
- **Responsive Design**: Optimized for all device sizes
- **Real-time Updates**: Instant feedback and data synchronization

## 📡 API Endpoints

### Employees
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Schedules
- `GET /api/schedules` - Get all schedules (with filtering)
- `POST /api/schedules` - Create new schedule
- `PUT /api/schedules/:id` - Update schedule
- `DELETE /api/schedules/:id` - Delete schedule

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics
- `GET /api/health` - Health check endpoint

## 🎨 UI Components

### Dashboard
- Statistics cards with color-coded themes
- Role distribution overview
- Quick action buttons
- System status indicators

### Employee Management
- Employee cards with avatar and details
- Add/Edit forms with validation
- Role selection dropdown
- Email and contact information

### Schedule Management
- Calendar-style date grouping
- Time slot management
- Status updates with visual indicators
- Conflict warnings and resolution

### Create Schedule
- Multi-step form with validation
- Employee and role selection
- Time picker with 30-minute intervals
- Real-time conflict detection
- Schedule preview

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
PORT=4000
NODE_ENV=development
```

### Customization
- **Roles**: Modify the roles array in `client/src/components/Employees.jsx`
- **Time Intervals**: Adjust time picker intervals in `client/src/components/CreateSchedule.jsx`
- **Colors**: Update CSS variables in `client/src/App.css`
- **Validation Rules**: Modify validation logic in the components

## 📱 Responsive Design

The application is fully responsive and works on:
- **Desktop**: Full-featured interface with sidebar navigation
- **Tablet**: Optimized layout for medium screens
- **Mobile**: Touch-friendly interface with collapsible sidebar

## 🚀 Future Enhancements

### Planned Features
- **Database Integration**: MongoDB/PostgreSQL support
- **User Authentication**: Role-based access control
- **Notifications**: Email/SMS reminders for schedules
- **Reporting**: Advanced analytics and export functionality
- **Calendar Integration**: Sync with Google Calendar, Outlook
- **Mobile App**: Native iOS/Android applications

### Technical Improvements
- **Real-time Updates**: WebSocket integration for live updates
- **Offline Support**: Service worker for offline functionality
- **Performance**: Lazy loading and code splitting
- **Testing**: Comprehensive unit and integration tests

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill process using port 4000
   lsof -ti:4000 | xargs kill -9
   ```

2. **Dependencies Issues**
   ```bash
   # Clear npm cache
   npm cache clean --force
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **CORS Issues**
   - Ensure the backend is running on port 4000
   - Check that the frontend is making requests to the correct URL

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` in your environment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Icons**: [Lucide React](https://lucide.dev/) for beautiful, consistent icons
- **Date Handling**: [date-fns](https://date-fns.org/) for reliable date manipulation
- **Styling**: Modern CSS with Flexbox and Grid for responsive layouts

---

**Built with ❤️ for efficient workforce management** 
