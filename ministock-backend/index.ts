import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import productRoutes from './routes/productRoutes';
import requestRoutes from './routes/requestRoutes';
import userRoutes from './routes/userRoutes';
import logRoutes from './routes/logRoutes';
import uploadRoutes from './routes/uploadRoutes';
import { bootstrapData } from './lib/bootstrap';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());


app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/requests', requestRoutes);
app.use('/logs', logRoutes);
app.use('/upload', uploadRoutes);

app.use('/uploads', express.static('uploads'));

app.get('/', (req: any, res: any) => {
    res.send('Mini Stock API is running');
});

bootstrapData()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Failed to bootstrap data', error);
        process.exit(1);
    });
