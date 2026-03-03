const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'public/assets/dishes');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const svgs = {};

svgs["baiao-de-dois-arretado.svg"] = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <!-- Bowl -->
  <path d="M12 32 C12 50, 20 56, 32 56 C44 56, 52 50, 52 32 Z" fill="#8B4513" />
  <path d="M10 32 Q32 40 54 32" stroke="#A0522D" stroke-width="4" fill="none"/>
  <!-- Rice and Beans -->
  <circle cx="24" cy="28" r="8" fill="#F5DEB3"/> <!-- Rice grain cluster -->
  <circle cx="34" cy="26" r="6" fill="#8B0000"/> <!-- Bean -->
  <circle cx="42" cy="29" r="6" fill="#F5DEB3"/>
  <circle cx="28" cy="24" r="5" fill="#8B0000"/>
  <!-- Cheese cubes -->
  <rect x="20" y="20" width="8" height="8" fill="#FFD700" rx="1"/>
  <rect x="36" y="20" width="8" height="8" fill="#FFD700" rx="1"/>
  <!-- Coriander -->
  <path d="M30 18 Q32 12 34 18 Q36 22 30 18" fill="#228B22"/>
</svg>`;

svgs["cuscuz-cabra-da-peste.svg"] = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <!-- Plate -->
  <ellipse cx="32" cy="50" rx="24" ry="8" fill="#DCDCDC"/>
  <ellipse cx="32" cy="48" rx="20" ry="6" fill="#F5F5F5"/>
  <!-- Couscous Dome -->
  <path d="M18 46 C18 20, 24 16, 32 16 C40 16, 46 20, 46 46 Z" fill="#FFD700"/>
  <path d="M22 46 C22 25, 26 20, 32 20 C38 20, 42 25, 42 46 Z" fill="#FFA500" opacity="0.6"/>
  <!-- Egg on top -->
  <ellipse cx="32" cy="18" rx="10" ry="4" fill="#FFFFFF"/>
  <circle cx="32" cy="17" r="4" fill="#FF8C00"/>
  <!-- Jerked meat -->
  <path d="M14 44 Q20 38 26 46" stroke="#8B0000" stroke-width="4" stroke-linecap="round"/>
  <path d="M38 46 Q44 38 50 44" stroke="#8B0000" stroke-width="4" stroke-linecap="round"/>
</svg>`;

svgs["carne-de-sol-do-lampiao.svg"] = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <!-- Wood Board -->
  <rect x="10" y="36" width="44" height="12" rx="4" fill="#8B4513"/>
  <rect x="12" y="34" width="40" height="10" rx="2" fill="#D2B48C"/>
  <!-- Meat slices -->
  <path d="M18 36 C16 26, 26 24, 28 36" fill="#8B0000"/>
  <path d="M26 36 C24 24, 34 22, 36 36" fill="#8B0000"/>
  <path d="M34 36 C32 24, 42 24, 44 36" fill="#8B0000"/>
  <!-- Onions -->
  <path d="M20 28 Q26 22 32 28" stroke="#FFFACD" stroke-width="2" fill="none"/>
  <path d="M28 26 Q36 20 42 26" stroke="#FFFACD" stroke-width="2" fill="none"/>
  <!-- Cassava chunks -->
  <rect x="14" y="42" width="10" height="6" fill="#F5DEB3" rx="2"/>
  <rect x="26" y="44" width="12" height="6" fill="#F5DEB3" rx="2"/>
  <rect x="40" y="42" width="10" height="5" fill="#F5DEB3" rx="2"/>
</svg>`;

svgs["macaxeira-nervosa.svg"] = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <!-- Basket -->
  <path d="M14 30 L20 54 L44 54 L50 30 Z" fill="#DEB887"/>
  <path d="M14 30 Q32 40 50 30" stroke="#8B4513" stroke-width="2" fill="none"/>
  <!-- Fries/Cassava Sticks -->
  <rect x="22" y="16" width="6" height="24" rx="2" fill="#FFD700" transform="rotate(15 25 28)"/>
  <rect x="36" y="14" width="6" height="26" rx="2" fill="#FFD700" transform="rotate(-10 39 27)"/>
  <rect x="28" y="12" width="6" height="28" rx="2" fill="#FFC125"/>
  <rect x="18" y="20" width="6" height="20" rx="2" fill="#FFC125" transform="rotate(25 21 30)"/>
  <rect x="42" y="18" width="6" height="22" rx="2" fill="#FFC125" transform="rotate(-20 45 29)"/>
</svg>`;

svgs["escondidinho-de-mainha.svg"] = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <!-- Clay Pot -->
  <path d="M10 26 C10 50, 16 54, 32 54 C48 54, 54 50, 54 26 Z" fill="#A0522D"/>
  <ellipse cx="32" cy="26" rx="22" ry="8" fill="#8B4513"/>
  <!-- Mashed Cassava Top -->
  <ellipse cx="32" cy="24" rx="20" ry="6" fill="#FFE4B5"/>
  <!-- Burned Cheese spots -->
  <circle cx="26" cy="23" r="3" fill="#DAA520"/>
  <circle cx="36" cy="25" r="4" fill="#CD853F"/>
  <circle cx="32" cy="21" r="2" fill="#DAA520"/>
  <!-- Steam -->
  <path d="M26 16 Q28 10 26 4" stroke="#DCDCDC" stroke-width="2" fill="none" opacity="0.6"/>
  <path d="M38 14 Q36 8 38 4" stroke="#DCDCDC" stroke-width="2" fill="none" opacity="0.6"/>
</svg>`;

svgs["sarapatel-sem-choro.svg"] = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <!-- Deep Bowl -->
  <path d="M8 28 C8 54, 20 60, 32 60 C44 60, 56 54, 56 28 Z" fill="#000000"/>
  <ellipse cx="32" cy="28" rx="24" ry="8" fill="#2F4F4F"/>
  <!-- Dark Stew liquid -->
  <ellipse cx="32" cy="28" rx="22" ry="6" fill="#4A0000"/>
  <!-- Meat chunks -->
  <circle cx="24" cy="27" r="4" fill="#2E0808"/>
  <circle cx="34" cy="29" r="5" fill="#3B0B0B"/>
  <circle cx="42" cy="26" r="3" fill="#2E0808"/>
  <!-- Lemon slice -->
  <circle cx="16" cy="24" r="6" fill="#32CD32"/>
  <circle cx="16" cy="24" r="5" fill="#ADFF2F"/>
  <path d="M16 24 L16 19 M16 24 L12 28 M16 24 L20 28" stroke="#32CD32" stroke-width="1"/>
</svg>`;

svgs["siri-fujao.svg"] = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <!-- Crab Shell -->
  <path d="M12 36 C8 24, 24 16, 32 16 C40 16, 56 24, 52 36 C48 48, 16 48, 12 36 Z" fill="#FF4500"/>
  <path d="M18 34 C18 26, 26 22, 32 22 C38 22, 46 26, 46 34 C46 42, 18 42, 18 34 Z" fill="#FFA07A"/>
  <!-- Farofa/Stuffed meat -->
  <ellipse cx="32" cy="32" rx="12" ry="6" fill="#F0E68C"/>
  <circle cx="28" cy="30" r="1" fill="#8B4513"/>
  <circle cx="34" cy="33" r="1.5" fill="#D2691E"/>
  <circle cx="36" cy="30" r="1" fill="#8B4513"/>
  <!-- Crab legs playfully crossing -->
  <path d="M12 36 Q4 32 6 24" stroke="#FF4500" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M52 36 Q60 32 58 24" stroke="#FF4500" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>`;

svgs["galinha-forrozeira.svg"] = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <!-- Iron Pot -->
  <path d="M6 32 C6 56, 16 60, 32 60 C48 60, 58 56, 58 32 Z" fill="#2C2C2C"/>
  <ellipse cx="32" cy="32" rx="26" ry="10" fill="#1A1A1A"/>
  <!-- Golden Broth -->
  <ellipse cx="32" cy="32" rx="24" ry="8" fill="#DAA520"/>
  <!-- Chicken Drumstick -->
  <path d="M26 24 C16 16, 26 12, 32 24" fill="#CD853F"/>
  <rect x="28" y="16" width="4" height="10" fill="#FFE4C4" transform="rotate(45 30 21)"/>
  <!-- Vegetables -->
  <circle cx="20" cy="34" r="4" fill="#FF4500"/> <!-- Tomato -->
  <circle cx="44" cy="30" r="3" fill="#32CD32"/> <!-- Okra or herb -->
  <circle cx="38" cy="36" r="5" fill="#FFE4B5"/> <!-- Potato -->
</svg>`;

svgs["tapioca-da-molestia.svg"] = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <!-- Plate -->
  <ellipse cx="32" cy="50" rx="28" ry="8" fill="#F0F8FF"/>
  <ellipse cx="32" cy="48" rx="24" ry="6" fill="#FFFFFF"/>
  <!-- Tapioca -->
  <path d="M14 46 C20 30, 44 30, 50 46" fill="#FDF5E6" stroke="#FAEBD7" stroke-width="2"/>
  <path d="M16 46 C24 38, 40 38, 48 46" fill="#FFF8DC"/>
  <!-- Filling peeking out -->
  <path d="M22 46 C26 40, 38 40, 42 46" fill="#8B0000"/> <!-- Meat/cheese filling -->
  <circle cx="32" cy="44" r="3" fill="#FFD700"/>
</svg>`;

svgs["bobo-do-oxente.svg"] = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <!-- Ceramic Bowl -->
  <path d="M10 28 C10 52, 20 58, 32 58 C44 58, 54 52, 54 28 Z" fill="#D2691E"/>
  <ellipse cx="32" cy="28" rx="22" ry="8" fill="#A0522D"/>
  <!-- Cream -->
  <ellipse cx="32" cy="28" rx="20" ry="6" fill="#FF8C00"/>
  <!-- Shrimps -->
  <path d="M20 28 C16 22, 24 18, 26 26 C28 32, 20 34, 20 28" fill="#FF7F50" stroke="#FF4500" stroke-width="1"/>
  <path d="M40 24 C34 20, 44 14, 46 22 C48 28, 40 30, 40 24" fill="#FF7F50" stroke="#FF4500" stroke-width="1"/>
  <path d="M30 32 C26 26, 36 24, 34 34 C32 40, 26 36, 30 32" fill="#FF7F50" stroke="#FF4500" stroke-width="1"/>
</svg>`;

svgs["arrumadinho-desmantelado.svg"] = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <!-- Rectangular wooden platter -->
  <rect x="8" y="30" width="48" height="16" rx="4" fill="#8B4513"/>
  <rect x="10" y="28" width="44" height="14" rx="2" fill="#D2B48C"/>
  <!-- Layers of ingredients side by side -->
  <!-- Farofa -->
  <rect x="12" y="24" width="12" height="10" rx="3" fill="#F0E68C"/>
  <circle cx="16" cy="26" r="1" fill="#CD853F"/>
  <circle cx="20" cy="28" r="1" fill="#CD853F"/>
  <!-- Vinaigrette -->
  <rect x="24" y="24" width="12" height="10" rx="3" fill="#FFFACD"/>
  <rect x="26" y="26" width="3" height="3" fill="#FF4500"/>
  <rect x="30" y="28" width="3" height="3" fill="#32CD32"/>
  <rect x="32" y="25" width="2" height="2" fill="#FF4500"/>
  <!-- Beans -->
  <rect x="36" y="24" width="8" height="10" rx="3" fill="#8B0000"/>
  <!-- Jerky -->
  <rect x="44" y="22" width="8" height="12" rx="3" fill="#4A0000"/>
</svg>`;

svgs["panelada-do-cabra-macho.svg"] = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <!-- Big Iron Cauldron -->
  <path d="M12 24 C4 48, 16 60, 32 60 C48 60, 60 48, 52 24 Z" fill="#000000"/>
  <ellipse cx="32" cy="24" rx="20" ry="8" fill="#1A1A1A"/>
  <!-- Stew -->
  <ellipse cx="32" cy="24" rx="18" ry="6" fill="#8B4513"/>
  <!-- Tripe and veggies -->
  <path d="M22 24 Q24 20 28 24 Q30 28 26 26" fill="#F5DEB3" stroke="#D2B48C" stroke-width="1"/>
  <path d="M38 22 Q40 18 44 22 Q46 26 42 24" fill="#F5DEB3" stroke="#D2B48C" stroke-width="1"/>
  <circle cx="30" cy="20" r="3" fill="#228B22"/> <!-- Herb -->
  <path d="M20 12 Q28 6 30 16" stroke="#DCDCDC" stroke-width="2" fill="none" opacity="0.6"/>
  <path d="M44 14 Q36 4 34 14" stroke="#DCDCDC" stroke-width="2" fill="none" opacity="0.6"/>
</svg>`;

for (const [name, content] of Object.entries(svgs)) {
  fs.writeFileSync(path.join(dir, name), content);
}
console.log('12 SVGs created!');
