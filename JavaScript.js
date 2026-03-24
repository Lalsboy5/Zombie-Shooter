// ===== Wireless Controller - الخريطة النهائية (مطابقة لطلبك) =====
function updateController(dt){
  if(gameMode !== 'controller' || !running) return;

  let gp = getGamepad();

  // ── اكتشاف تلقائي قوي (حتى لو الكنترولر موصول من قبل) ──
  if(gpIndex === null){
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for(let i = 0; i < pads.length; i++){
      if(pads[i] && pads[i].connected){
        const hasInput = pads[i].buttons.some(b => b.pressed) ||
                         Math.abs(pads[i].axes[0]) > 0.15 ||
                         Math.abs(pads[i].axes[1]) > 0.15;
        if(hasInput){
          gpIndex = i;
          showMsg('🎮 تم اكتشاف الكنترولر تلقائيًا!', '#4cff4c');
          gp = pads[i];
          break;
        }
      }
    }
  }

  if(!gp){ gpDelta.x = gpDelta.y = 0; return; }

  const deadzone = 0.18;

  // L Stick → تحرك
  gpDelta.x = Math.abs(gp.axes[0]) > deadzone ? gp.axes[0] : 0;
  gpDelta.y = Math.abs(gp.axes[1]) > deadzone ? gp.axes[1] : 0;

  // R Stick → تحريك الكاميرا
  const rx = Math.abs(gp.axes[2]) > deadzone ? gp.axes[2] : 0;
  const ry = Math.abs(gp.axes[3]) > deadzone ? gp.axes[3] : 0;
  yaw   -= rx * dt * 2.5;
  pitch -= ry * dt * 2.0;
  pitch = Math.max(-1.2, Math.min(1.2, pitch));

  // R2 → إطلاق النار (اضغط واستمر)
  const r2 = gp.buttons[7] ? gp.buttons[7].value || (gp.buttons[7].pressed ? 1 : 0) : 0;
  if(r2 > 0.3) useWeapon();

  // X → قفز ⬆
  if(btnJustPressed(gp, 0) && P.onGround){ P.yVel = JUMP_V; P.onGround = false; }

  // □ → قنبلة 💣
  if(btnJustPressed(gp, 2)) throwGrenade();

  // △ → RPG 🚀
  if(btnJustPressed(gp, 3)){
    if(P.weapon === 'rpg') shootRPG();
    else switchWeapon('rpg');
  }

  // O → سكين 🔪
  if(btnJustPressed(gp, 1)){
    if(P.weapon === 'knife') knifeMelee();
    else switchWeapon('knife');
  }

  // L1 → سنايبر 🎯
  if(btnJustPressed(gp, 4)){
    if(P.weapon === 'sniper') switchWeapon('rifle');
    else switchWeapon('sniper');
  }

  // L2 → منظار 🔭
  if(btnJustPressed(gp, 6)) toggleScope();

  // R1 → رجوع للبندقية
  if(btnJustPressed(gp, 5)) switchWeapon('rifle');

  // Options → قائمة ⚙
  if(btnJustPressed(gp, 9)) pauseGame();

  // حفظ حالة الأزرار
  gpState.prevButtons = gp.buttons.map(b => b.pressed);
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}