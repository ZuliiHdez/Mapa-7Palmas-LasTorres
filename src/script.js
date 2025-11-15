import * as THREE from "three";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let scene, renderer, camera, camcontrols;
let mapa, mapsx, mapsy;
let interactiveObjects = [];
let nodeMap = {};
const scale = 15;

const minlon = -15.5193,
  maxlon = -15.40601;
const minlat = 28.06569,
  maxlat = 28.13308;

const PALETTE_SPECIFIC = {
  "Edificios residenciales/apartamentos": 0xff8000,
  Casas: 0xff0000,
  "Edificios comerciales": 0xffd700,
  "Edificios oficinas": 0x1e90ff,
  Escuelas: 0x8a2be2,
  Estadios: 0x006400,
  Iglesias: 0xff1493,
  Otros: 0xaaaaaa,
  Carreteras: 0x333333,
  Aparcamientos: 0x1e88e5,
  "Paradas de bus/taxi": 0xffff00,
  Farmacias: 0x00ff00,
  "Restaurantes/Cafés": 0x8b4513,
  "Bancos/Cajeros": 0x008080,
  Tiendas: 0xff4500,
};

const LEGEND_SPECIFIC = {};
for (const key in PALETTE_SPECIFIC) {
  LEGEND_SPECIFIC[key] = { label: key, color: PALETTE_SPECIFIC[key] };
}

let currentCameraType = "trackball";
let trackballControls, orbitControls;

init();
animationLoop();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    20,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 10);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const dir = new THREE.DirectionalLight(0xffffff, 0.6);
  dir.position.set(10, 20, 10);
  scene.add(dir);

  trackballControls = new TrackballControls(camera, renderer.domElement);
  orbitControls = new OrbitControls(camera, renderer.domElement);

  orbitControls.enableDamping = true;
  orbitControls.dampingFactor = 0.05;
  orbitControls.screenSpacePanning = false;
  orbitControls.minDistance = 1;
  orbitControls.maxDistance = 500;
  orbitControls.maxPolarAngle = Math.PI;

  orbitControls.enabled = false;

  camcontrols = trackballControls;

  new THREE.TextureLoader().load("src/map.png", (texture) => {
    const aspect = texture.image.width / texture.image.height;
    mapsy = scale;
    mapsx = mapsy * aspect;
    Plano(0, 0, 0, mapsx, mapsy);
    mapa.material.map = texture;
    mapa.material.needsUpdate = true;

    crearLeyenda();
    CargaOSM();
  });

  window.addEventListener("resize", onWindowResize);

  window.addEventListener("keydown", onKeyDown);
}

function onKeyDown(event) {
  if (event.key === "v" || event.key === "V") {
    switchCamera();
  }
}

function switchCamera() {
  if (currentCameraType === "trackball") {
    currentCameraType = "orbit";
    trackballControls.enabled = false;
    orbitControls.enabled = true;
    camcontrols = orbitControls;

    orbitControls.object.position.copy(camera.position);
    orbitControls.target.copy(trackballControls.target);

    console.log("Cambiado a cámara Orbit");
  } else {
    currentCameraType = "trackball";
    orbitControls.enabled = false;
    trackballControls.enabled = true;
    camcontrols = trackballControls;

    console.log("Cambiado a cámara Trackball");
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  if (trackballControls && trackballControls.handleResize)
    trackballControls.handleResize();
  if (orbitControls && orbitControls.handleResize) orbitControls.update();
}

function crearLeyenda() {
  const leyenda = document.createElement("div");
  Object.assign(leyenda.style, {
    position: "absolute",
    top: "10px",
    left: "10px",
    background: "rgba(255,255,255,0.92)",
    padding: "12px",
    borderRadius: "8px",
    fontFamily: "Arial,sans-serif",
    fontSize: "13px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
    maxWidth: "260px",
    zIndex: "1000",
  });

  const title = document.createElement("div");
  title.style.fontWeight = "700";
  title.style.marginBottom = "8px";
  title.innerText = "Leyenda";
  leyenda.appendChild(title);

  const elementosRectangulo = [
    "Edificios residenciales/apartamentos",
    "Casas",
    "Edificios comerciales",
    "Edificios oficinas",
    "Escuelas",
    "Estadios",
    "Iglesias",
    "Otros",
  ];

  const elementosLinea = ["Carreteras", "Aparcamientos"];

  for (const key in LEGEND_SPECIFIC) {
    const entry = document.createElement("div");
    Object.assign(entry.style, {
      display: "flex",
      alignItems: "center",
      marginBottom: "6px",
    });

    const colorBox = document.createElement("div");
    const colorHex = `#${LEGEND_SPECIFIC[key].color
      .toString(16)
      .padStart(6, "0")}`;

    if (elementosRectangulo.includes(key)) {
      Object.assign(colorBox.style, {
        width: "16px",
        height: "12px",
        background: colorHex,
        marginRight: "8px",
        border: "1px solid #666",
      });
    } else if (elementosLinea.includes(key)) {
      Object.assign(colorBox.style, {
        width: "18px",
        height: "2px",
        background: colorHex,
        marginRight: "8px",
      });
    } else {
      Object.assign(colorBox.style, {
        width: "12px",
        height: "12px",
        background: colorHex,
        borderRadius: "50%",
        marginRight: "8px",
      });
    }

    entry.appendChild(colorBox);
    const label = document.createElement("div");
    label.innerText = LEGEND_SPECIFIC[key].label;
    entry.appendChild(label);
    leyenda.appendChild(entry);
  }

  const cameraInfo = document.createElement("div");
  cameraInfo.style.marginTop = "10px";
  cameraInfo.style.paddingTop = "10px";
  cameraInfo.style.borderTop = "1px solid #ccc";
  cameraInfo.style.fontSize = "11px";
  cameraInfo.style.color = "#666";
  cameraInfo.innerHTML = "Presiona 'V' para cambiar cámara";
  leyenda.appendChild(cameraInfo);

  document.body.appendChild(leyenda);
}

function CargaOSM() {
  new THREE.FileLoader().load("src/map7Palmas_LasTorres.osm", (text) => {
    const xmlDoc = new DOMParser().parseFromString(text, "application/xml");

    const nodes = xmlDoc.getElementsByTagName("node");
    nodeMap = {};
    for (let n of nodes) {
      const id = n.getAttribute("id");
      const lat = parseFloat(n.getAttribute("lat"));
      const lon = parseFloat(n.getAttribute("lon"));
      const tags = {};
      for (let t of n.getElementsByTagName("tag"))
        tags[t.getAttribute("k")] = t.getAttribute("v");
      nodeMap[id] = { lat, lon, tags };
    }

    ProcesarNodosImportantes();

    const waysElems = xmlDoc.getElementsByTagName("way");
    for (let w of waysElems) ProcesarWay(w);

    console.log(
      `OSM cargado. nodos: ${Object.keys(nodeMap).length}, ways procesados: ${
        waysElems.length
      }`
    );
  });
}

function ProcesarNodosImportantes() {
  for (const id in nodeMap) {
    const n = nodeMap[id];
    const mlon = Map2Range(n.lon, minlon, maxlon, -mapsx / 2, mapsx / 2);
    const mlat = Map2Range(n.lat, minlat, maxlat, -mapsy / 2, mapsy / 2);
    const tags = n.tags;

    if (!tags || Object.keys(tags).length === 0) continue;

    let categorySpecific = null;

    if (
      tags.highway === "bus_stop" ||
      tags.public_transport === "platform" ||
      tags.bus === "yes" ||
      tags.public_transport === "stop_position"
    ) {
      categorySpecific = "Paradas de bus/taxi";
    } else if (tags.amenity === "pharmacy" || tags.healthcare === "pharmacy") {
      categorySpecific = "Farmacias";
    } else if (tags.amenity === "restaurant" || tags.amenity === "cafe") {
      categorySpecific = "Restaurantes/Cafés";
    } else if (tags.amenity === "bank" || tags.amenity === "atm") {
      categorySpecific = "Bancos/Cajeros";
    } else if (tags.shop) {
      categorySpecific = "Tiendas";
    }

    if (categorySpecific) {
      const color =
        PALETTE_SPECIFIC[categorySpecific] || PALETTE_SPECIFIC.Otros;
      const radio = 0.02;
      const s = Esfera(mlon, mlat, 0, radio, 8, 8, color);
      s.userData = { category: categorySpecific, tags, id: id };
      interactiveObjects.push(s);

      console.log(`Nodo ${id} categorizado como: ${categorySpecific}`, tags);
    }
  }
}

function ProcesarWay(wayElem) {
  const nds = Array.from(wayElem.getElementsByTagName("nd"))
    .map((n) => nodeMap[n.getAttribute("ref")])
    .filter(Boolean);
  if (!nds.length) return;
  const points = nds.map(
    (n) =>
      new THREE.Vector3(
        Map2Range(n.lon, minlon, maxlon, -mapsx / 2, mapsx / 2),
        Map2Range(n.lat, minlat, maxlat, -mapsy / 2, mapsy / 2),
        0
      )
  );
  const tagMap = {};
  for (let t of wayElem.getElementsByTagName("tag"))
    tagMap[t.getAttribute("k")] = t.getAttribute("v");

  if (tagMap.building && tagMap.building !== "yes") {
    ProcesarEdificio(points, tagMap);
    return;
  }

  if (tagMap.highway) {
    const mat = new THREE.LineBasicMaterial({
      color: PALETTE_SPECIFIC.Carreteras,
    });
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      mat
    );
    line.userData = { category: "Carreteras", tags: tagMap };
    scene.add(line);
    interactiveObjects.push(line);
    return;
  }

  if (tagMap.amenity === "parking" || tagMap.service === "parking_aisle") {
    const mat = new THREE.LineBasicMaterial({
      color: PALETTE_SPECIFIC.Aparcamientos,
    });
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      mat
    );
    line.userData = { category: "Aparcamientos", tags: tagMap };
    scene.add(line);
    interactiveObjects.push(line);
    return;
  }

  if (points.length > 1) {
    const mat = new THREE.LineBasicMaterial({
      color: PALETTE_SPECIFIC.Otros,
      linewidth: 1,
      transparent: true,
      opacity: 0.5,
    });
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      mat
    );
    line.userData = { category: "Otros", tags: tagMap };
    scene.add(line);
    interactiveObjects.push(line);
  }
}

function ProcesarEdificio(points, tags) {
  if (points.length < 3) return;
  if (!points[0].equals(points[points.length - 1]))
    points.push(points[0].clone());
  const shape = new THREE.Shape(points.map((p) => new THREE.Vector2(p.x, p.y)));

  let categorySpecific = "Otros";
  if (tags.building === "residential" || tags.building === "apartments")
    categorySpecific = "Edificios residenciales/apartamentos";
  else if (tags.building === "house" || tags.building === "detached")
    categorySpecific = "Casas";
  else if (tags.building === "commercial" || tags.shop)
    categorySpecific = "Edificios comerciales";
  else if (tags.building === "office") categorySpecific = "Edificios oficinas";
  else if (tags.building === "school") categorySpecific = "Escuelas";
  else if (tags.building === "stadium") categorySpecific = "Estadios";
  else if (tags.building === "church" || tags.amenity === "place_of_worship")
    categorySpecific = "Iglesias";

  const color = PALETTE_SPECIFIC[categorySpecific];
  const geometry = new THREE.ExtrudeGeometry(shape, {
    steps: 1,
    depth: 0.02,
    bevelThickness: 0,
    bevelSize: 0,
  });
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshLambertMaterial({ color })
  );
  mesh.position.z = 0.002;
  mesh.userData = { category: categorySpecific, tags };
  scene.add(mesh);
  interactiveObjects.push(mesh);
}

function Map2Range(val, vmin, vmax, dmin, dmax) {
  const t = (val - vmin) / (vmax - vmin);
  return dmin + t * (dmax - dmin);
}

function Plano(px, py, pz, sx, sy) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(sx, sy),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  mesh.position.set(px, py, pz);
  scene.add(mesh);
  mapa = mesh;
}

function Esfera(px, py, pz, radio, nx, ny, col) {
  const geometry = new THREE.SphereGeometry(radio, nx, ny);
  const material = new THREE.MeshLambertMaterial({ color: col || 0xffffff });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(px, py, pz);
  scene.add(mesh);
  return mesh;
}

function animationLoop() {
  requestAnimationFrame(animationLoop);
  if (camcontrols) camcontrols.update();
  if (currentCameraType === "orbit") {
    orbitControls.update();
  }

  renderer.render(scene, camera);
}
