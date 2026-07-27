// simple dice logic + UI hook
function animateDice(element, value){
  element.classList.add('dice-anim');
  setTimeout(()=>{ element.classList.remove('dice-anim'); element.textContent = value; }, 620);
}

window.Dice = {
  roll(game, element){
    const v = game.rollDice(); animateDice(element,v); return v;
  }
};