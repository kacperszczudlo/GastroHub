import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes.js';
import menuRoutes from './modules/menu/menu.routes.js';
import reservationRoutes from './modules/reservation/reservation.routes.js';
import tableRoutes from './modules/table/table.routes.js';  
import orderRoutes from './modules/order/order.routes.js';
import scheduleRoutes from './modules/schedule/schedule.routes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/schedules', scheduleRoutes);

//TODO: Połączenie z MongoDB


// Endpoint testowy
app.get('/', (req, res) => {
    res.send('GastroHub API is running');
});

export default app;