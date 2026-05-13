import app from './app.js';
import { connectDB } from './database/connect.js';
import { seedDemoUsers } from './modules/auth/auth.service.js';
import { pruneReservations } from './modules/reservation/reservation.service.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        
        if (process.env.SEED_DEMO_USERS === 'true') {
            await seedDemoUsers();
            console.log('Demo users seeded');
        }

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            const MS_PER_DAY = 24 * 60 * 60 * 1000;
            setTimeout(() => {
                pruneReservations().then(res => console.log('[Prune] ', res.message)).catch(err => console.error('[Prune] error', err));
                setInterval(() => {
                    pruneReservations().then(res => console.log('[Prune] ', res.message)).catch(err => console.error('[Prune] error', err));
                }, MS_PER_DAY);
            }, 30000);
        });
    } catch (error) {
        console.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    }
};

startServer();