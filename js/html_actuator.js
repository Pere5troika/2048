function HTMLActuator() {
  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer   = document.querySelector(".score-container");
  this.bestContainer    = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");

  this.score = 0;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);

    if (metadata.terminated) {
      if (metadata.over) {
        self.message(false); // You lose
      } else if (metadata.won) {
        self.message(true); // You win!
      }
    }

  });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continueGame = function () {
  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile) {
  var self = this;

  var wrapper   = document.createElement("div");
  var inner     = document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);
  var superScript = document.createElement("sup");
  var hexScript = document.createElement("span");
  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];

  if (tile.value > 2048) classes.push("tile-super");

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");

  //if math.random() ? 1 : tile.value, if math.random() ? 2 : exponent,
  // if math.random() ? 3 : Binary, if math.random() ? 4 : hex.
  function valueType(tempVal) {
    var rand = Math.random();
    if (rand < .34) {
      inner.classList.add('reg');
      return tempVal;
    }
    else if(rand >.34 && rand < .66) {
      var root = Math.log2(tempVal);
      inner.classList.add('expon');
      superScript.textContent = root;
      return 2;
    }
    // else if(rand >.54 && rand < .78) {
    //     var t2Bit = (tempVal >>> 0).toString(2);
    //     //TODO why invisible?
    //     //spaces at 0s
    //     var tempValLength = t2Bit.length;
    //     var compNumber = "";
    //     switch (tempValLength % 4) {
    //       case 0:
    //         for (var x = 0; x < tempValLength-4; x+=4)
    //         {
    //           var tempString = t2Bit.slice(x, x+4);
    //           console.log("I am a string of binary " + tempString);
    //           compNumber = compNumber.concat(tempString,' ');
    //           console.log("I am the concat method (4) of the string: "+compNumber);
    //         }
    //         break;
    //       case 1:
    //         compNumber.concat(t2Bit.slice(0,1)+' ');
    //         for (var a = 1; a < tempValLength-4; a+=4)
    //         {
    //           compNumber.concat(t2Bit.slice(x, x+4),' ');
    //         }
    //         break;
    //       case 2:
    //         compNumber.concat(t2Bit.slice(0,2)+' ');
    //         for (var b = 2; b < tempValLength-4; b+=4)
    //         {
    //           compNumber.concat(t2Bit.slice(x, x+4),' ');
    //         }
    //         break;
    //       case 3:
    //         compNumber.concat(t2Bit.slice(0,3)+' ');
    //         for (var c = 3; c < tempValLength-4; c+=4)
    //         {
    //           compNumber.concat(t2Bit.slice(x, x+4),' ');
    //         }
    //       }
    //       inner.classList.add('binary');
    //       console.log(compNumber);
    //       return compNumber;
    //}
    else {
        inner.classList.add('hex');
        hexScript.textContent = (tempVal >>> 0).toString(16);
        return "0x";
    }
  }
  inner.textContent = valueType(tile.value);

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }

  //add sup script if exponent
  //if has element sup / hex > remove
  //TODO


  
  //if has class expon
  inner.appendChild(superScript);

  //if has class hex
  inner.appendChild(hexScript);

  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);

  // Put the tile on the board
  this.tileContainer.appendChild(wrapper);


};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.bestContainer.textContent = bestScore;
};

HTMLActuator.prototype.message = function (won) {
  var type    = won ? "game-won" : "game-over";
  var message = won ? "You win!" : "Game over!";

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
};
