const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Basic health check
app.get('/', (req, res) => {
    res.send('Chaturanga Server is running');
});

// We can add game validation routes here later if needed

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
