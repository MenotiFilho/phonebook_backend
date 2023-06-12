/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
const express = require('express');

const app = express();
const cors = require('cors');
const morgan = require('morgan');
const {
  connectToDatabase,
  getAllPersons,
  addPerson,
  deletePerson,
  Person,
} = require('./mongo');
require('dotenv').config();

// Middleware
app.use(express.json());
app.use(express.static('dist'));
app.use(cors());
app.use(
  morgan('tiny', {
    skip: (req) => req.method === 'POST',
  }),
);

app.use((req, res, next) => {
  if (req.method === 'POST') {
    morgan(
      ':method :url :status :res[content-length] - :response-time ms :post-data',
    )(req, res, next);
  } else {
    next();
  }
});

morgan.token('post-data', (req) => JSON.stringify(req.body));

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  let statusCode = 500;
  let errorMessage = 'Internal Server Error';

  if (err.statusCode) {
    statusCode = err.statusCode;
    errorMessage = err.message;
  }

  res.status(statusCode).json({ error: errorMessage });
};

app.use(errorHandler);

// Routes
app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>');
});

app.get('/api/persons', (req, res, next) => {
  getAllPersons()
    .then((persons) => {
      res.json(persons);
    })
    .catch((error) => {
      next(error);
    });
});

app.get('/api/persons/:_id', (req, res, next) => {
  const id = req.params._id;

  Person.findById(id)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        const error = new Error('Person not found');
        error.statusCode = 404;
        throw error;
      }
    })
    .catch((error) => {
      next(error);
    });
});

app.delete('/api/persons/:_id', (req, res, next) => {
  const id = req.params._id;

  deletePerson(id)
    .then(() => {
      res.status(204).end();
    })
    .catch((error) => {
      next(error);
    });
});

app.get('/info', (req, res, next) => {
  Person.countDocuments()
    .then((count) => {
      const info = {
        totalPersons: count,
        timestamp: new Date(),
      };
      res.json(info);
    })
    .catch((error) => {
      next(error);
    });
});

app.put('/api/persons/:_id', (req, res, next) => {
  const id = req.params._id;
  const { phone } = req.body;

  Person.findByIdAndUpdate(id, { phone }, { new: true })
    .then((updatedPerson) => {
      if (updatedPerson) {
        res.json(updatedPerson);
      } else {
        const error = new Error('Person not found');
        error.statusCode = 404;
        throw error;
      }
    })
    .catch((error) => {
      next(error);
    });
});

app.post('/api/persons', (req, res, next) => {
  const { name, phone } = req.body;

  addPerson(name, phone)
    .then((person) => {
      res.json(person);
    })
    .catch((error) => {
      next(error);
    });
});

// Start the server
const PORT = process.env.PORT || 3001;

connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
  });
