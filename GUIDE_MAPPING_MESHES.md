# 🔧 Guide : Mapper les Matériaux du GLB

> **Note** : Ce guide concerne les modèles avec plusieurs meshes. Si votre modèle utilise un seul mesh avec plusieurs matériaux, voir [NOTICE_MATERIALS.md](./NOTICE_MATERIALS.md).

## 🔧 Guide : Mapper les Meshes du GLB (Modèles Multi-Meshes)

## Problème identifié

Vos meshes dans le GLB s'appellent `Cloth_mesh_21`, `Cloth_mesh_9`, etc., mais le JSON config cherche `front`, `back`, `sleeve_left`, `sleeve_right`.

## Solution : Mettre à jour le JSON config

### Étape 1 : Identifier les meshes

1. Ouvrez la console du navigateur (F12)
2. Rechargez la page
3. Cherchez dans les logs : `📋 All mesh names in GLB:`
4. Notez tous les noms de meshes

### Étape 2 : Identifier quel mesh correspond à quelle zone

Vous devez identifier :
- Quel mesh = **front** (torse/poitrine)
- Quel mesh = **back** (dos)
- Quel mesh = **sleeve_left** (bras gauche)
- Quel mesh = **sleeve_right** (bras droit)

**Méthode 1 : Dans Blender**
1. Ouvrez votre GLB dans Blender
2. Sélectionnez chaque mesh
3. Regardez son nom dans l'outliner
4. Identifiez visuellement quelle partie du maillot c'est

**Méthode 2 : Par clic dans le configurateur**
1. Cliquez sur différentes parties du modèle 3D
2. Regardez dans la console : `📍 Clicked on Cloth_mesh_X`
3. Notez quel mesh correspond à quelle zone

### Étape 3 : Mettre à jour `jersey_mx.config.json`

Modifiez le fichier `public/assets/models/jersey_mx.config.json` :

```json
{
  "modelId": "jersey_mx",
  "name": "Jersey MX",
  "zones": [
    {
      "partId": "front",
      "label": "Torse",
      "type": "colorable",
      "canHaveLogo": true,
      "canHaveText": true,
      "meshName": "Cloth_mesh_21"  ← Remplacez par le vrai nom du mesh
    },
    {
      "partId": "back",
      "label": "Dos",
      "type": "colorable",
      "canHaveLogo": true,
      "canHaveText": true,
      "meshName": "Cloth_mesh_9"  ← Remplacez par le vrai nom du mesh
    },
    {
      "partId": "sleeve_left",
      "label": "Bras gauche",
      "type": "colorable",
      "canHaveLogo": true,
      "meshName": "Cloth_mesh_XX"  ← Remplacez par le vrai nom du mesh
    },
    {
      "partId": "sleeve_right",
      "label": "Bras droit",
      "type": "colorable",
      "canHaveLogo": true,
      "meshName": "Cloth_mesh_XX"  ← Remplacez par le vrai nom du mesh
    }
  ],
  "designs": [
    {
      "id": "camouflage",
      "name": "Camouflage",
      "baseTextures": {
        "front": "/assets/designs/camouflage/front_base.png"
      },
      "modifiableElements": []
    }
  ]
}
```

### Étape 4 : Vérifier

1. Rechargez la page
2. Dans la console, vous devriez voir :
   ```
   ✅ Mapped mesh "Cloth_mesh_21" -> partId "front"
   ✅ Mapped mesh "Cloth_mesh_9" -> partId "back"
   ```
3. Plus de warning "Mesh not found for partId: back"

## Alternative : Renommer les meshes dans Blender

Si vous préférez, vous pouvez renommer les meshes dans Blender :
1. Ouvrez le GLB dans Blender
2. Renommez les meshes :
   - `Cloth_mesh_21` → `front`
   - `Cloth_mesh_9` → `back`
   - etc.
3. Ré-exportez en GLB
4. Le JSON config fonctionnera avec les noms standards

## Exemple de mapping

D'après vos logs, vous avez cliqué sur :
- `Cloth_mesh_21` (probablement le front ou back)
- `Cloth_mesh_9` (probablement l'autre partie)

Pour identifier précisément :
1. Cliquez sur le **torse** du modèle → notez le mesh name
2. Cliquez sur le **dos** du modèle → notez le mesh name
3. Cliquez sur le **bras gauche** → notez le mesh name
4. Cliquez sur le **bras droit** → notez le mesh name

Puis mettez à jour le JSON avec ces noms.

