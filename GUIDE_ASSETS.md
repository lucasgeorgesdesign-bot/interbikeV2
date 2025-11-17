# 📦 Guide : Ajouter le Modèle 3D et les Calques UV

## 🎯 Vue d'ensemble

Pour que le configurateur fonctionne avec votre modèle 3D, vous devez ajouter :
1. **Le modèle GLB** (fichier 3D)
2. **Les calques UV** (images de superposition pour chaque partie)

---

## 📁 Structure des fichiers

```
public/assets/
├── models/
│   └── nebula.glb          ← Votre modèle 3D (remplacer le placeholder)
└── uv_overlays/
    ├── nebula_front.png    ← Calque UV pour le torse
    ├── nebula_back.png     ← Calque UV pour le dos
    ├── nebula_sleeve_left.png   ← Calque UV pour le bras gauche
    └── nebula_sleeve_right.png   ← Calque UV pour le bras droit
```

---

## 🔧 Étape 1 : Préparer le Modèle 3D

### Format requis
- **Format** : `.glb` (glTF Binary)
- **Taille recommandée** : < 10MB pour de bonnes performances

### Nommage des meshes

Votre modèle GLB doit avoir des **meshes nommés** selon ces conventions :

| Nom du Mesh | Zone correspondante |
|------------|---------------------|
| `front` | Torse (face avant) |
| `back` | Dos (face arrière) |
| `sleeve_left` | Bras gauche |
| `sleeve_right` | Bras droit |
| `collar` | Col (optionnel) |

### Comment nommer les meshes dans Blender

1. Ouvrez votre modèle dans Blender
2. Sélectionnez chaque mesh
3. Dans le panneau de propriétés (N), renommez-le dans le champ "Name"
4. Exportez en glTF :
   - File → Export → glTF 2.0
   - Format : **glTF Binary (.glb)**
   - Cocher "Selected Objects" si nécessaire

### Exemple avec Blender

```
1. Sélectionner le mesh du torse
2. Renommer en "front"
3. Sélectionner le mesh du dos
4. Renommer en "back"
5. Répéter pour sleeve_left, sleeve_right
6. Exporter tout en .glb
```

---

## 🎨 Étape 2 : Créer les Calques UV

### Qu'est-ce qu'un calque UV ?

Un calque UV est une **image 2D** qui correspond exactement aux coordonnées UV de votre modèle 3D. Elle sert de "template" pour appliquer les couleurs, logos et textes.

### Format requis
- **Format** : `.png` (avec transparence si nécessaire)
- **Taille recommandée** : 1024x1024 ou 2048x2048 pixels
- **Couleur de fond** : Transparent ou blanc

### Comment créer les calques UV

#### Méthode 1 : Export depuis Blender

1. Dans Blender, sélectionnez le mesh (ex: `front`)
2. Passez en mode **UV Editing**
3. Sélectionnez toutes les faces (A)
4. File → Export → UV Layout
5. Choisissez :
   - **Size** : 1024 ou 2048
   - **Fill Opacity** : 0 (pour transparence)
   - **Show Edges** : Activé (pour voir les contours)
6. Sauvegardez comme `nebula_front.png`

#### Méthode 2 : Depuis votre logiciel 3D

- **Maya** : UV Snapshot
- **3ds Max** : Render UV Template
- **Substance Painter** : Export UV Template

### Structure des fichiers UV

Pour le modèle `nebula`, créez ces fichiers :

```
public/assets/uv_overlays/
├── nebula_front.png          ← UV du torse
├── nebula_back.png           ← UV du dos
├── nebula_sleeve_left.png    ← UV du bras gauche
└── nebula_sleeve_right.png   ← UV du bras droit
```

**Important** : Le nom doit suivre le pattern `${modelId}_${partId}.png`

---

## 📤 Étape 3 : Ajouter les fichiers au projet

### Option A : Via l'explorateur de fichiers

1. Ouvrez le dossier du projet : `interbike-config-v2`
2. Naviguez vers `public/assets/models/`
3. **Remplacez** `nebula.glb` (placeholder) par votre vrai fichier GLB
4. Naviguez vers `public/assets/uv_overlays/`
5. **Remplacez** les fichiers placeholder par vos vrais calques UV

### Option B : Via Git (recommandé)

```bash
# 1. Copier votre modèle GLB
cp /chemin/vers/votre/modele.glb public/assets/models/nebula.glb

# 2. Copier vos calques UV
cp /chemin/vers/uv_front.png public/assets/uv_overlays/nebula_front.png
cp /chemin/vers/uv_back.png public/assets/uv_overlays/nebula_back.png
cp /chemin/vers/uv_sleeve_left.png public/assets/uv_overlays/nebula_sleeve_left.png
cp /chemin/vers/uv_sleeve_right.png public/assets/uv_overlays/nebula_sleeve_right.png

# 3. Commit et push
git add public/assets/
git commit -m "Ajout modèle 3D et calques UV"
git push
```

---

## ✅ Étape 4 : Vérifier que tout fonctionne

1. **Lancez le serveur de développement** :
   ```bash
   npm run dev
   ```

2. **Ouvrez** : `http://localhost:5173/configurator?model=nebula`

3. **Vérifiez** :
   - Le modèle 3D se charge sans erreur
   - Les zones (Torse, Dos, Bras) sont visibles
   - Les couleurs s'appliquent correctement

4. **Si erreur** :
   - Ouvrez la console (F12)
   - Vérifiez les messages d'erreur
   - Vérifiez que les noms des meshes sont corrects

---

## 🔍 Dépannage

### Le modèle ne se charge pas

**Problème** : Erreur 404 dans la console
- ✅ Vérifiez que `public/assets/models/nebula.glb` existe
- ✅ Vérifiez que le fichier n'est pas corrompu
- ✅ Vérifiez la taille du fichier (< 50MB recommandé)

**Problème** : Le modèle charge mais rien ne s'affiche
- ✅ Vérifiez que les meshes sont nommés correctement (`front`, `back`, etc.)
- ✅ Vérifiez la console pour les erreurs de chargement
- ✅ Vérifiez que le modèle est centré à l'origine (0,0,0)

### Les textures ne s'appliquent pas

**Problème** : Les couleurs ne s'affichent pas
- ✅ Vérifiez que les calques UV existent
- ✅ Vérifiez les noms des fichiers UV (doivent correspondre aux partIds)
- ✅ Vérifiez la console pour les erreurs de composition

### Les zones ne correspondent pas

**Problème** : La couleur s'applique sur la mauvaise zone
- ✅ Vérifiez que les noms des meshes sont exacts (`front`, `back`, etc.)
- ✅ Vérifiez que le calque UV correspond au bon mesh

---

## 📝 Exemple complet

### Fichiers à ajouter pour le modèle "nebula"

```
public/assets/
├── models/
│   └── nebula.glb                    (votre modèle 3D)
└── uv_overlays/
    ├── nebula_front.png              (UV du torse)
    ├── nebula_back.png               (UV du dos)
    ├── nebula_sleeve_left.png        (UV du bras gauche)
    └── nebula_sleeve_right.png       (UV du bras droit)
```

### Structure des meshes dans le GLB

```
nebula.glb
├── Scene (root)
    ├── front (Mesh)          ← Torse
    ├── back (Mesh)           ← Dos
    ├── sleeve_left (Mesh)    ← Bras gauche
    └── sleeve_right (Mesh)   ← Bras droit
```

---

## 🚀 Pour un nouveau modèle

Si vous voulez ajouter un **nouveau modèle** (ex: `classic`) :

1. **Ajoutez le GLB** : `public/assets/models/classic.glb`
2. **Ajoutez les UV** :
   - `public/assets/uv_overlays/classic_front.png`
   - `public/assets/uv_overlays/classic_back.png`
   - etc.
3. **Utilisez** : `http://localhost:5173/configurator?model=classic`

Le système détectera automatiquement le nouveau modèle !

---

## 💡 Conseils

- **Optimisez vos modèles** : Utilisez des outils comme `gltf-pipeline` pour compresser
- **UV propres** : Assurez-vous que vos UVs n'ont pas de chevauchements
- **Taille des textures** : 1024x1024 est suffisant pour la plupart des cas
- **Testez localement** : Vérifiez tout avant de déployer

---

**Besoin d'aide ?** Consultez le `README.md` ou ouvrez une issue sur GitHub.

