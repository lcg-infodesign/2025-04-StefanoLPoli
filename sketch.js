let table;
let volcanoes = [];
let elevations = [];
let hoveredVolcano = null;

let eruptionCodes = ["D", "D1", "D2", "D3", "D4", "D5", "D6", "D7", "P", "Q", "U", "U1", "U7", "Unknown", "?"];
let categories = ["Caldera", "Cone", "Crater System", "Maars / Tuff ring", "Other / Unknown", "Shield Volcano", "Stratovolcano", "Subglacial", "Submarine Volcano"];

let sectionHeight = 500;
let padding = 30;
let titleHeight = 80;

function preload() {
  table = loadTable("assets/vulcani.csv", "csv", "header");
}

function setup() {
  frameRate(30);
  createCanvas(windowWidth, sectionHeight * (categories.length) + titleHeight + padding * categories.length);
  
  if (!table) {
    console.error("Tabella non caricata!");
    return;
  }
  
  for (let r = 0; r < table.getRowCount(); r++) {

    //Se il vulcano non ha il numero compilato, salta questa riga
    let volcanoNo = table.getString(r, "Volcano Number");
    if (volcanoNo === '') continue;

    let latitude = table.getNum(r, "Latitude");
    let longitude = table.getNum(r, "Longitude");
    let name = table.getString(r, "Volcano Name");
    let location = table.getString(r, "Country");
    let elevation = table.getString(r, "Elevation (m)");
    let type = table.getString(r, "TypeCategory");
    let eruptionCode = table.getString(r, "Last Known Eruption"); 
    
    elevations.push(elevation);
    volcanoes.push({ 
      volcanoNo,
      latitude, 
      longitude, 
      name, 
      location, 
      elevation, 
      type,
      eruptionCode  
    });
  }
  
  console.log("Vulcani caricati:", volcanoes.length);
}

function draw() {
  
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(color("#005288ff"), color(0, 0, 0),  inter);
    stroke(c);
    line(0, y, width, y);
  }

  drawTitle();
  drawElevationLegend();
  drawEruptionLegend(); // Aggiungi la legenda delle eruzioni
  drawGrid();
  
  // Disegna il tooltip se c'è un vulcano sotto il mouse
  if (hoveredVolcano) {
    // Cambia il cursore in “mano” (interattivo)
    cursor("pointer");
    drawTooltip(hoveredVolcano);
  } else {
    // Torna al cursore normale
    cursor("default");
  }
}

function drawElevationLegend() {
  let legendX = 30;
  let legendY = 120;
  let legendWidth = 200;
  let legendHeight = 100;
  
  // Sfondo della legenda
  fill(0, 180);
  stroke(255, 150);
  strokeWeight(1);
  rect(legendX, legendY, legendWidth, legendHeight, 10);
  
  // Titolo della legenda
  fill(255);
  noStroke();
  textSize(14);
  textAlign(LEFT, TOP);
  text("Elevation (m)", legendX + 15, legendY + 10);
  
  // Disegna 5 triangoli di esempio con altezze progressive
  let minElevation = min(elevations);
  let maxElevation = max(elevations);
  let steps = 5;
  
  for (let i = 0; i < steps; i++) {
    let elevationValue = map(i, 0, steps - 1, minElevation, maxElevation);
    let heightValue = map(elevationValue, minElevation, maxElevation, 2, 50);
    let base = 20;
    
    let x = legendX + 30 + i * 35;
    let y = legendY + 70;
    
    // Triangolo con trasparenza
    fill(128, 150); // Giallo con trasparenza
    noStroke();
    
    triangle(
      x, y - heightValue,
      x - base / 2, y,
      x + base / 2, y
    );
    
    // Etichetta dell'elevazione
    if ((i === 0) || (i=== steps-1)) {
      fill(255, 200);
      textSize(10);
      textAlign(CENTER, TOP);
      text(int(elevationValue) + "m", x, y + 10);
    }
  }
}

function drawEruptionLegend() {
  let legendX = 30;
  let legendY = 240; 
  let legendWidth = 200;
  let legendHeight = 310; // Più alto per contenere tutti i codici
  
  // Sfondo della legenda
  fill(0, 180);
  stroke(255, 150);
  strokeWeight(1);
  rect(legendX, legendY, legendWidth, legendHeight, 10);
  
  // Titolo della legenda
  fill(255);
  noStroke();
  textSize(14);
  textAlign(LEFT, TOP);
  text("Last Eruption Code", legendX + 15, legendY + 10);
  
  // Disegna tutti i codici eruzione uno sotto l'altro
  let itemHeight = 18;
  let triangleSize = 12;
  
  for (let i = 0; i < eruptionCodes.length; i++) {
    let code = eruptionCodes[i];
    let y = legendY + 40 + i * itemHeight;
    
    // Disegna il triangolino colorato
    let eruptionColor = getColorFromEruptionCode(code);
    fill(eruptionColor);
    noStroke();
    
    triangle(
      legendX + 15, y - triangleSize/2,
      legendX + 15 - triangleSize/2, y + triangleSize/2,
      legendX + 15 + triangleSize/2, y + triangleSize/2
    );
    
    // Testo del codice
    fill(255);
    textSize(10);
    textAlign(LEFT, CENTER);
    text(code, legendX + 35, y);
  }
}

function drawGrid() {
  let rectWidth = width * 0.6;
  let rectX = (width - rectWidth) / 2;
  
  // Sposta tutto a destra per fare spazio alla legenda
  rectX = max(rectX, 250);
  
  // Reset hovered volcano all'inizio di ogni frame
  hoveredVolcano = null;
  
  for (let i = 0; i < categories.length; i++) {
    let y = padding + sectionHeight * i + titleHeight;
    
    // Disegna il rettangolo della sezione
    push();
    fill(0, 180);
    stroke(255, 150);
    strokeWeight(1);
    rect(rectX, y, rectWidth, sectionHeight - 10, 15);
    pop();
    
    // Disegna il titolo
    push();
    fill(255);
    noStroke();
    textSize(14);
    textAlign(LEFT, TOP);
    text(categories[i], rectX + 10, y + 10);
    pop();
    
    // Disegna i vulcani di questa categoria
    push();
    drawVolcanoesInSection(categories[i], rectX, y, rectWidth, sectionHeight - 10);
    pop();
  }
}

function drawTitle() {
  push();
  fill(255);
  textSize(32);
  textAlign(CENTER, TOP);
  textStyle(BOLD);
  text("VOLCANOES IN THE WORLD", width / 2, 40);
  pop();
}

function drawVolcanoesInSection(category, sectionX, sectionY, sectionW, sectionH) {
  let volcanoesInCategory = volcanoes.filter(v => v.type === category);
  
  for (let v of volcanoesInCategory) {
    drawVolcano(v, sectionX, sectionY, sectionW, sectionH);
  }
}

function drawVolcano(v, sectionX, sectionY, sectionW, sectionH) {
  let padding = 50;
  let x = map(v.longitude, -180, 180, sectionX + padding, sectionX + sectionW - padding);
  let y = map(v.latitude, -90, 90, sectionY + sectionH - padding/2, sectionY + padding/2);
  
  // Salva le coordinate dello schermo per il tooltip
  v.screenX = x;
  v.screenY = y;
  
  // Altezza del triangolo in base all'elevazione
  let minHeight = 2;
  let maxHeight = 50;
  let heightValue = map(v.elevation, min(elevations), max(elevations), minHeight, maxHeight);
  let base = 20;
  
  // Salva anche le dimensioni per il controllo del mouse
  v.heightValue = heightValue;
  v.base = base;
  
  // COLORE IN BASE AL CODICE ERUZIONE
  let eruptionColor = getColorFromEruptionCode(v.eruptionCode);
  
  fill(eruptionColor);
  noStroke();
  
  // Disegna il triangolo
  triangle(
    x, y - heightValue / 2,
    x - base / 2, y + heightValue / 2,
    x + base / 2, y + heightValue / 2
  );
  
  // Controlla se il mouse è sopra questo vulcano
  if (!hoveredVolcano && isMouseOverVolcano(v)) {
    hoveredVolcano = v;
  }
}

// Funzione per ottenere il colore in base al codice eruzione
function getColorFromEruptionCode(code) {
  let index = eruptionCodes.indexOf(code);
  
  // Se il codice non è trovato, usa un colore di default (grigio)
  if (index === -1) {
    return color(128, 128, 128);
  }
  
  let colorValue = map(index, 0, eruptionCodes.length - 1, 0, 1);
  
  // Restituisci il colore interpolato
  let colorTo = color(255); // giallo chiaro
  let colorFrom = color(88, 0, 0);        // rosso scuro
  return lerpColor(colorFrom, colorTo, colorValue);
}

function isMouseOverVolcano(v) {
  let hitArea = max(v.heightValue, v.base) + 5;
  return dist(mouseX, mouseY, v.screenX, v.screenY) < hitArea;
}

function drawTooltip(v) {
  let textSizeValue = 12;
  textSize(textSizeValue);
  textAlign(LEFT, TOP);
  let padding = 8;
  
  // Calcola la larghezza massima del testo (aggiungi anche il codice eruzione)
  let nameWidth = textWidth(v.name);
  let locationWidth = textWidth(v.location);
  let w = max(nameWidth, locationWidth) + padding * 2;
  let h = textSizeValue * 2 + padding * 2;
  
  // Posizione del tooltip (evita che esca dallo schermo)
  let x = v.screenX + 15;
  let y = v.screenY - h - 10;
  
  // Se il tooltip esce a destra, spostalo a sinistra
  if (x + w > width) {
    x = v.screenX - w - 15;
  }
  
  // Se il tooltip esce in alto, spostalo in basso
  if (y < 0) {
    y = v.screenY + 15;
  }
  
  // Sfondo del tooltip
  fill(0, 200);
  stroke(255, 150);
  strokeWeight(1);
  rect(x, y, w, h, 4);
  
  // Testo del tooltip (aggiungi il codice eruzione)
  fill(255);
  noStroke();
  text(v.name, x + padding, y + padding);
  text(v.location, x + padding, y + padding + textSizeValue);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight * categories.length);
}

function mousePressed() {
  let newURL = "detail.html?volcanoNo=" + hoveredVolcano.volcanoNo;
  window.location.href = newURL;
}
