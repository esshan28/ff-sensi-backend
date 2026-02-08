const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Database Connection (Make sure MongoDB Compass is running)
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Database Connected Successfully!"))
    .catch(err => console.log("DB Connection Error: ", err));

// Schema (Data Structure)
const PaymentSchema = new mongoose.Schema({
    name: String,
    utr: { type: String, unique: true },
    device: String,
    status: { type: String, default: 'pending' }
});

const Payment = mongoose.model('Payment', PaymentSchema);

// API 1: User Request bhejne ke liye
app.post('/api/request-access', async (req, res) => {
    try {
        const newReq = new Payment(req.body);
        await newReq.save();
        res.json({ success: true });
    } catch (err) { res.status(400).json({ success: false }); }
});

// API 2: Admin saari requests dekhega
app.get('/api/admin/requests', async (req, res) => {
    const requests = await Payment.find({ status: 'pending' });
    res.json(requests);
});

// API 3: Admin Approve karega
app.post('/api/admin/approve', async (req, res) => {
    await Payment.findOneAndUpdate({ utr: req.body.utr }, { status: 'approved' });
    res.json({ success: true });
});

// API 4: User ka status check karne ke liye
app.get('/api/check-status/:utr', async (req, res) => {
    const data = await Payment.findOne({ utr: req.params.utr });
    res.json({ status: data ? data.status : 'not_found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));