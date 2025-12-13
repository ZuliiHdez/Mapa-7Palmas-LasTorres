# 🗺️ Visualizador 3D de Mapas OSM con Three.js

## Introducción
Esta aplicación interactiva en 3D permite visualizar datos de **OpenStreetMap (OSM)** utilizando **Three.js**. Representa edificios, carreteras, puntos de interés y transporte público en un entorno tridimensional, permitiendo una exploración inmersiva de la zona de **Siete Palmas** y **Las Torres** en **Las Palmas**.

El sistema categoriza automáticamente los elementos del mapa (residenciales, comerciales, escuelas, farmacias, etc.) y los representa con colores y formas diferenciadas para facilitar su identificación.

---

## 🎯 Características Principales

### 🏗️ Visualización de Edificios
| Tipo de edificio | Color |
|-----------------|-------|
| Residenciales y apartamentos | 🟠 Naranja |
| Casas | 🔴 Rojo |
| Comerciales | 🟡 Oro |
| Oficinas | 🔵 Azul |
| Escuelas | 🟣 Violeta |
| Iglesias | 🎀 Rosa |
| Estadios | 🟢 Verde oscuro |

### 🛣️ Infraestructura y Transporte
| Elemento | Representación |
|----------|----------------|
| Carreteras | Líneas grises |
| Aparcamientos | Líneas azules |
| Paradas de bus/taxi | Esferas amarillas |

### 🏥 Puntos de Interés
| Tipo | Representación |
|------|----------------|
| Farmacias | Esferas verdes |
| Restaurantes y cafés | Esferas marrones |
| Bancos y cajeros | Esferas verde azulado |
| Tiendas | Esferas naranja rojizo |

---

## 🎮 Sistema de Cámaras

### 🔄 Vista Trackball (Por defecto)
- Rotación libre en 3D
- Zoom ilimitado
- Controles:
  - 🖱️ Botón izquierdo: Rotar vista
  - 🖱️ Rueda: Zoom
  - 🖱️ Botón derecho: Desplazar

### 🛰️ Vista Orbital
- Movimiento orbital restringido
- Comportamiento similar a aplicaciones CAD/GIS
- Controles:
  - 🖱️ Botón izquierdo: Orbitar
  - 🖱️ Rueda: Acercar/alejar

### 🔁 Cambio entre Cámaras
Presiona **V** para alternar instantáneamente entre los dos modos de cámara, manteniendo la posición y orientación actual.

---

## 📊 Leyenda Interactiva
Incluye representación visual para:
- Rectángulos → edificios y estructuras
- Líneas → carreteras y aparcamientos
- Círculos → puntos de interés
- Información sobre los controles de cámara

---

## 🗺️ Procesamiento de Datos OSM
- **Nodos**: Puntos de interés individuales
- **Ways**: Edificios y líneas (carreteras, aparcamientos)

---

## 🔗 Enlace CodeSandbox
[Ir a CodeSandbox](https://codesandbox.io/p/sandbox/ig2526-s8-forked-tk5grt)

