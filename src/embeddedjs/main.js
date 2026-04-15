import Poco from "commodetto/Poco";

const render = new Poco(screen);

const ZONE_COUNT = 4;
const HOURS_PER_ZONE = 6;
const BLOCKS_PER_HOUR = 6;

const BOARD_MARGIN = 10;
const FRAME_THICKNESS = 4;
const SEPARATOR_THICKNESS = 2;
const CELL_GAP = 1;

const BOARD_BG_HEX = "#10141f";
const ZONE_BG_HEX = "#B0B0B0";
const OUTLINE_HEX = "#3c4660";
const FRAME_HEX = "#7A7A7A";
const HINT_HEX = "#ffffff";

const COLOR_HEXES = [
  // "#A7E8BD",
  // "#88D8C0",
  "#50C878",
  "#6B8E23",
  // "#FFFACD",
  "#FFDB58",
  "#FFD700",
  // "#E6E8FA",
  "#87CEEB",
  // "#40E0D0",
  "#008B8B",
  // "#191970",
];

function hexToColor(hex) {
  const value = parseInt(hex.slice(1), 16);
  return render.makeColor((value >> 16) & 255, (value >> 8) & 255, value & 255);
}

const BOARD_BG = hexToColor(BOARD_BG_HEX);
const ZONE_BG = hexToColor(ZONE_BG_HEX);
const OUTLINE = hexToColor(OUTLINE_HEX);
const FRAME = hexToColor(FRAME_HEX);
const HINT_COLOR = hexToColor(HINT_HEX);
const TILE_COLORS = COLOR_HEXES.map(hexToColor);
const LINE_COLOR_ORDERS = [];
const settings = {
  displayHint: true,
  useAMPM: false
};

function createShuffledOrder() {
  const order = TILE_COLORS.map((_, index) => index);

  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = order[i];
    order[i] = order[j];
    order[j] = tmp;
  }

  return order;
}

for (let hour = 0; hour < 24; hour += 1)
  LINE_COLOR_ORDERS.push(createShuffledOrder());

const ZONES = [
  { startHour: 0, column: 0, row: 0 },
  { startHour: 6, column: 0, row: 1 },
  { startHour: 12, column: 1, row: 0 },
  { startHour: 18, column: 1, row: 1 }
];

function getLayout() {
  const outerSize = Math.min(render.width, render.height) - (BOARD_MARGIN * 2);
  const innerSize = outerSize - (FRAME_THICKNESS * 2);
  const zoneSize = Math.floor((innerSize - SEPARATOR_THICKNESS) / 2);
  const boardSize = (zoneSize * 2) + SEPARATOR_THICKNESS;
  const originX = Math.floor((render.width - outerSize) / 2);
  const originY = Math.floor((render.height - outerSize) / 2);
  const innerX = originX + FRAME_THICKNESS;
  const innerY = originY + FRAME_THICKNESS;

  return {
    originX,
    originY,
    outerSize,
    boardSize,
    zoneSize,
    innerX,
    innerY
  };
}

function getZoneOrigin(layout, zone) {
  return {
    x: layout.innerX + (zone.column * (layout.zoneSize + SEPARATOR_THICKNESS)),
    y: layout.innerY + (zone.row * (layout.zoneSize + SEPARATOR_THICKNESS))
  };
}

function getGrid(zoneSize) {
  const maxWidthByHorizontal = Math.floor((zoneSize - ((BLOCKS_PER_HOUR + 1) * CELL_GAP)) / BLOCKS_PER_HOUR);
  const maxWidthByVertical = Math.floor((zoneSize - ((HOURS_PER_ZONE + 1) * CELL_GAP)) / HOURS_PER_ZONE);
  const cellSize = Math.max(2, Math.min(maxWidthByHorizontal, maxWidthByVertical));
  const gridWidth = (BLOCKS_PER_HOUR * cellSize) + ((BLOCKS_PER_HOUR + 1) * CELL_GAP);
  const gridHeight = (HOURS_PER_ZONE * cellSize) + ((HOURS_PER_ZONE + 1) * CELL_GAP);

  return {
    cellSize,
    gridXOffset: Math.floor((zoneSize - gridWidth) / 2),
    gridYOffset: Math.floor((zoneSize - gridHeight) / 2)
  };
}

function getBlocksForCurrentHour(minutes) {
  return Math.floor(minutes / 10);
}

function drawBlock(x, y, width, height, fillColor, fillRatio = 1) {
  render.fillRectangle(OUTLINE, x, y, width, height);

  if (width > 2 && height > 2) {
    const innerWidth = width - 2;
    const innerHeight = height - 2;
    const clampedFillRatio = Math.max(0, Math.min(1, fillRatio));
    const fillWidth = Math.floor(innerWidth * clampedFillRatio);

    // Keep the unfilled part of the current block consistent with watchface background.
    render.fillRectangle(
      BOARD_BG,
      x + 1,
      y + 1,
      innerWidth,
      innerHeight
    );

    if (fillWidth > 0) {
      render.fillRectangle(
        fillColor,
        x + 1,
        y + 1,
        fillWidth,
        innerHeight
      );
    }
  }
}

function drawZone(layout, zone, now) {
  const zoneOrigin = getZoneOrigin(layout, zone);
  const grid = getGrid(layout.zoneSize);
  const nowHour = now.getHours();
  const nowMinute = now.getMinutes();
  const completedHourBlocks = getBlocksForCurrentHour(nowMinute);
  const currentBlockFillRatio = (nowMinute % 10) / 10;

  render.fillRectangle(ZONE_BG, zoneOrigin.x, zoneOrigin.y, layout.zoneSize, layout.zoneSize);

  for (let hourOffset = 0; hourOffset < HOURS_PER_ZONE; hourOffset += 1) {
    const globalHour = zone.startHour + hourOffset;
    const lineColorOrder = LINE_COLOR_ORDERS[globalHour];

    for (let blockIndex = 0; blockIndex < BLOCKS_PER_HOUR; blockIndex += 1) {
      const isPastHour = globalHour < nowHour;
      const isCurrentHour = globalHour === nowHour;
      const isCompletedBlock = blockIndex < completedHourBlocks;
      const isCurrentBlock = isCurrentHour && (blockIndex === completedHourBlocks) && (completedHourBlocks < BLOCKS_PER_HOUR);
      const active = isPastHour || (isCurrentHour && (isCompletedBlock || isCurrentBlock));

      if (!active)
        continue;

      const colorIndex = lineColorOrder[blockIndex % lineColorOrder.length];
      const x = zoneOrigin.x + grid.gridXOffset + CELL_GAP + (blockIndex * (grid.cellSize + CELL_GAP));
      const y = zoneOrigin.y + grid.gridYOffset + CELL_GAP + (hourOffset * (grid.cellSize + CELL_GAP));
      const fillRatio = isCurrentBlock ? currentBlockFillRatio : 1;

      drawBlock(x, y, grid.cellSize, grid.cellSize, TILE_COLORS[colorIndex], fillRatio);
    }
  }
}

function drawFrame(layout) {
  render.fillRectangle(FRAME, layout.originX, layout.originY, layout.outerSize, FRAME_THICKNESS);
  render.fillRectangle(
    FRAME,
    layout.originX,
    layout.originY + layout.outerSize - FRAME_THICKNESS,
    layout.outerSize,
    FRAME_THICKNESS
  );
  render.fillRectangle(FRAME, layout.originX, layout.originY, FRAME_THICKNESS, layout.outerSize);
  render.fillRectangle(
    FRAME,
    layout.originX + layout.outerSize - FRAME_THICKNESS,
    layout.originY,
    FRAME_THICKNESS,
    layout.outerSize
  );
}

function drawSeparators(layout) {
  render.fillRectangle(
    FRAME,
    layout.innerX + layout.zoneSize,
    layout.innerY,
    SEPARATOR_THICKNESS,
    layout.boardSize
  );
  render.fillRectangle(
    FRAME,
    layout.innerX,
    layout.innerY + layout.zoneSize,
    layout.boardSize,
    SEPARATOR_THICKNESS
  );
}

function drawRightHints(layout) {
  const zoneOrigin = getZoneOrigin(layout, ZONES[2]);
  const grid = getGrid(layout.zoneSize);
  const hintHeight = 5;
  const hintSpacing = 1;
  const firstRowY = zoneOrigin.y + grid.gridYOffset + CELL_GAP;
  const rowIndexes = [1, 3, 5, 7, 9, 11];
  const labels = ["13", "15", "17", "19", "21", "23"];
  const hintX = layout.innerX + layout.boardSize + 2;

  for (let i = 0; i < rowIndexes.length; i += 1) {
    const rowIndex = rowIndexes[i];
    const label = labels[i];
    const cellY = firstRowY + (rowIndex * (grid.cellSize + CELL_GAP));
    const hintY = cellY + Math.floor((grid.cellSize - hintHeight) / 2);

    drawTinyLabel(label, hintX, hintY, hintSpacing);
  }
}

function drawLeftHints(layout) {
  const hintHeight = 5;
  const hintSpacing = 1;
  const rowIndexes = [1, 3, 5, 7, 9, 11];
  const labels = ["1", "3", "5", "7", "9", "11"];

  for (let i = 0; i < rowIndexes.length; i += 1) {
    const rowIndex = rowIndexes[i];
    const label = labels[i];
    const labelWidth = getTinyLabelWidth(label, hintSpacing);
    const hintX = layout.innerX - 6 - labelWidth;
    const hintY = getLeftColumnRowHintY(layout, rowIndex, hintHeight);

    drawTinyLabel(label, hintX, hintY, hintSpacing);
  }
}

function drawTopHints(layout) {
  const hintHeight = 5;
  const hintSpacing = 1;
  const topMargin = 2;
  const topLeftOrigin = getZoneOrigin(layout, ZONES[0]);
  const topRightOrigin = getZoneOrigin(layout, ZONES[2]);
  const grid = getGrid(layout.zoneSize);
  const hints = [
    { text: "10", blockIndex: 1 },
    { text: "30", blockIndex: 3 },
    { text: "50", blockIndex: 5 }
  ];
  const hintY = layout.innerY - topMargin - hintHeight;

  for (let i = 0; i < hints.length; i += 1) {
    const hint = hints[i];
    const labelWidth = getTinyLabelWidth(hint.text, hintSpacing);
    const leftCellX = topLeftOrigin.x + grid.gridXOffset + CELL_GAP + (hint.blockIndex * (grid.cellSize + CELL_GAP));
    const rightCellX = topRightOrigin.x + grid.gridXOffset + CELL_GAP + (hint.blockIndex * (grid.cellSize + CELL_GAP));

    drawTinyLabel(hint.text, leftCellX + Math.floor((grid.cellSize - labelWidth) / 2), hintY, hintSpacing);
    drawTinyLabel(hint.text, rightCellX + Math.floor((grid.cellSize - labelWidth) / 2), hintY, hintSpacing);
  }
}

function drawBottomHints(layout) {
  const hintSpacing = 1;
  const bottomMargin = 2;
  const leftText = "AM";
  const rightText = "PM";
  const leftWidth = getTinyLabelWidth(leftText, hintSpacing);
  const rightWidth = getTinyLabelWidth(rightText, hintSpacing);
  const y = layout.innerY + layout.boardSize + bottomMargin;
  const leftCenterX = layout.innerX + Math.floor(layout.zoneSize / 2);
  const rightCenterX = layout.innerX + layout.zoneSize + SEPARATOR_THICKNESS + Math.floor(layout.zoneSize / 2);

  drawTinyLabel(leftText, leftCenterX - Math.floor(leftWidth / 2), y, hintSpacing);
  drawTinyLabel(rightText, rightCenterX - Math.floor(rightWidth / 2), y, hintSpacing);
}

function getLeftColumnRowHintY(layout, rowIndex, hintHeight) {
  const zone = rowIndex < HOURS_PER_ZONE ? ZONES[0] : ZONES[1];
  const hourOffset = rowIndex % HOURS_PER_ZONE;
  const zoneOrigin = getZoneOrigin(layout, zone);
  const grid = getGrid(layout.zoneSize);
  const cellY = zoneOrigin.y + grid.gridYOffset + CELL_GAP + (hourOffset * (grid.cellSize + CELL_GAP));

  return cellY + Math.floor((grid.cellSize - hintHeight) / 2);
}

function getTinyLabelWidth(text, spacing) {
  if (text.length === 1)
    return 3;

  return (text.length * 3) + ((text.length - 1) * spacing);
}

function drawTinyLabel(text, x, y, spacing) {
  let cursor = x;

  for (let i = 0; i < text.length; i += 1) {
    drawTinyDigit(text.charAt(i), cursor, y);
    cursor += 3 + spacing;
  }
}

function drawTinyDigit(digit, x, y) {
  if (digit === "1") {
    render.fillRectangle(HINT_COLOR, x + 1, y, 1, 5);
    render.fillRectangle(HINT_COLOR, x, y + 1, 1, 1);
    render.fillRectangle(HINT_COLOR, x, y + 4, 3, 1);
    return;
  }

  if (digit === "4") {
    render.fillRectangle(HINT_COLOR, x, y, 1, 3);
    render.fillRectangle(HINT_COLOR, x + 2, y, 1, 5);
    render.fillRectangle(HINT_COLOR, x, y + 2, 3, 1);
    return;
  }

  if (digit === "7") {
    render.fillRectangle(HINT_COLOR, x, y, 3, 1);
    render.fillRectangle(HINT_COLOR, x + 2, y + 1, 1, 4);
    return;
  }

  if (digit === "0") {
    render.fillRectangle(HINT_COLOR, x, y, 3, 1);
    render.fillRectangle(HINT_COLOR, x, y + 4, 3, 1);
    render.fillRectangle(HINT_COLOR, x, y + 1, 1, 3);
    render.fillRectangle(HINT_COLOR, x + 2, y + 1, 1, 3);
    return;
  }

  if (digit === "2") {
    render.fillRectangle(HINT_COLOR, x, y, 3, 1);
    render.fillRectangle(HINT_COLOR, x + 2, y + 1, 1, 1);
    render.fillRectangle(HINT_COLOR, x, y + 2, 3, 1);
    render.fillRectangle(HINT_COLOR, x, y + 3, 1, 1);
    render.fillRectangle(HINT_COLOR, x, y + 4, 3, 1);
    return;
  }

  if (digit === "3") {
    render.fillRectangle(HINT_COLOR, x, y, 3, 1);
    render.fillRectangle(HINT_COLOR, x + 2, y + 1, 1, 3);
    render.fillRectangle(HINT_COLOR, x, y + 2, 3, 1);
    render.fillRectangle(HINT_COLOR, x, y + 4, 3, 1);
    return;
  }

  if (digit === "6") {
    render.fillRectangle(HINT_COLOR, x, y, 3, 1);
    render.fillRectangle(HINT_COLOR, x, y + 1, 1, 3);
    render.fillRectangle(HINT_COLOR, x, y + 2, 3, 1);
    render.fillRectangle(HINT_COLOR, x + 2, y + 3, 1, 1);
    render.fillRectangle(HINT_COLOR, x, y + 4, 3, 1);
    return;
  }

  if (digit === "5") {
    render.fillRectangle(HINT_COLOR, x, y, 3, 1);
    render.fillRectangle(HINT_COLOR, x, y + 1, 1, 1);
    render.fillRectangle(HINT_COLOR, x, y + 2, 3, 1);
    render.fillRectangle(HINT_COLOR, x + 2, y + 3, 1, 1);
    render.fillRectangle(HINT_COLOR, x, y + 4, 3, 1);
    return;
  }

  if (digit === "9") {
    render.fillRectangle(HINT_COLOR, x, y, 3, 1);
    render.fillRectangle(HINT_COLOR, x, y + 1, 1, 1);
    render.fillRectangle(HINT_COLOR, x + 2, y + 1, 1, 3);
    render.fillRectangle(HINT_COLOR, x, y + 2, 3, 1);
    render.fillRectangle(HINT_COLOR, x, y + 4, 3, 1);
    return;
  }

  if (digit === "8") {
    render.fillRectangle(HINT_COLOR, x, y, 3, 1);
    render.fillRectangle(HINT_COLOR, x, y + 2, 3, 1);
    render.fillRectangle(HINT_COLOR, x, y + 4, 3, 1);
    render.fillRectangle(HINT_COLOR, x, y + 1, 1, 1);
    render.fillRectangle(HINT_COLOR, x + 2, y + 1, 1, 1);
    render.fillRectangle(HINT_COLOR, x, y + 3, 1, 1);
    render.fillRectangle(HINT_COLOR, x + 2, y + 3, 1, 1);
    return;
  }

  if (digit === "A") {
    render.fillRectangle(HINT_COLOR, x + 1, y, 1, 1);
    render.fillRectangle(HINT_COLOR, x, y + 1, 1, 4);
    render.fillRectangle(HINT_COLOR, x + 2, y + 1, 1, 4);
    render.fillRectangle(HINT_COLOR, x, y + 2, 3, 1);
    return;
  }

  if (digit === "M") {
    render.fillRectangle(HINT_COLOR, x, y, 1, 5);
    render.fillRectangle(HINT_COLOR, x + 2, y, 1, 5);
    render.fillRectangle(HINT_COLOR, x + 1, y + 1, 1, 1);
    return;
  }

  if (digit === "P") {
    render.fillRectangle(HINT_COLOR, x, y, 1, 5);
    render.fillRectangle(HINT_COLOR, x, y, 3, 1);
    render.fillRectangle(HINT_COLOR, x + 2, y + 1, 1, 1);
    render.fillRectangle(HINT_COLOR, x, y + 2, 3, 1);
  }
}

function draw() {
  const now = new Date();
  const layout = getLayout();

  render.begin();
  render.fillRectangle(FRAME, 0, 0, render.width, render.height);
  render.fillRectangle(BOARD_BG, layout.originX, layout.originY, layout.outerSize, layout.outerSize);
  drawFrame(layout);

  for (let i = 0; i < ZONES.length; i += 1)
    drawZone(layout, ZONES[i], now);

  drawSeparators(layout);

  if (settings.displayHint) {
    drawTopHints(layout);
    drawLeftHints(layout);

    if (settings.useAMPM)
      drawBottomHints(layout);
    else
      drawRightHints(layout);
  }

  render.end();
}

watch.addEventListener("minutechange", draw);
draw();
