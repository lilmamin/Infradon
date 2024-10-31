<script lang="ts">

import PouchDb from 'pouchdb';



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

      const db = new PouchDb("http://localhost:5984/post");

      if (db) {

        console.log("valid");

        return;



      }

      console.log("invalid");

    },



    fetchData() {
      db.allDocs([Option], [callback])

      // récupérer tous les documents de ma collection

    }



  },



  mounted() {

    this.initDatabase()

  }



}



console.log("Ok tr")

</script>



<template>

  <h1>InfraDon2</h1>

  <p>Counter: {{ datas }}</p>

  <button type="button" role="button">+1</button>

</template>