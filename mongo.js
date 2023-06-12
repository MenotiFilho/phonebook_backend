const mongoose = require('mongoose');

if (process.argv.length < 3) {
	console.log('give password as argument');
	process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://menotimfilho:${password}@clusterlista.7u18oph.mongodb.net/phonebook?retryWrites=true&w=majority`;

mongoose.set('strictQuery', false);
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

const personSchema = new mongoose.Schema({
	name: String,
	phone: String,
});

const Person = mongoose.model('Person', personSchema);

if (process.argv.length === 3) {
	Person.find({})
		.then((persons) => {
			console.log('phonebook:');
			persons.forEach((person) => {
				console.log(`${person.name} ${person.phone}`);
			});
			mongoose.connection.close();
		})
		.catch((error) => {
			console.error('Error listing phonebook entries:', error);
			mongoose.connection.close();
		});
} else if (process.argv.length === 5) {
	const name = process.argv[3];
	const phone = process.argv[4];

	const person = new Person({
		name: name,
		phone: phone,
	});

	person
		.save()
		.then(() => {
			console.log(`added ${name} number ${phone} to phonebook`);
			mongoose.connection.close();
		})
		.catch((error) => {
			console.error('Error adding a new entry to the phonebook:', error);
			mongoose.connection.close();
		});
} else {
	console.log('Usage: node mongo.js <password> [<name> <phone>]');
	mongoose.connection.close();
}
