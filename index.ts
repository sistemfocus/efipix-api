import express from 'express';
import cors from 'cors';
import efiRouter from './api/efi';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/efi', efiRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});