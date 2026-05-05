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
// allow larger JSON payloads (e.g. base64 images) for admin uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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