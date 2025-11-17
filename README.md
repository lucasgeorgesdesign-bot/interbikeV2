# Interbike Configurator V2

Configurateur 3D industriel de maillots de vélo avec React + Vite + Three.js vanilla + Fabric.js + Redux Toolkit.

## 🚀 Démarrage rapide

### Installation

```bash
npm install
```

### Développement local

```bash
npm run dev
```

Ouvrez votre navigateur à : **http://localhost:5173/configurator?model=nebula**

### Build pour production

```bash
npm run build
```

### Prévisualisation du build

```bash
npm run preview
```

---

## 📁 Structure du projet

```
src/
  api/
    upload.js              # Client API upload
  assets/                  # Assets statiques (non versionnés)
    models/*.glb
    uv_overlays/<modelId>_<partId>.png
    logos_catalog/*.svg
    fonts/*.woff2
  store/
    store.js               # Configuration Redux + Persist
    configuratorSlice.js   # Slice Redux avec state shape complet
  three/
    SceneManager.js        # Gestion scène Three.js
    ModelLoader.js         # Chargement GLB + mapping parts
    TextureCache.js        # Cache textures pour performance
    applyConfigToScene.js  # Application config → textures
    OffscreenComposer.js   # Composition textures offscreen (Fabric.js)
  ui/
    Sidebar.jsx            # Sidebar principale
    Controls/
      DesignTab.jsx        # Onglet Design (presets)
      ColorsTab.jsx        # Onglet Couleur (par zone UV)
      NumbersTab.jsx       # Onglet Numéro
      NameTab.jsx          # Onglet Nom/Texte
      LogosTab.jsx         # Onglet Logo (par zone)
    Modals/
      AddNumberModal.jsx   # Modal ajout numéro (4 positions)
    LogosBrowser.jsx       # Catalogue logos
  utils/
    imageResize.js         # Redimensionnement images
    createImageBitmapFromBlob.js  # Utilitaire ImageBitmap
  pages/
    ConfiguratorPage.jsx   # Page principale

server/
  api/upload/index.js      # Vercel Function (upload)
```

---

## 🎯 Fonctionnalités

### ✅ MVP (Implémenté)

1. **Chargement de modèles GLB**
   - Parse `?model=nebula` depuis URL
   - Charge `/assets/models/${modelId}.glb`
   - Mapping automatique des meshes par nom → partId

2. **Configuration par zones UV**
   - Zones : front, back, sleeve_left, sleeve_right, collar
   - Chaque zone peut avoir : couleur, logo, texte, numéro
   - UV overlays : `/assets/uv_overlays/${modelId}_${partId}.png`

3. **Onglets Sidebar**
   - **Design** : Aperçu + presets de modèles
   - **Couleur** : Sélecteur par zone avec presets
   - **Numéro** : Modal avec 4 positions standard (Dos, Face, Bras droit, Bras gauche)
   - **Nom** : Texte personnalisé (poitrine/dos) avec options police/taille/couleur/contour
   - **Logo** : Upload ou catalogue par zone (Torse/Dos/Bras)

4. **Composition textures offscreen**
   - Fabric.js pour composition
   - Base couleur → UV overlay → Logo → Texte/Numéro
   - Power-of-two sizes (1024x1024 par défaut)
   - createImageBitmap pour upload GPU rapide

5. **Redux + Persist**
   - State shape complet (parts, meta, sceneVersion)
   - Persistance locale (sans imageUrl temporaires)
   - Debounce composition (200ms)

6. **Performance**
   - TextureCache pour réutilisation
   - Dispose automatique des ressources
   - Pixel ratio limité à 2
   - RAF pause quand idle

7. **Upload API (mock)**
   - Vercel Function `/api/upload`
   - Validation taille/type
   - Mock pour MVP (remplacer par S3/Vercel Blob en prod)

---

## 🔧 Configuration

### Variables d'environnement

Créez `.env.local` :

```env
# Vercel Blob (optionnel pour MVP)
BLOB_READ_WRITE_TOKEN=your_token_here

# S3 (optionnel pour production)
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
AWS_BUCKET=your-bucket
```

### Assets requis

#### Modèles 3D
Placez vos fichiers GLB dans `public/assets/models/` :
- `nebula.glb` (exemple)
- Les meshes doivent être nommés : `front`, `back`, `sleeve_left`, `sleeve_right`, `collar`

#### UV Overlays
Placez les images UV dans `public/assets/uv_overlays/` :
- Format : `${modelId}_${partId}.png`
- Exemple : `nebula_front.png`, `nebula_back.png`

#### Logos Catalogue
Placez les logos dans `public/assets/logos_catalog/` :
- Format SVG recommandé
- Prévisualisations PNG optionnelles

#### Fonts
Placez les fonts dans `public/assets/fonts/` :
- Format WOFF2 recommandé
- Définir dans `OffscreenComposer.js` si custom

---

## 🚢 Déploiement Vercel

### 1. Préparer le projet

```bash
npm run build
```

### 2. Déployer sur Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

### 3. Configuration Vercel

Dans le dashboard Vercel :

1. **Variables d'environnement** (si S3/Vercel Blob) :
   - `BLOB_READ_WRITE_TOKEN` (pour Vercel Blob)
   - Ou credentials AWS pour S3

2. **Serverless Functions** :
   - `server/api/upload/index.js` sera automatiquement détecté
   - Route : `/api/upload`

### 4. Mettre à jour l'upload API

Remplacez le mock dans `server/api/upload/index.js` :

```javascript
// Exemple avec Vercel Blob
import { put } from '@vercel/blob'

export default async function handler(req, res) {
  const formData = await req.formData()
  const file = formData.get('file')
  
  // Upload to Vercel Blob
  const blob = await put(file.name, file, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })
  
  return res.json({ url: blob.url })
}
```

---

## 🧪 Tests

### Tests manuels

1. **Chargement modèle**
   - Ouvrir `/configurator?model=nebula`
   - Vérifier que le modèle se charge sans erreur

2. **Couleurs**
   - Onglet Couleur → Changer couleur zone
   - Vérifier mise à jour instantanée sur 3D

3. **Logos**
   - Onglet Logo → Upload image
   - Vérifier application sur zone choisie

4. **Numéros**
   - Onglet Numéro → Ajouter numéro
   - Sélectionner position → Configurer → Ajouter
   - Vérifier affichage sur modèle

5. **Texte**
   - Onglet Nom → Ajouter texte
   - Configurer police/taille/couleur
   - Vérifier application

### Tests performance

- **Memory leak** : Ouvrir DevTools → Memory → Prendre snapshot → Répéter actions → Comparer
- **Safari iOS** : Tester sur device réel pour vérifier compatibilité
- **Large images** : Upload image 5MB+ → Vérifier resize automatique

---

## 📊 Architecture Redux

### State Shape

```javascript
{
  modelId: string | null,
  selectedPartId: string | null,
  parts: {
    [partId]: {
      color?: string,              // Hex color
      textureUrl?: string,          // CDN URL (persistent)
      imageUrl?: string,           // Object URL (temporary)
      logoId?: string,             // Logo catalog ID
      text?: {                     // Custom text
        value: string,
        fontFamily: string,
        fontSize: number,
        color: string,
        stroke?: { color, width },
        xPercent: number,
        yPercent: number,
      },
      number?: {                   // Number
        value: string,
        fontFamily: string,
        size: number,
        color: string,
        positionKey: 'dos' | 'face' | 'bra_d' | 'bra_g',
      },
      repeat?: [number, number],   // Texture repeat
      offset?: [number, number],   // Texture offset
    }
  },
  meta: {
    lastSavedAt: number | null,
    previewDataUrl: string | null,
  },
  sceneVersion: number,            // Incremented on changes
}
```

### Actions

- `setModel({ modelId, partIds })`
- `setPartColor({ partId, color })`
- `setPartLogo({ partId, logoId, imageUrl })`
- `setPartText({ partId, text })`
- `setPartNumber({ partId, number })`
- `setPartTextureUrl({ partId, textureUrl })`
- `setPartImageUrl({ partId, imageUrl })`
- `updateMeta({ lastSavedAt, previewDataUrl })`

---

## 🔒 Sécurité

### Upload

- ✅ Validation taille (max 10MB)
- ✅ Validation MIME type (png/jpeg/svg)
- ✅ Sanitization SVG (strip scripts)
- ⚠️ Rate limiting (à implémenter en production)

### CORS

- Configuré dans Vercel Function
- Restreindre aux domaines autorisés en production

---

## 🐛 Dépannage

### Le modèle ne se charge pas

- Vérifier que `public/assets/models/${modelId}.glb` existe
- Vérifier console pour erreurs de chargement
- Vérifier que les meshes ont les bons noms

### Les textures ne s'appliquent pas

- Vérifier Redux DevTools : `sceneVersion` s'incrémente ?
- Vérifier console pour erreurs de composition
- Vérifier que les UV overlays existent (optionnel)

### Upload échoue

- Vérifier taille fichier (< 10MB)
- Vérifier type MIME
- Vérifier console pour erreurs réseau

### Performance lente

- Vérifier TextureCache (réutilise textures ?)
- Vérifier debounce (200ms)
- Vérifier pixel ratio (max 2)
- Profiler avec Chrome DevTools

---

## 📝 Prochaines étapes (Advanced)

- [ ] Upload réel vers S3/Vercel Blob
- [ ] Partage de configurations (tokens)
- [ ] Export haute résolution (PNG)
- [ ] Admin panel pour logos catalogue
- [ ] Support KTX2/Draco compression
- [ ] Decals système
- [ ] Animations transitions
- [ ] Multi-modèles simultanés

---

## 📄 Licence

Propriétaire - Tous droits réservés

---

## 👥 Support

Pour toute question ou problème, ouvrir une issue sur le repository.

---

**Version :** 2.0.0  
**Dernière mise à jour :** 2025-11-17
