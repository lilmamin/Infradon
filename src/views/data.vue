<script lang="ts">
import PouchDB from 'pouchdb';

export default {
  data() {
    return {
      datas: [],
      databaseReference: null,
    };
  },
  methods: {
    initDatabase() {
      // lancer une initialisation de la base de données
      // Si la connexion est ok, alors je fais un fetchdata
      const db = new PouchDB('mon_url/ma_collection');
      if (db) {
        console.log("valid");
        return;
      }
      console.log("invalid");
    },

    fetchData() {
      // récupérer tous les documents de ma collection
    },
  },
  mounted() {
    this.initDatabase();
  }
}
</script>

<template>
  <h1>InfraDon2</h1>
  <p>Counter: {{ datas }}</p>
</template>
