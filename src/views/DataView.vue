<script lang="ts">
import PouchDB from 'pouchdb';

// Déclaration d'un type pour les documents (remplace avec le bon type si nécessaire)
interface Post {
  _id: string;
  _rev: string;
  type: string;
  post_name: string;
  post_content: string;
  attributes: {
    creation_date: string;
    modified: boolean;
    category: string;
    photo: string | null;
  };
}

type PouchDatabase = PouchDB.Database;

export default {
  data() {
    return {
      datas: [] as Post[], // Déclare que datas est un tableau de Post
      databaseReference: null as PouchDatabase | null, // Type pour la base de données
    };
  },
  methods: {
    // Initialisation de la base de données
    initDatabase() {
      const db = new PouchDB('http://127.0.0.1:5984/ma_collection');
      if (db) {
        this.databaseReference = db;
        console.log("Base de données initialisée avec succès.");
        this.fetchData();
      } else {
        console.log("Erreur lors de l'initialisation de la base de données.");
      }
    },

    // Récupérer les données de la base
    async fetchData() {
      const db = this.databaseReference;
      if (!db) {
        console.error("Base de données non initialisée.");
        return;
      }

      try {
        const result = await db.allDocs({ include_docs: true });
        console.log('Données récupérées:', result.rows);
        this.datas = result.rows.map(row => row.doc as Post); // Assurer que les docs sont du type Post
      } catch (e) {
        console.error('Erreur lors de la récupération des données:', e);
      }
    },
  },
  mounted() {
    this.initDatabase();
  }
}
</script>

<template>
  <div>
    <h1>InfraDon2</h1>
    <p v-if="datas.length === 0">Aucune donnée disponible.</p>
    <div v-for="(data, index) in datas" :key="index">
      <p>{{ data.post_name }}</p>
      <p>{{ data.post_content }}</p>
      <!-- Ajouter d'autres champs si nécessaire -->
    </div>
  </div>
</template>
