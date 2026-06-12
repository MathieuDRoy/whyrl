const sharp = require('sharp');
const path = require('path');

const WIDTH = 1284;
const HEIGHT = 2778;
const ICON_SIZE = 400;
const BG = { r: 10, g: 10, b: 10, alpha: 1 };

async function generate() {
  const iconBuffer = await sharp(path.join(__dirname, '../assets/icon.png'))
    .resize(ICON_SIZE, ICON_SIZE)
    .toBuffer();

  await sharp({
    create: { width: WIDTH, height: HEIGHT, channels: 4, background: BG },
  })
    .composite([{
      input: iconBuffer,
      left: Math.floor((WIDTH - ICON_SIZE) / 2),
      top: Math.floor((HEIGHT - ICON_SIZE) / 2),
    }])
    .png()
    .toFile(path.join(__dirname, '../assets/splash.png'));

  console.log('Generated assets/splash.png');
}

generate().catch(err => { console.error(err); process.exit(1); });
