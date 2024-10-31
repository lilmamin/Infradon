initDatabase() {
    const db = new PouchDB('http://admin:admin@localhost:5984/post');
    if (db) {
      console.log("Connected to collection 'post'");
    } else {
      console.warn("Something went wrong");
    }
    this.storage = db;
  }