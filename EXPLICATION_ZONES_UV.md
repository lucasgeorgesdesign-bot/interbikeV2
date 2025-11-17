# 📐 Explication : Zones UV et Mapping

## ✅ Ce qui est déjà fait

### 1. Détection automatique des zones

Le système **détecte automatiquement** les zones UV en lisant les **noms des meshes** dans votre GLB :

```javascript
// Dans ModelLoader.js
scene.traverse((child) => {
  if (child.isMesh) {
    const partId = child.name  // ← Nom du mesh = zone ID
    partMap.set(partId, child) // ← Mapping automatique
  }
})
```

### 2. Configuration dans le JSON

Le fichier `jersey_mx.config.json` définit les zones **configurables** :

```json
{
  "zones": [
    {
      "partId": "front",        ← ID utilisé dans le code Redux
      "meshName": "front",      ← Nom du mesh dans le GLB (DOIT correspondre)
      "label": "Torse",         ← Label affiché dans l'UI
      "type": "colorable",      ← Type de zone
      "canHaveLogo": true,      ← Permissions
      "canHaveText": true
    }
  ]
}
```

**Le `meshName` fait le lien entre le mesh 3D et la zone configurable.**

---

## 🎯 Comment ça fonctionne

### Étape 1 : Chargement du modèle

1. Le GLB est chargé
2. Le système parcourt tous les meshes
3. Pour chaque mesh nommé (`front`, `back`, etc.), il crée une entrée dans `partMap`

### Étape 2 : Application des textures

1. Le système lit `jersey_mx.config.json`
2. Pour chaque zone dans le JSON, il cherche le mesh correspondant par `meshName`
3. Il applique la texture de base du design sur ce mesh

### Étape 3 : Modifications utilisateur

1. L'utilisateur change une couleur → Redux met à jour `parts[partId]`
2. Le système recompose la texture pour ce `partId`
3. Il applique la nouvelle texture sur le mesh correspondant

---

## 🔍 Vérifier vos zones UV

### Dans la console du navigateur

Quand vous chargez le modèle, vous devriez voir :

```
✅ Mesh détecté: "front" (front)
✅ Mesh détecté: "back" (back)
✅ Mesh détecté: "sleeve_left" (sleeve_left)
✅ Mesh détecté: "sleeve_right" (sleeve_right)
📦 Modèle chargé: 4 zones détectées: ["front", "back", "sleeve_left", "sleeve_right"]
```

### Si un mesh n'apparaît pas

**Problème** : Le mesh n'a pas de nom dans le GLB

**Solution** :
1. Ouvrez le GLB dans Blender
2. Sélectionnez le mesh
3. Renommez-le dans le panneau de propriétés (N)
4. Ré-exportez en GLB

---

## 📋 Checklist zones UV

### ✅ Votre modèle GLB

- [ ] Mesh torse nommé : `front`
- [ ] Mesh dos nommé : `back`
- [ ] Mesh bras gauche nommé : `sleeve_left`
- [ ] Mesh bras droit nommé : `sleeve_right`
- [ ] UVs unwrappés et propres

### ✅ Votre JSON config

- [ ] `meshName: "front"` correspond au mesh `front` dans le GLB
- [ ] Tous les meshes du GLB sont listés dans les zones
- [ ] Les `partId` sont cohérents (front, back, sleeve_left, sleeve_right)

### ✅ Vos textures

- [ ] `front_base.png` correspond aux UVs du mesh `front`
- [ ] Les textures sont à la bonne taille (1024x1024 ou 2048x2048)
- [ ] Les textures sont bien alignées avec les UVs

---

## 💡 Résumé

**Les zones UV sont automatiquement détectées** via les noms des meshes dans le GLB.

**Vous n'avez qu'à** :
1. Nommer vos meshes correctement dans Blender
2. Mettre à jour le JSON config avec les bons `meshName`
3. Créer les textures correspondantes

**Le système fait le reste automatiquement !**

