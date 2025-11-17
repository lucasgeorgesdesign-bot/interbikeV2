# 📋 Notice : Système de Matériaux Multiples

## 🎯 Architecture

Le configurateur utilise un système basé sur les **matériaux** plutôt que sur les meshes individuels. Cela permet de gérer des modèles 3D avec un seul mesh mais plusieurs matériaux (multi-material).

## 🔧 Fonctionnement

### Structure du Modèle GLB

Votre modèle `jersey_mx.glb` contient :
- **1 mesh** : `Cloth` (le maillot complet)
- **Plusieurs matériaux** : `front`, `back`, `sleeve_left`, `sleeve_right`, `col`

Chaque matériau correspond à une zone du maillot :
- `front` → Torse/poitrine
- `back` → Dos
- `sleeve_left` → Bras gauche
- `sleeve_right` → Bras droit

### Mapping Matériau → PartId

Le système mappe automatiquement les noms de matériaux aux `partId` via le fichier de configuration :

```json
{
  "zones": [
    {
      "partId": "front",
      "meshName": "front"  ← Nom du MATÉRIAU (pas du mesh)
    }
  ]
}
```

**Important** : Le champ `meshName` dans le JSON correspond en réalité au **nom du matériau**, pas au nom du mesh.

### Stockage dans le PartMap

Le `partMap` stocke des références de matériaux :

```javascript
{
  "front": {
    mesh: THREE.Mesh,        // Le mesh "Cloth"
    material: THREE.Material, // Le matériau "front"
    materialIndex: 0,        // Index du matériau dans le mesh
    materialName: "front"    // Nom du matériau
  }
}
```

## 🎨 Application des Textures

Quand une texture est composée pour un `partId` :
1. Le système trouve la référence matériau correspondante
2. La texture est appliquée directement au matériau spécifique
3. Les autres matériaux du mesh ne sont pas affectés

## 🖱️ Raycasting et Clics

Quand l'utilisateur clique sur le modèle :
1. Le raycasting détecte l'intersection avec le mesh
2. `intersection.face.materialIndex` indique quel matériau a été cliqué
3. Le système trouve le `partId` correspondant au matériau
4. Les coordonnées UV sont récupérées et converties en pourcentages

## 📝 Configuration

### Fichier JSON Config

Le fichier `jersey_mx.config.json` doit utiliser les **noms de matériaux** :

```json
{
  "zones": [
    {
      "partId": "front",
      "label": "Torse",
      "meshName": "front"  ← Doit correspondre au nom du matériau dans Blender
    }
  ]
}
```

### Dans Blender

Pour que le système fonctionne :
1. Nommez vos matériaux : `front`, `back`, `sleeve_left`, `sleeve_right`
2. Assignez chaque matériau aux faces correspondantes du mesh
3. Exportez en GLB

## 🔍 Debugging

### Vérifier les Matériaux

Dans la console du navigateur, vous verrez :
```
📋 All materials in GLB: ["front", "back", "sleeve_left", "sleeve_right"]
✅ Mapped material "front" -> partId "front"
```

### Problèmes Courants

**Problème** : "Expected materials not found in GLB"
- **Solution** : Vérifiez que les noms de matériaux dans Blender correspondent à ceux du JSON config

**Problème** : "Cannot determine partId from clicked material"
- **Solution** : Vérifiez que le matériau a bien un nom et que le mapping est correct

## 🚀 Avantages

1. **Flexibilité** : Un seul mesh peut avoir plusieurs zones configurables
2. **Performance** : Moins de meshes = meilleures performances
3. **Simplicité** : Mapping direct matériau → zone
4. **Compatibilité** : Fonctionne avec les modèles multi-matériaux standards

## 📚 Références

- [Three.js Multi-Material](https://threejs.org/docs/#api/en/objects/Mesh.material)
- [GLTF Material Specification](https://www.khronos.org/gltf/)

