/* initDatabase() {
    const db = new PouchDB('http://admin:admin@localhost:5984/post');
    if (db) {
      console.log("Connected to collection 'post'");
    } else {
      console.warn("Something went wrong");
    }
    this.storage = db;
  } */

  import PouchDB from 'pouchdb';

  // Crée une instance locale et une instance distante
const dbLocal = new PouchDB('ma_base_locale');
const dbRemote = new PouchDB('http://admin:admin@localhost:5984/post');

// Réplication de la base locale vers la base distante
dbLocal.replicate.to(dbRemote).then(() => {
  console.log("Réplication locale -> distante réussie");
}).catch((error) => {
  console.error("Erreur de réplication :", error);
});

// Réplication de la base distante vers la base locale
dbLocal.replicate.from(dbRemote).then(() => {
  console.log("Réplication distante -> locale réussie");
}).catch((error) => {
  console.error("Erreur de réplication :", error);
});

function initDatabase() {
  if (dbRemote) {
    console.log("Connected to collection 'post'");
  } else {
    console.warn("Something went wrong");
  }
  this.storage = dbRemote;
}

export default initDatabase;