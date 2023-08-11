"use strict"

class Die {
    #img;
    #value;

    constructor(img, value) {
        this.#img = img;
        this.#value = value;
    }

    get img() {return this.#img;}
    set img(img) {this.#img = img;}

    get value() {return this.#value;}
    set value(value) {this.#value = value;}
}

class Dice {
    #dice = [
        new Die("images/Die1.PNG", 1),
        new Die("images/Die2.PNG", 2),
        new Die("images/Die3.PNG", 3),
        new Die("images/Die4.PNG", 4),
        new Die("images/Die5.PNG", 5),
        new Die("images/Die6.PNG", 6),
    ];
    #diceRoll;
    #diceCount;

    roll(numOfDice) {
        this.#diceRoll = [];                     // Represents the total count of the roll
        this.#diceCount = [0, 0, 0, 0, 0, 0];   // [1 Die, 2 Die, 3 Die, 4 Die, 5 Die, 6 Die]
        for (let i = 0; i < numOfDice; i++) {
            this.#diceRoll[i] = this.#dice[Math.floor(Math.random() * 6)];

            if (this.#diceRoll[i].value == 1)
                this.#diceCount[0]++;
            else if (this.#diceRoll[i].value == 2)
                this.#diceCount[1]++;
            else if (this.#diceRoll[i].value == 3)
                this.#diceCount[2]++;
            else if (this.#diceRoll[i].value == 4)
                this.#diceCount[3]++;
            else if (this.#diceRoll[i].value == 5)
                this.#diceCount[4]++;
            else
                this.#diceCount[5]++;
        }
    }

    get diceRoll() {
        this.#diceRoll.sort(function(a, b) {return a.value - b.value});
        return this.#diceRoll;
    }

    get diceCount() {return this.#diceCount;}
}

class Player {
    #name;
    #pts = 0;
    #wins = 0;
    #num;
    #ptsInRound = 0;
    #ptsInRoll = 0;
    #farkles = 0;

    constructor(name, num) {
        this.#name = name;
        this.#num = num;
    }

    get name() {return this.#name;}
    set name(name) {this.#name = name;}

    get pts() {return this.#pts;}
    set pts(pts) {this.#pts = pts;}

    get wins() {return this.#wins;}
    set wins(wins) {this.#wins = wins;}

    get num() {return this.#num;}
    set num(num) {this.#num = num;}

    get farkles() {return this.#farkles;}
    set farkles(farkles) {this.#farkles = farkles;}

    get ptsInRound() {return this.#ptsInRound;}
    set ptsInRound(ptsInRound) {this.#ptsInRound = ptsInRound;}

    get ptsInRoll() {return this.#ptsInRoll;}
    set ptsInRoll(ptsInRoll) {this.#ptsInRoll = ptsInRoll;}
}

class FarklePoint {
    #label;
    #pts;
    #pattern;
    #classHTML;
    #achieved;
    #images;

    constructor(label, pts, pattern, classHTML, achieved) {
        this.#label = label;
        this.#pts = pts;
        this.#pattern = pattern;
        this.#classHTML = classHTML;
        this.#achieved = achieved;
        this.#images = $("div." + classHTML).html().replaceAll("30", "40");
    }

    get label() {return this.#label;}
    set label(label) {this.#label = label;}

    get pts() {return this.#pts;}
    set pts(pts) {this.#pts = pts;}

    get classHTML() {return this.#classHTML;}
    set classHTML(classHTML) {this.#classHTML = classHTML;}

    get achieved() {return this.#achieved;}
    set achieved(achieved) {this.#achieved = achieved;}

    get images() {return this.#images;}
    set images(images) {this.#images = images;}

    checkForPoint(diceCount) {
        let numChecks = this.#pattern.length;
        let checks = 0;
        let start = 0;
        let pass = false;

        for (let j in this.#pattern) {
            if (pass)
                break;
            for (let k = start; k < diceCount.length; k++) {
                if (diceCount[k] == this.#pattern[j]) {
                    checks++;
                    if (this.#pts > 1000 || this.#label == "4 of a Kind")
                        start = k + 1;
                    else if (k == j)
                        numChecks = 1;
                    break;
                } else if (this.#pts < 200) {
                    if (diceCount[0] >= 1 && this.#label == "Ones")
                        pass = true;
                    else if (diceCount[4] >= 1 && this.#label == "Fives")
                        pass = true;
                    break;
                }
            }
        }
        if (numChecks <= checks || pass)
            this.#achieved = true;
        else
            this.#achieved = false;
    }
}

let farkleLegend
let gameDice = new Dice();
let players = [];
let turnIndex = 0;
let pointsToWin;
let gamesPlayed = 0;

$(document).ready(function() {
    getRandomHW();
    farkleLegend = createFarklePoints();
})

function StartGame() {
    let tempPlayers = getPlayers();
    if (tempPlayers.length > 0) {
        resetGameBoard();
        resetPlayers(true);
        resetPlayersCSS();

        $("#stay").attr("disabled", true);

        players = tempPlayers;

        pointsToWin = getPointsToWin();
        updatePlayerInfo(players);
        updateGameStats();

        rollDiceCup(6, true);
    }
}

function Stay() {
    if (players[turnIndex].ptsInRound > 0 || players[turnIndex].ptsInRoll > 0) {
        players[turnIndex].farkles = 0;
    } else
        $(".three-farkles").css("background-color", "#D8C3A5");

    players[turnIndex].pts += players[turnIndex].ptsInRound + players[turnIndex].ptsInRoll;
    players[turnIndex].ptsInRoll = 0;
    players[turnIndex].ptsInRound = 0;

    turnIndex++;
    if (players.length - 1 < turnIndex)
        turnIndex = 0;
    updatePlayerInfo(players);
    resetGameBoard();

    checkIfWon(players);

    rollDiceCup(6, true);
}

function getPlayers() {
    let players = [];
    let numPlayers
    while (true) {
        numPlayers = prompt("Please enter how many players you want to play with (2-4):");
        if (numPlayers != null && isNaN(numPlayers))
            alert("Invalid entry.");
        else if (numPlayers != null && (parseInt(numPlayers) < 2 || parseInt(numPlayers) > 4 )) {
            alert("Invalid amount of players.");
        }
        else
            break;
    }

    for (let i = 1; i <= parseInt(numPlayers); i++) {
        while (true) {
            players[i - 1] = new Player(prompt(`What is Player #${i}'s name: `), i);

            if (players[i - 1].name == null)
                alert("Please enter a valid name.")
            else
                break;
        }
    }

    return players;
}

function getPointsToWin() {
    while (true) {
        let promptPoints = parseInt(prompt("Please enter the amount of points to win: "));

        if (isNaN(promptPoints))
            alert("Invalid entry.");
        else if (promptPoints < 0)
            alert("Points to win cannot be below zero.");
        else if (promptPoints > 50000)
            alert("Points to win cannot be above 50,000.")
        else
            return promptPoints;
    }
}

function updatePlayerInfo(players) {
    for (let i in players) {
        $("#player" + players[i].num).css("background-color", "#D8C3A5");
        $("#name" + players[i].num).html(`Name: ${players[i].name}`).css("color", "black");
        $("#points" + players[i].num).html(`Points: ${players[i].pts}`).css("color", "black");
        $("#farkles" + players[i].num).html(`Farkles in a row: ${players[i].farkles}`).css("color", "black");
        $("#wins" + players[i].num).html(`Wins: ${players[i].wins}`).css("color", "black");
    }

    $("#player" + players[turnIndex].num).css("background-color", "#E98074");
}

function updateGameStats() {
    $("#games-played").html(`Game: #${++gamesPlayed}`);
    $("#points-to-win").html(`Points to win: ${pointsToWin}`);
}

function rollDiceCup(numOfDice, delay) {
    $("#pTurn").html(`${players[turnIndex].name}'s turn (Player #${turnIndex + 1})`);

    if (numOfDice > 0) {
        $("#dice-cup").html(`<img src="images/DiceCupRoll.png" height="50" width="50" alt="Dice Cup Roll">`).css("cursor", "pointer");
        $("#dice-cup").hover(function () {$("#dice-cup").css("background-color", "darkgrey")},
            function () {$("#dice-cup").css("background-color", "#8E8D8A")});
        $("#dice-cup").on("click", function () {
            $("#rolls").html("");
            players[turnIndex].ptsInRound += players[turnIndex].ptsInRoll;

            gameDice.roll(numOfDice);
            let diceRoll = gameDice.diceRoll;
            let diceCount = gameDice.diceCount;
            let largestTime = updateRollImages(diceRoll, delay);

            removeDiceCupButton();
            setTimeout(function() {
                $("#stay").removeAttr("disabled");
                checkForAllPoints(diceCount, farkleLegend);
                updateFarklePointLegend();

                let allHoldIDs = setupGameBoard(diceCount);
                verifyCheckboxes(allHoldIDs);

            }, largestTime)
        });
    }
}

function checkForAllPoints(diceCount, legend) {
    for (let i in legend)
        legend[i].checkForPoint(diceCount);
}

function updateFarklePointLegend() {
    for (let i in farkleLegend) {
        if (farkleLegend[i].achieved)
            $("." + farkleLegend[i].classHTML).css("background-color", "yellow");
        else
            $("." + farkleLegend[i].classHTML).css("background-color", "#D8C3A5");
    }
}

function setupGameBoard(diceCount) {
    updateGameBoard(players[turnIndex].ptsInRound);
    $("#rolls").html("");

    let allHoldIDs = [];
    let amountAchieved = 0;
    for (let i in farkleLegend) {
        if (farkleLegend[i].achieved) {
            let holdID = "hold" + i;
            allHoldIDs.push(holdID);
            $("#rolls").append(
                `<label class="hold" id="${holdID}">
                <input type="checkbox" name="chk-holds" value="${holdID}">
                ${farkleLegend[i].label}${farkleLegend[i].images}${farkleLegend[i].pts} pts`
            );
            if (i == 12 && diceCount[0] >= 2) {
                $("#rolls").append(`<input type="number" id="spin${holdID}" min="1" max="2" value="1"">`);
                $(`#spin${holdID}`).keyup(function() {verifySpinner(`spin${holdID}`);}).focusout(function() {verifySpinner(`spin${holdID}`);});
            }
            else if (i == 13 && diceCount[4] >= 2) {
                $("#rolls").append(`<input type="number" id="spin${holdID}" min="1" max="2" value="1"">`);
                $(`#spin${holdID}`).keyup(function() {verifySpinner(`spin${holdID}`);}).focusout(function() {verifySpinner(`spin${holdID}`);});
            }
            $("#rolls").append(`</label><br>`);

            amountAchieved++;
        }
    }
    checkForFarkle(amountAchieved);

    return allHoldIDs;
}

function verifySpinner(id) {
    let obj = $("#" + id);

    if (obj.val() < 1 || obj.val() == "") {
        obj.val(1);
    }
    if (obj.val() > 2) {
        obj.val(2);
    }
    if (obj.val().length > 1) {
        obj.val(obj.val().substring(0, 1));
    }
}

function checkForFarkle(amountAchieved) {
    if (amountAchieved == 0) {
        $("#rolls").append(
            `<p>Uh oh, you got a <span>Farkle</span> and lost all of your points this round!</p>
                <p>You must now "Stay" to pass your turn.</p>`
        );
        players[turnIndex].farkles++;
        if (players[turnIndex].farkles == 3) {
            players[turnIndex].ptsInRound = -1000;
            players[turnIndex].farkles = 0;
            $(".three-farkles").css("background-color", "yellow");
        }
        else {
            players[turnIndex].ptsInRound = 0;
        }
        players[turnIndex].ptsInRoll = 0;
        updateGameBoard(players[turnIndex].ptsInRound);
    }
}

function updateRollImages(diceRoll, delay) {
    $("#stay").attr("disabled", true);
    for (let i = 1; i <= 6; i++) {
        $("#die" + (i)).html(`<span class="blank50x50"></span>`).css({
            "background-color": "#8E8D8A",
            "border" : "none"
        });
    }

    let largestTime = 0;
    for (let i in diceRoll) {
        if (delay) {
            let rollTime = Math.floor((Math.random() * 1500) + 500);
            if (rollTime > largestTime)
                largestTime = rollTime;
            $("#die" + (++i)).html(`<img src="images/RollingDie.gif" width="50" height="50" alt="rolling die">`).css({
                "background-color": "#D8C3A5",
                "border": "none"
            });

            setTimeout(function () {
                $("#die" + (i)).html(`<img src="${diceRoll[--i].img}" width="50" height="50" alt="${diceRoll[i].value} die">`);
            }, rollTime);
        }
        else {
            $("#die" + (++i)).html(`<img src="${diceRoll[--i].img}" width="50" height="50" alt="${diceRoll[i].value} die">`).css({
                "background-color": "#D8C3A5",
                "border": "none"
            });
        }
    }

    if (diceRoll.length > 0 && diceRoll.length < 6) {
        $("#die" + diceRoll.length).css({
            "border-right" : "solid",
            "border-width" : "2px"
        });
    }

    return largestTime;
}

function updateGameBoard(pointsInRound) {
    $("#roll-points").html(`Points this roll: 0`);
    $("#round-points").html(`Points this round: ${pointsInRound}`);
}

function verifyCheckboxes(allHoldIDs) {
    let pointsInRoll = 0;
    if (allHoldIDs.length > 0) {
        let rollLegend = createFarklePoints();
        let toggle = [];
        for (let i in allHoldIDs) {
            toggle.push(true);
            $(`input[value='${allHoldIDs[i]}']`).click(function () {
                let legendIndex = parseInt(allHoldIDs[i].replace("hold", ""));
                let spinNum = $(`#spin${allHoldIDs[i]}`).val();
                if (isNaN(spinNum))
                    spinNum = 1;

                if (toggle[i]) {
                    toggle[i] = false;
                    if (legendIndex == 12) {
                        pointsInRoll += farkleLegend[legendIndex].pts * spinNum;
                        $(`#spin${allHoldIDs[i]}`).attr("disabled", true);
                    }
                    else if (legendIndex == 13) {
                        pointsInRoll += farkleLegend[legendIndex].pts * spinNum;
                        $(`#spin${allHoldIDs[i]}`).attr("disabled", true);
                    }
                    else
                        pointsInRoll += farkleLegend[legendIndex].pts;
                }
                else {
                    toggle[i] = true;
                    if (legendIndex == 12) {
                        pointsInRoll -= farkleLegend[legendIndex].pts * spinNum;
                        $(`#spin${allHoldIDs[i]}`).removeAttr("disabled");
                    }
                    else if (legendIndex == 13) {
                        pointsInRoll -= farkleLegend[legendIndex].pts * spinNum;
                        $(`#spin${allHoldIDs[i]}`).removeAttr("disabled");
                    }
                    else
                        pointsInRoll -= farkleLegend[legendIndex].pts;
                }

                checkForAllPoints(updateDiceCount(), rollLegend);
                disableCheckboxes(allHoldIDs, rollLegend);

                $("#roll-points").html(`Points this roll: ${pointsInRoll}`);
                players[turnIndex].ptsInRoll = pointsInRoll;
            });
        }
    }
}

function disableCheckboxes(allHoldIDs, rollLegend) {
    for (let j in allHoldIDs) {
        let legendIndex = parseInt(allHoldIDs[j].replace("hold", ""));
        if (!rollLegend[legendIndex].achieved && !$(`input[value='${allHoldIDs[j]}']`).is(":checked")) {
            $(`input[value='${allHoldIDs[j]}']`).attr("disabled", true);
            $("#" + allHoldIDs[j]).css("opacity", "0.5");
        }
        else {
            $(`input[value='${allHoldIDs[j]}']`).removeAttr("disabled");
            $("#" + allHoldIDs[j]).css("opacity", "1");
        }
    }
}

function updateDiceCount() {
    let newDiceCount;
    let currentlyChecked = [];

    $.each($(`input[name='chk-holds']:checked`), function() {
        currentlyChecked.push($(this).val());
    });

    if (currentlyChecked.length > 0) {
        newDiceCount = Array.from(gameDice.diceCount);
        for (let i in currentlyChecked) {
            let legendIndex = parseInt(currentlyChecked[i].replace("hold", ""));
            let spinNum = $(`#spinhold${legendIndex}`).val();
            if (isNaN(spinNum))
                spinNum = 1;

            newDiceCount = subtractPointFromRoll(legendIndex, newDiceCount, spinNum);
        }
        removeDiceCupButton();
        rollDiceCup(addRemainingDice(newDiceCount), true);
    }
    else {
        newDiceCount = gameDice.diceCount;
        removeDiceCupButton();
    }

    return newDiceCount;
}


function subtractPointFromRoll(legendIndex, diceCount, spinNum) {
    if (legendIndex == 0 || legendIndex == 1 || legendIndex == 3 || legendIndex == 4) {
        diceCount = [0, 0, 0, 0, 0, 0];
    }
    else if (legendIndex == 2) {
        for (let i in diceCount) {
            if (diceCount[i] == 5) {
                diceCount[i] -= 5;
            }
        }
    }
    else if (legendIndex == 5) {
        for (let i in diceCount) {
            if (diceCount[i] == 4) {
                diceCount[i] -= 4;
            }
        }
    }
    else if (legendIndex >= 6 && legendIndex <= 11) {
        for (let i in diceCount) {
            if (diceCount[i] >= 3) {
                diceCount[i] -= 3;
                break;
            }
        }
    }
    else if (legendIndex == 12) {
        diceCount[0] -= spinNum;
    }
    else if (legendIndex == 13) {
        diceCount[4] -= spinNum;
    }

    return diceCount;
}

function checkIfWon(players) {
    let winner = null;
    for (let i in players) {
        if (players[i].pts >= pointsToWin) {
            winner = players[i];
            break;
        }
    }

    if (winner != null) {
        winner.wins++;
        turnIndex = winner.num - 1;
        updatePlayerInfo(players);
        updateGameStats();
        $("#rolls").html(
            `<p>Someone reached the points to win (${pointsToWin})!</p>
                    <p>Player #${winner.num} (${winner.name}) <span>wins!</p>
        `);

        setTimeout(playAgain, 250);
    }
}

function playAgain() {
    let userInput = window.confirm("Continue playing with the same players and points to win?");

    if (userInput) {
        resetGameBoard();
        resetPlayers();
        updatePlayerInfo(players);
        rollDiceCup(6, true);
    }
    else
        location.reload();
}

function addRemainingDice(newDiceCount) {
    let sum = 0;
    for (let i in newDiceCount)
        sum += newDiceCount[i];

    return sum;
}

function removeDiceCupButton() {
    $("#dice-cup").html(`<img src="images/DiceCup.png" height="50" width="50" alt="Dice-cup">`).css("cursor", "default");
    $("#dice-cup").hover(function() {$("#dice-cup").css("background-color", "#8E8D8A")},
        function() {$("#dice-cup").css("background-color", "#8E8D8A")})
    $("#dice-cup").off("click");
}

function resetPlayers() {
    turnIndex = 0;
    for (let i in players) {
            players[i].name = "";
            players[i].pts = 0;
            players[i].ptsInRound = 0;
            players[i].ptsInRoll = 0;
            players[i].farkles = 0;
    }
}
function resetPlayersCSS(){
    $(".player").css("background-color", "#8E8D8A");
    $(".player p").css("color", "rgba(0,0,0,0.4)");

}

function resetGameBoard() {
    gameDice.roll(6);
    updateRollImages(gameDice.diceRoll, false);
    $("#rolls").html("");
    updateGameBoard(0);
    checkForAllPoints([0, 0, 0, 0, 0, 0], farkleLegend);
    updateFarklePointLegend();
    removeDiceCupButton();
}

function createFarklePoints() {
    return [
        new FarklePoint("6 of a Kind", 3000, [6], "six-any", false),
        new FarklePoint("2 Triplets", 2500, [3, 3], "two-triplets", false),
        new FarklePoint("5 of a Kind", 2000, [5], "five-any", false),
        new FarklePoint("Straight", 1500, [1, 1, 1, 1, 1, 1], "straight", false),
        new FarklePoint("3 Pairs", 1500, [2, 2, 2], "three-pairs", false),
        new FarklePoint("4 of a Kind", 1000, [4], "four-any", false),
        new FarklePoint("3 Ones", 1000, [3, -1, -1, -1, -1, -1], "three-ones", false),
        new FarklePoint("3 Sixes", 600, [-1, -1, -1, -1, -1, 3], "three-sixes", false),
        new FarklePoint("3 Fives", 500, [-1, -1, -1, -1, 3, -1], "three-fives", false),
        new FarklePoint("3 Fours", 400, [-1, -1, -1, 3, -1, -1], "three-fours", false),
        new FarklePoint("3 Threes", 300, [-1, -1, 3, -1, -1, -1], "three-threes", false),
        new FarklePoint("3 Twos", 200, [-1, 3, -1, -1, -1, -1], "three-twos", false),
        new FarklePoint("Ones", 100, [1, -1, -1, -1, -1, -1], "ones", false),
        new FarklePoint("Fives", 50, [-1, -1, -1, -1, 1, -1], "fives", false)
    ];
}

function getRandomHW() {
    let randHW = [
        "http://45.55.136.114/~zholly01/HW1/",
        "http://45.55.136.114/~zholly01/HW2/",
        "http://45.55.136.114/~zholly01/HW3/",
        "http://45.55.136.114/~zholly01/HW4/",
        "http://45.55.136.114/~zholly01/HW5/",
        "http://45.55.136.114/~nmalmberg01/CSC2200%20Homework/HW_1/MLB_Standings.html",
        "http://45.55.136.114/~nmalmberg01/CSC2200%20Homework/HW2/Malmberg_HW2.html",
        "http://45.55.136.114/~nmalmberg01/CSC2200%20Homework/HW3/HW3_Form.html",
        "http://45.55.136.114/~nmalmberg01/CSC2200%20Homework/HW4/HW_PriceChecker.html",
        "http://45.55.136.114/~nmalmberg01/CSC2200%20Homework/HW5/Craps_GameHW.html"
    ];

    let randIndex = Math.floor(Math.random() * 10);
    $("#hw").html(`<a href="${randHW[randIndex]}" target="_blank" onclick="getRandomHW()">HW</a>`);
}