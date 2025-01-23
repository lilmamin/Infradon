<!-- <script lang="ts">
import { ref } from 'vue'
import PouchDB from 'pouchdb'

declare interface Post {
  _id: string
  _rev?: string
  doc: {
    post_name: string
    post_content: string
    attributes: {
      creation_date: string
      modified: string
      category: string
      photo: string | null
    }
  }
}

export default {
  data() {
    return {
      postsData: [] as Post[],
      storage: null as PouchDB.Database | null,
      newPost: {
        post_name: '',
        post_content: '',
        category: '',
        photo: null as File | null
      },
      selectedPost: null as Post | null // Pour la modification des posts
    }
  },


  computed: {
  // Champs dynamiques pour le formulaire
  currentPostName: {
    get() {
      return this.selectedPost ? this.selectedPost.doc.post_name : this.newPost.post_name;
    },
    set(value: string) {
      if (this.selectedPost) {
        this.selectedPost.doc.post_name = value;
      } else {
        this.newPost.post_name = value;
      }
    },
  },
  currentPostCategory: {
    get() {
      return this.selectedPost ? this.selectedPost.doc.attributes.category : this.newPost.category;
    },
    set(value: string) {
      if (this.selectedPost) {
        this.selectedPost.doc.attributes.category = value;
      } else {
        this.newPost.category = value;
      }
    },
  },
  currentPostContent: {
    get() {
      return this.selectedPost ? this.selectedPost.doc.post_content : this.newPost.post_content;
    },
    set(value: string) {
      if (this.selectedPost) {
        this.selectedPost.doc.post_content = value;
      } else {
        this.newPost.post_content = value;
      }
    },
  },
},

  
  mounted() {
    this.initDatabase()
    this.fetchData()
  },

  methods: {
    // Initialisation de la base de données
    initDatabase() {
      const db = new PouchDB('http://admin:admin@localhost:5984/posts')
      if (db) {
        console.log("Connected to collection 'posts'")
      } else {
        console.warn('Something went wrong')
      }
      this.storage = db
    },

    // Récupération des données de la base
    fetchData() {
      const db = this.storage
      if (!db) return console.error("Database not initialized")
      db.allDocs({ include_docs: true, attachments: true })
        .then((result: any) => {
          console.log('fetchData success', result)
          this.postsData = result.rows.map((row: any) => row.doc)
        })
        .catch((error: any) => {
          console.error('fetchData error', error)
        })
    },

    // Ajouter un nouveau post
    async createNewPost(event: Event) {
      event.preventDefault()
      const newPost: Post = {
        _id: new Date().toISOString(), // Utiliser une timestamp comme ID
        doc: {
          post_name: this.newPost.post_name,
          post_content: this.newPost.post_content,
          attributes: {
            creation_date: new Date().toISOString(),
            modified: 'no',
            category: this.newPost.category,
            photo: this.newPost.photo ? URL.createObjectURL(this.newPost.photo) : null
          }
        }
      }

      const db = this.storage
      if (!db) return console.error("Database not initialized")
      try {
        await db.put(newPost)
        console.log('Post ajouté avec succès')
        this.fetchData()
        this.resetForm()
      } catch (e) {
        console.error('Erreur lors de l\'ajout du post', e)
      }
    },

    // Modifier un post existant
    async updatePost(post: Post) {
      const db = this.storage
      if (!db) return console.error("Database not initialized")
      try {
        const existingDoc = await db.get(post._id)
        post._rev = existingDoc._rev
        await db.put(post)
        console.log('Post mis à jour avec succès')
        this.fetchData()
      } catch (e) {
        console.error('Erreur lors de la mise à jour', e)
      }
    },

    // Supprimer un post
    async deletePost(post: Post) {
      const db = this.storage
      if (!db) return console.error("Database not initialized")
      try {
        const existingDoc = await db.get(post._id)
        await db.remove(existingDoc._id, existingDoc._rev)
        console.log('Post supprimé avec succès')
        this.fetchData()
      } catch (e) {
        console.error('Erreur lors de la suppression', e)
      }
    },

    // Gérer l'upload de fichier
    handleFileUpload(event: Event) {
      const fileInput = event.target as HTMLInputElement
      if (fileInput?.files) {
        this.newPost.photo = fileInput.files[0]
      }
    },

    // Réinitialiser le formulaire
    resetForm() {
      this.newPost = {
        post_name: '',
        post_content: '',
        category: '',
        photo: null
      }
    },

    // Sélectionner un post pour modification
    selectPost(post: Post) {
      this.selectedPost = { ...post } // Crée une copie du post sélectionné
    },

    // Annuler la modification
    cancelEdit() {
      this.selectedPost = null
    }
  }
}
</script>

<template>
  <div>
    <h1>Gestion des Posts</h1>

    //Formulaire pour ajouter ou modifier un post
    <form @submit.prevent="selectedPost ? updatePost(selectedPost) : createNewPost">
  <label for="post_name">Titre du post :</label>
  <input v-model="currentPostName" type="text" id="post_name" placeholder="Entrez le titre du post" />

  <label for="category">Catégorie :</label>
  <input v-model="currentPostCategory" type="text" id="category" placeholder="Entrez la catégorie" />

  <label for="post_content">Contenu du post :</label>
  <textarea v-model="currentPostContent" id="post_content" placeholder="Entrez le contenu du post"></textarea>

  <label for="photo">Télécharger une photo :</label>
  <input type="file" id="photo" @change="handleFileUpload" />

  <button type="submit">
    {{ selectedPost ? 'Modifier le post' : 'Ajouter un nouveau post' }}
  </button>
  <button type="button" v-if="selectedPost" @click="cancelEdit">Annuler</button>
</form>


    <--Affichage des posts existants
    <h2>Liste des posts</h2>
    <ul>
      <li v-for="post in postsData" :key="post._id">
        <div class="post">
          <h3>{{ post.doc.post_name }}</h3>
          <p>{{ post.doc.post_content }}</p>
          <p>Catégorie: {{ post.doc.attributes.category }}</p>
          <p v-if="post.doc.attributes.photo">
            <img :src="post.doc.attributes.photo" alt="Image du post" width="100" />
          </p>
          <p>
            <button @click="selectPost(post)">Modifier</button>
            <button @click="deletePost(post)">Supprimer</button>
          </p>
        </div>
      </li>
    </ul>
  </div>
</template>


<style scoped>
.post {
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
}

button {
  margin-top: 10px;
  padding: 5px 10px;
}
</style>
 -->