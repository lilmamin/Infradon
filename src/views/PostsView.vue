<template>
  <div>
    <h1>Gestion des Posts</h1>

    <!-- Barre de recherche des posts par catégorie -->
    <input v-model="searchQuery" @input="searchPosts" placeholder="Recherche" />

    <!-- Formulaire pour ajouter ou modifier un post -->
    <form @submit.prevent="selectedPost ? updatePost(selectedPost) : createNewPost($event)">
      <label for="post_name">Titre du post : </label>
      <input v-model="currentPostName" type="text" id="post_name" placeholder="Entrez le titre du post" />

      <label for="category">Catégorie : </label>
      <input v-model="currentPostCategory" type="text" id="category" placeholder="Entrez la catégorie" />

      <label for="post_content">Contenu du post : </label>
      <textarea v-model="currentPostContent" id="post_content" placeholder="Entrez le contenu du post"></textarea>

      <label for="photo">Télécharger une photo :</label>
      <input type="file" id="photo" @change="handleFileUpload" />

      <button type="submit">
        {{ selectedPost ? 'Modifier le post' : 'Ajouter un nouveau post' }}
      </button>
      <button type="button" v-if="selectedPost" @click="cancelEdit">Annuler</button>
    </form>

    <!-- Ajouter un document essai -->
    <button id="addFakePost" @click="addFakePost">Ajouter un document essai</button>

    <!-- Liste des posts existants -->
    <h2>Liste des posts</h2>
    <ul>
      <li v-for="post in postsData" :key="post._id">
        <div class="post">
          <h3>{{ post.doc ? (post.doc as PostDocument).attributes.title : post.attributes.title }}</h3>
          <p>{{ post.doc ? (post.doc as PostDocument).attributes.content : post.attributes.content }}</p>
          <p>Catégorie: {{ post.doc ? (post.doc as PostDocument).attributes.category : post.attributes.category }}</p>
          <p v-if="post.doc && (post.doc as PostDocument).attributes.photo">
            <img :src="(post.doc as PostDocument).attributes.photo" alt="Image du post" width="100" />
          </p>
          <p>
            <button id="modify" @click="selectPost(post)">Modifier</button>
            <button @click="deletePost(post)">Supprimer</button>
          </p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import PouchDB from 'pouchdb'
import find from 'pouchdb-find'

PouchDB.plugin(find)

interface PostDocument {
  _id: string
  _rev?: string
  attributes: {
    title: string
    content: string
    category: string
    photo?: string | null
  }
}

export default defineComponent({
  data() {
    return {
      remoteDb: new PouchDB('http://admin:admin@localhost:5984/posts'),
      localDb: new PouchDB('local_posts'),
      postsData: [] as any[],
      newPost: {
        post_name: '',
        post_content: '',
        category: '',
        photo: null as File | null
      },
      currentPostName: '', // Titre du post
      currentPostCategory: '', // Catégorie du post
      currentPostContent: '', // Contenu du post
      selectedPost: null as PostDocument | null, // Post sélectionné pour modification
      searchQuery: '' // Terme de recherche
    }
  },
  mounted() {
    this.setupReplication()
    this.fetchData()
  },
  methods: {
    // Synchroniser les bases de données locale et distante
    async setupReplication() {
      PouchDB.sync(this.localDb, this.remoteDb, { live: true, retry: true })
        .on('change', (info) => console.log('Sync change:', info))
        .on('paused', (err) => console.log('Sync paused:', err))
        .on('error', (err) => console.error('Sync error:', err))

      this.localDb
        .changes({ since: 'now', live: true, include_docs: true })
        .on('change', () => {
          this.fetchData()
        })
    },

    // Récupérer les données depuis la base de données locale
    async fetchData() {
      try {
        const result = await this.localDb.allDocs<PostDocument>({ include_docs: true })
        this.postsData = result.rows.map((row) => row.doc)
      } catch (error) {
        console.error('Erreur lors de la récupération des documents:', error)
      }
    },

    // Ajouter un post fictif
    async addFakePost() {
      const fakePost = {
        _id: new Date().toISOString(),
        attributes: {
          title: 'Titre fictif',
          content: 'Contenu fictif',
          category: 'général'
        }
      }
      try {
        await this.localDb.put(fakePost)
        this.fetchData()
      } catch (error) {
        console.error("Erreur lors de l'ajout du document:", error)
      }
    },

    // Ajouter un nouveau post
    async createNewPost(event: Event) {
  event.preventDefault()

  // Vérifier si tous les champs sont remplis
  if (!this.currentPostName || !this.currentPostContent || !this.currentPostCategory || !this.newPost.photo) {
    alert('Tous les champs doivent être remplis !')
    return
  }

  const newPost = {
    _id: new Date().toISOString(),
    attributes: {
      title: this.currentPostName,
      content: this.currentPostContent,
      category: this.currentPostCategory,
      photo: this.newPost.photo.name 
    }
  }

  try {
    const result = await this.localDb.put(newPost)
    if (this.newPost.photo) {
      await this.localDb.putAttachment(
        result.id,
        'photo',
        result.rev,
        this.newPost.photo,
        this.newPost.photo.type
      )
    }
    this.fetchData()
    this.resetForm()
  } catch (error) {
    console.error('Erreur lors de l\'ajout du post:', error)
  }
},

    // Modifier un post
    async updatePost(post: PostDocument) {
      try {
        const doc = await this.localDb.get(post._id)
        doc.attributes.title = this.newPost.post_name //????? what does that meaanannn
        doc.attributes.content = this.newPost.post_content
        doc.attributes.category = this.newPost.category
        await this.localDb.put(doc)
        this.fetchData()
      } catch (error) {
        console.error('Erreur lors de la modification du post:', error)
      }
    },

    // Supprimer un post
    async deletePost(post: PostDocument) {
      try {
        const doc = await this.localDb.get(post._id)
        await this.localDb.remove(doc)
        this.fetchData()
      } catch (error) {
        console.error('Erreur lors de la suppression du post:', error)
      }
    },

    // Rechercher des posts par titre
    async searchPosts() {
      try {
        const result = await this.localDb.find({
          selector: {
            'attributes.name': { $regex: new RegExp(this.searchQuery, 'i') }
          }
        })
        this.postsData = result.docs
      } catch (error) {
        console.error('Erreur lors de la recherche:', error)
      }
    },

    // Sélectionner un post pour modification
    selectPost(post: PostDocument) {
      this.selectedPost = { ...post }
      this.newPost = {
        post_name: post.attributes.title,
        post_content: post.attributes.content,
        category: post.attributes.category,
        photo: null
      }
    },

    // Annuler la modification du post
    cancelEdit() {
      this.selectedPost = null
      this.resetForm()
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

    // Gérer l'upload de la photo
    handleFileUpload(event: Event) {
      const fileInput = event.target as HTMLInputElement
      if (fileInput?.files) {
        this.newPost.photo = fileInput.files[0]
      }
    }
  }
})
</script>

<style scoped>

input[type="text"], input[type="file"], textarea {
  margin-bottom: 15px;
}

form {
  margin-top: 20px;
}

form label {
  display: block;
  margin-bottom: 5px;
}

form input,
form textarea,
form button {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

form textarea {
  min-height: 100px;
  resize: vertical;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #dd8fd3;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}

button:hover {
  background-color: #000000;
}

#addFakePost {
  background-color: #458d48;
}

#modify {
  background-color: rgb(4, 93, 93);
}


.post {
  border: 1px solid #ccc;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
  background-color: #f9f9f9;
}

ul {
  list-style-type: none;
  padding-left: 0;
}

li {
  padding-left: 0;
}
</style>
