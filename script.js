let fieldOwnerArray = [
    0, 0, 0,    // Reihe 1
    0, 0, 0,    // Reihe 2
    0, 0, 0     // reihe 3
]; // Besitzer der Felder - 0 = None // 1 = Player1 // 2 = Player2

const fieldsCombinationsToWin = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
]; // Kombinationen der Felder um zu gewinnen

let isBotActive = false; // true - Spieler 2 ist ein Bot || false - Spieler 2 ist ein Mensch
let gameOver = false;
let currentPlayer = 1;

let markerCharacters = [    'X',    // Player 1
                            'O'     // Player 2
];

function fieldPressed(fieldNumber) {
    if ( !(isFieldFree(fieldNumber) && userCanSet()) ) {
        return;
    }
    setCurrentPlayerAsFieldOwner(fieldNumber); // Markiert das Feld für den Spieler

    // Welche Reihe hat gewonnen? Rückgabe [] oder z.B. [3,4,5] siehe Variable >fieldsCombinationsToWin<
    let winnerLine = getPossibleLine(3, currentPlayer); 
    if (winnerLine.length != 0) { // Gibt es einen Gewinner
        endingGame();
        return;
    }
    if (getEmptyFields().length == 0) { // Ist es ein Unentschieden
        endingGame();
        return;
    }
    changeCurrentPlayer(); 
    changeImgForUnsettedFields();
    if (isBotActive) {
        deactivateMouseover();
        botSelectField();
    }
}

function setCurrentPlayerAsFieldOwner(fieldNumber) {
    // Markiert das Feld für den aktuellen Spieler
    fieldOwnerArray[fieldNumber] = currentPlayer;
    let field = document.getElementById('field-' + fieldNumber);
    field.classList.remove('field-not-setted');
    field.classList.remove('field-invisible');
    field.classList.add('field-setted');
}

function changeCurrentPlayer() {
    currentPlayer = getAnotherPlayerNumber(currentPlayer);
}

function changeImgForUnsettedFields() {
    // Ändert die img.src passend zum aktuellen Spieler
    let unsettedFields = document.getElementsByClassName('field-not-setted');
    let playerCharacter = markerCharacters[currentPlayer - 1];

    for (let i = 0; i < unsettedFields.length; i++) {
        unsettedFields[i].innerHTML = playerCharacter;
    }
}

function getPossibleLine(wantedMarker, checkingPlayer) {
    /*  
    *   Durchläuft alle möglichen Konstellationen mit der man gewinnen kann
    *   Gibt ein Array zurück welche den parametern entspricht
    *   wantedMarker - Wie oft muss der Spieler in der Konstellation vertretten sein
    *   checkingPlayer - Welcher Spieler wird überprüft
    */
    let anotherPlayerNumber = getAnotherPlayerNumber(checkingPlayer);
    for (let i = 0; i < fieldsCombinationsToWin.length; i++) {
        let markerCounter = 0;
        for (let j = 0; j < fieldsCombinationsToWin[i].length; j++) {
            let fieldNumber = fieldsCombinationsToWin[i][j];
            // Wenn ein Feld vom anderen Spieler belegt ist, ist die Konstellation unbrauchbar
            if (isOwnerOnField(fieldNumber, anotherPlayerNumber)) {
                break;
            }
            if (isOwnerOnField(fieldNumber, checkingPlayer)) {
                markerCounter++;
            }
        }
        if (markerCounter == wantedMarker) {
            return fieldsCombinationsToWin[i];
        }
    }
    return [];
}

function activateMouseover() {
    // Aktiviert den Icon Vorschau der <img> bei :hover
    let fieldsWithMouseOver = document.getElementsByClassName('field-invisible');
    while (fieldsWithMouseOver.length > 0) {
        let field = fieldsWithMouseOver[0];
        field.classList.add('field-not-setted');
        field.classList.remove('field-invisible');
    }
}

function deactivateMouseover() {
    // Deaktiviert den Icon Vorschau der <img> bei :hover
    let fieldsWithMouseOver = document.getElementsByClassName('field-not-setted');
    while (fieldsWithMouseOver.length > 0) {
        let field = fieldsWithMouseOver[0];
        field.classList.remove('field-not-setted');
        field.classList.add('field-invisible');
    }
}

function endingGame() {
    gameOver = true;
    deactivateMouseover();
}

function getAnotherPlayerNumber(player) {
    if (player == 1) {
        return 2;
    }
    return 1;
}

function getEmptyFields() {
    let fieldsWithoutOwner = [];
    for (let i = 0; i < fieldOwnerArray.length; i++) {
        if (isFieldFree(i)) {
            fieldsWithoutOwner.push(i);
        }
    }
    return fieldsWithoutOwner;
}

function isOwnerOnField(fieldNumber, player) {
    return fieldOwnerArray[fieldNumber] == player;
}

function userCanSet() {
    // Überprüft ob das setzen einer Markiereung für den Benutzer erlaubt ist.
    return !(gameOver || (isBotActive && currentPlayer == 2));
}

function isFieldFree(fieldNumber) {
    return fieldOwnerArray[fieldNumber] == 0;
}

/* Funktionen nur für den Bot */

function botSelectField() {
    // Ablauf des Zuges vom Bot
    let field = searchFieldToSet();
    setCurrentPlayerAsFieldOwner(field);

    let winnerLine = getPossibleLine(3, currentPlayer); // Gibt es eine Siegesreihe?
    if (winnerLine.length != 0) {       // Es gibt einen Gewinner
        endingGame();
        return;
    }
    if (getEmptyFields().length == 0) {     // Ist es ein Unentschieden
        endingGame();
        return;
    }

    activateMouseover();
    changeCurrentPlayer();
    changeImgForUnsettedFields();
}

function searchFieldToSet() {
    // Es wird ein Feld gesucht welcher möglich ist (0 - 8)
    let field = -1;
    field = getFieldToWinGame();
    if (field >= 0) {
        return field;
    }
    field = getFieldToBlockingPlayer();
    if (field >= 0) {
        return field;
    }
    return getRandomFreeField();
    
}

function getFieldToWinGame() {
    // Sucht einen Feld um zu Gewinnen
    let line = getPossibleLine(2, currentPlayer)
    for (let i = 0; i < line.length; i++) {
        let fieldNumber = line[i];
        if (fieldOwnerArray[fieldNumber] == 0) {
            return fieldNumber;
        }
    }
    return -1;
}

function getFieldToBlockingPlayer() {
    // Sucht einen Feld um den Spieler zu blockieren
    let line = getPossibleLine(2, getAnotherPlayerNumber(currentPlayer))
    for (let i = 0; i < line.length; i++) {
        let fieldNumber = line[i];
        if (fieldOwnerArray[fieldNumber] == 0) {
            return fieldNumber;
        }
    }
    return -1;
}

function getRandomFreeField() {
    // Gibt eine zufällige freie Feldnummer zurück
    let freeFields = getEmptyFields();
    let randomInt = Math.floor(Math.random() * freeFields.length);
    return freeFields[randomInt];
}

