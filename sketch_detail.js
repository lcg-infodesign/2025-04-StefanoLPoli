let table;
let selected;
let imgCloud;

let rectX;
let rectY;
let padding = 30;
let titleHeight = 80;
let sectionHeight = 600;
let rectWidth;
let cloudX;
let cloudY;
let cloudSize = 80;

let elevations = [];
let hoveredCloud = null;

function preload() {
    table = loadTable("assets/vulcani.csv", "csv", "header");
    imgCloud = loadImage("assets/nuvola.png");
}

function setup() {
    frameRate(30);
    createCanvas(windowWidth, windowHeight);

    let params = getURLParams();
    selected = table.findRows(params.volcanoNo, "Volcano Number")[0];

    console.log("Vulcano selezionato:", selected);

    for (let r = 0; r < table.getRowCount(); r++) {
        let elevation = table.getString(r, "Elevation (m)");
        elevations.push(elevation);
    }
}

function draw() {
    for (let y = 0; y < height; y++) {
        let inter = map(y, 0, height, 0, 1);
        let c = lerpColor(color("#005288ff"), color(0, 0, 0),  inter);
        stroke(c);
        line(0, y, width, y);
    }

    drawGrid();
    drawTitle();
    drawText();
    drawVolcano();

    // Disegna il tooltip se c'è un vulcano sotto il mouse
    if (isMouseOverVolcano()) {
        // Cambia il cursore in “mano” (interattivo)
        drawTooltip();
    }
    if (isMouseOverTitle()) {
        cursor("pointer");
    } else {
        // Torna al cursore normale
        cursor("default");
    }
}

function drawGrid() {
    rectWidth = width * 0.6;
    
    rectX = (width - rectWidth) / 2;
    
    // Sposta tutto a destra per fare spazio alla legenda
    rectX = max(rectX, 250);
      
    rectY = padding +  titleHeight;

    // Disegna il rettangolo della sezione
    push();
    fill(0, 180);
    stroke(255, 150);
    strokeWeight(1);
    rect(rectX, rectY, rectWidth, sectionHeight, 15);
    pop();
}

function drawTitle() {
  push();
  fill(255);
  textSize(32);
  textAlign(CENTER, TOP);
  textStyle(BOLD);
  text("VOLCANOES IN THE WORLD: " + selected.getString("Volcano Name") , width / 2, 40);
  pop();
}

function drawText(){
    rectWidth = width * 0.6;
    rectX = (width - rectWidth) / 2;
    rectX = max(rectX, 250);
    rectY = padding +  titleHeight;
    let minY = rectY + padding*3;
    let maxY = rectY + sectionHeight - padding*3;
    
    push();
    fill(255);
    textSize(20);
    textStyle(BOLD);
    textAlign(LEFT);
    text("Country: " + selected.getString("Country"), rectX + padding*3, minY);
    let currY = map(2,1,5, minY, maxY);
    text("Location: " + selected.getString("Location"), rectX + padding*3, currY);
    currY = map(3,1,5, minY, maxY);
    text("Type: " + selected.getString("Type"), rectX + padding*3, currY);
    currY = map(4,1,5, minY, maxY);
    text("Status: " + selected.getString("Status"), rectX + padding*3, currY);
    text("Last Eruption Code: " + selected.getString("Last Known Eruption"), rectX + padding*3, maxY);
    pop();
}

function drawVolcano() {
    // Altezza del triangolo in base all'elevazione
    let heightValue = 150;
    let base = 150;
    let x = rectX + (width * 0.6) - 300;
    let y = rectY + sectionHeight - padding*3;

    drawVolcanoHeight(x, y, base);

    
    // COLORE IN BASE AL CODICE ERUZIONE
    let eruptionColor = getColorFromEruptionCode(selected.getString("Last Known Eruption"));
    
    fill(eruptionColor);
    noStroke();
    // Disegna il triangolo
    triangle(
        x, y  - heightValue,
        x - base / 2, y,
        x + base / 2, y
    );
}

function drawVolcanoHeight(x, y){
    let minHeight = 150;
    rectY = padding +  titleHeight;
    let maxHeight = y-rectY - padding*3;
    let elevation = selected.getNum("Elevation (m)");
    let heightValue = map(elevation, min(elevations), max(elevations), minHeight, maxHeight);
    cloudX = x - 40;
    cloudY = y - heightValue - 40;
    let cloudSize = 80;
    push();
    stroke(100);
    strokeWeight(15);
    line(x, y-15, x, y-heightValue);
    image(imgCloud, cloudX, cloudY, cloudSize, cloudSize);

    pop();
}

// Funzione per ottenere il colore in base al codice eruzione
function getColorFromEruptionCode(code) {
    let eruptionCodes = ["D", "D1", "D2", "D3", "D4", "D5", "D6", "D7", "P", "Q", "U", "U1", "U7", "Unknown", "?"];
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

function drawTooltip() {
    push();
    let textSizeValue = 12;
    textSize(textSizeValue);
    textAlign(LEFT, TOP);
    let paddingTooltip = 8;
    
    // Calcola la larghezza massima del testo (aggiungi anche il codice eruzione)
    let textTooltip = "Elevation: " + selected.getString("Elevation (m)") + " m";
    let textWidth1 = textWidth(textTooltip);
    let w = textWidth1 + paddingTooltip * 2;
    let h = textSizeValue * 2 + paddingTooltip * 2;
    
    // Posizione del tooltip (evita che esca dallo schermo)
    let x = cloudX + 15;
    let y = cloudY - h - 10;
    
    // Se il tooltip esce a destra, spostalo a sinistra
    if (x + w > width) {
        x = cloudX - w - 15;
    }
    
    // Se il tooltip esce in alto, spostalo in basso
    if (y < 0) {
        y = cloudY + 15;
    }
    
    // Sfondo del tooltip
    fill(0, 200);
    stroke(255, 150);
    strokeWeight(1);
    rect(x, y, w, h, 4);
    
    // Testo del tooltip (aggiungi il codice eruzione)
    fill(255);
    noStroke();
    text(textTooltip, x + paddingTooltip, y + paddingTooltip);
    pop();
}

function isMouseOverVolcano() {
  let hitArea = cloudSize*2;
  return dist(mouseX, mouseY, cloudX, cloudY) < hitArea;
}

function isMouseOverTitle(){
    return mouseY<titleHeight && mouseX > rectX && mouseX < rectX + rectWidth;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  window.location.href = "index.html";
}