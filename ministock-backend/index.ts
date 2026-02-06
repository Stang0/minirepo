import express from 'express';
import cors from 'cors';
import productRoutes from './routes/productRoutes';
import transactionRoutes from './routes/transactionRoutes';
import uploadRoutes from './routes/uploadRoutes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());


app.use('/products', productRoutes);
app.use('/transactions', transactionRoutes);
app.use('/upload', uploadRoutes);

app.use('/uploads', express.static('uploads'));

app.get('/', (req: any, res: any) => {
    res.send('API WORKING!!!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
