const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        mongoose.connect("mongodb+srv://trane2:Starawesome100@cluster0.qcqd2.mongodb.net/");
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('MongoDB Connection Failed:', error);
        process.exit(1);
    }
};

module.exports = connectDB;