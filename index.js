const e = require('express');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());
app.use(
	morgan('tiny', {
		skip: (req) => req.method === 'POST',
	})
);

app.use((req, res, next) => {
	if (req.method === 'POST') {
		morgan(
			':method :url :status :res[content-length] - :response-time ms :post-data'
		)(req, res, next);
	} else {
		next();
	}
});

morgan.token('post-data', (req) => {
	return JSON.stringify(req.body);
});

let persons = [
	{
		id: 1,
		name: 'Arto Hellas',
		number: '040-123456',
	},
	{
		id: 2,
		name: 'Ada Lovelace',
		number: '39-44-5323523',
	},
	{
		id: 3,
		name: 'Dan Abramov',
		number: '12-43-234345',
	},
	{
		id: 4,
		name: 'Mary Poppendieck',
		number: '39-23-6423122',
	},
];

function generateId() {
	const min = 1;
	const max = 1000000;
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

app.get('/', (req, res) => {
	res.send('<h1>Hello World!</h1>');
});

app.get('/api/persons', (req, res) => {
	res.json(persons);
});

app.get('/api/persons/:id', (request, response) => {
	const id = Number(request.params.id);
	const person = persons.find((person) => person.id === id);

	if (person) {
		response.json(person);
	} else {
		response.status(404).end();
	}
});

app.delete('/api/persons/:id', (request, response) => {
	const id = Number(request.params.id);
	persons = persons.filter((person) => person.id !== id);

	response.status(204).end();
});

app.get('/info', (req, res) => {
	const personCount = persons.length;
	const date = new Date().toString();
	const info = `Phonebook has info for ${personCount} people<br><br> ${date}`;
	res.send(info);
});

app.post('/api/persons', (request, response) => {
	const body = request.body;

	let existingPerson = persons.find((person) => person.name === body.name);

	if (!body.name || !body.number) {
		return response.status(400).json({
			error: 'Name or number is missing',
		});
	} else if (existingPerson) {
		return response.status(409).json({
			error: 'name must be unique',
		});
	}

	const person = {
		id: generateId(),
		name: body.name,
		number: body.number,
	};

	persons = persons.concat(person);

	response.json(person);
});

const PORT = 3001;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
