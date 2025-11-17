# 📐 Guide : Zones UV et Mapping des Meshes

## 🎯 Comment fonctionnent les zones UV

### Principe

Les **zones UV** sont définies par le **nom des meshes** dans votre fichier GLB. Le système mappe automatiquement chaque mesh à une zone configurable.

---

## 🔗 Mapping Mesh → Zone

### Dans votre modèle GLB

Votre fichier `jersey_mx.glb` doit avoir des **meshes nommés** :

```
jersey_mx.glb
├── Scene (root)
    ├── front (Mesh)          ← Nom du mesh = "front"
    ├── back (Mesh)           ← Nom du mesh = "back"
    ├── sleeve_left (Mesh)   ← Nom du mesh = "sleeve_left"
    └── sleeve_right (Mesh)   ← Nom du mesh = "sleeve_right"
```

### Dans le fichier JSON de configuration

Le fichier `jersey_mx.config.json` définit les zones et leur correspondance :

```json
{
  "zones": [
    {
      "partId": "front",        ← ID utilisé dans le code
      "label": "Torse",         ← Label affiché dans l'UI
      "meshName": "front"       ← Nom du mesh dans le GLB (DOIT correspondre)
    }
  ]
}
```

**Important** : Le `meshName` dans le JSON doit **exactement** correspondre au nom du mesh dans votre GLB.

---

## ✅ Vérification des zones

### Comment vérifier que vos meshes sont bien nommés

1. **Ouvrez votre GLB dans Blender** :
   - File → Import → glTF 2.0
   - Sélectionnez `jersey_mx.glb`
   - Vérifiez les noms dans l'outliner (liste des objets)

2. **Ou utilisez un viewer en ligne** :
   - https://gltf-viewer.donmccurdy.com/
   - Uploadez votre GLB
   - Vérifiez les noms des meshes dans l'inspecteur

3. **Dans la console du navigateur** :
   - Ouvrez F12 → Console
   - Le système log automatiquement les meshes trouvés
   - Cherchez : `partMap` ou les logs de chargement

---

## 🎨 Zones UV vs Textures de base

### Zones UV (optionnel - pour debug)

Les fichiers dans `uv_overlays/` sont **optionnels** et servent uniquement pour :
- Visualisation des UVs (debug)
- Aide au placement (si vous utilisez le mode debug)

**Ils ne sont PAS nécessaires** si vous utilisez des textures de base complètes.

### Textures de base (recommandé)

Les textures dans `designs/camouflage/` sont **complètes** :
- Elles contiennent déjà le design (camouflage)
- Elles sont appliquées directement sur le mesh
- Pas besoin de calques UV séparés

---

## 📋 Checklist : Vérifier vos zones

### ✅ Dans Blender

- [ ] Mesh du torse nommé : `front`
- [ ] Mesh du dos nommé : `back`
- [ ] Mesh du bras gauche nommé : `sleeve_left`
- [ ] Mesh du bras droit nommé : `sleeve_right`
- [ ] UVs unwrappés et propres (pas de chevauchements)

### ✅ Dans le JSON config

- [ ] `meshName: "front"` correspond au mesh `front` dans le GLB
- [ ] `meshName: "back"` correspond au mesh `back` dans le GLB
- [ ] Tous les meshes du GLB sont listés dans les zones

### ✅ Textures

- [ ] Texture `front_base.png` correspond aux UVs du mesh `front`
- [ ] Taille : 1024x1024 ou 2048x2048
- [ ] Format : PNG avec transparence si nécessaire

---

## 🔍 Dépannage

### Le modèle charge mais aucune texture ne s'affiche

**Vérifiez** :
1. Les noms des meshes dans le GLB correspondent aux `meshName` dans le JSON
2. La texture `front_base.png` existe et est accessible
3. Console du navigateur : cherchez les erreurs 404

### Certaines zones s'affichent, d'autres non

**Vérifiez** :
1. Tous les meshes sont nommés dans le GLB
2. Tous les meshes sont listés dans le JSON config
3. Les textures existent pour les zones concernées

### Le modèle ne charge pas du tout

**Vérifiez** :
1. Le fichier `jersey_mx.glb` existe dans `public/assets/models/`
2. Le fichier n'est pas corrompu
3. Console : erreurs de chargement GLB

---

## 💡 Exemple complet

### Structure GLB

```
jersey_mx.glb
└── Scene
    ├── front (Mesh)          ← UVs unwrappés, nom = "front"
    ├── back (Mesh)           ← UVs unwrappés, nom = "back"
    ├── sleeve_left (Mesh)    ← UVs unwrappés, nom = "sleeve_left"
    └── sleeve_right (Mesh)   ← UVs unwrappés, nom = "sleeve_right"
```

### Structure JSON

```json
{
  "zones": [
    { "partId": "front", "meshName": "front" },        ← ✅ Correspond
    { "partId": "back", "meshName": "back" },          ← ✅ Correspond
    { "partId": "sleeve_left", "meshName": "sleeve_left" },  ← ✅ Correspond
    { "partId": "sleeve_right", "meshName": "sleeve_right" } ← ✅ Correspond
  ]
}
```

### Structure Textures

```
designs/camouflage/
├── front_base.png          ← Appliquée sur mesh "front"
├── back_base.png           ← Appliquée sur mesh "back"
├── sleeve_left_base.png   ← Appliquée sur mesh "sleeve_left"
└── sleeve_right_base.png  ← Appliquée sur mesh "sleeve_right"
```

---

## 🎯 Résumé

1. **Les zones UV sont définies par les noms des meshes** dans le GLB
2. **Le JSON config** fait le lien entre `meshName` (GLB) et `partId` (code)
3. **Les textures de base** sont appliquées directement sur les meshes correspondants
4. **Pas besoin de calques UV séparés** si vous utilisez des textures complètes

**Le système charge automatiquement les meshes par leur nom et applique les textures correspondantes !**

