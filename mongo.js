/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');
require('dotenv').config();

const connectToDatabase = () => {
  const url = `mongodb+srv://menotimfilho:${process.env.MONGODB_PASSWORD}@clusterlista.7u18oph.mongodb.net/phonebook?retryWrites=true&w=majority`;

  return mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

const personSchema = new mongoose.Schema({
  name: String,
  phone: String,
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Person = mongoose.model('Person', personSchema);

const getAllPersons = () => Person.find({});

const addPerson = (name, phone) => {
  const person = new Person({
    name,
    phone,
  });

  return person.save();
};

const deletePerson = (id) => Person.findByIdAndDelete(id);

module.exports = {
  connectToDatabase,
  getAllPersons,
  addPerson,
  deletePerson,
  Person,
};
