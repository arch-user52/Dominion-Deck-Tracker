//Bugs with deck counter:
//--fortress maybe still broken
//--treasure map?
//--images for 3+ word cards
//--Possession trashing
//--"gain from trash" noble brigand, etc

//helper function to wrap pluralize with special dominion cases
function pluralize_dominion(card_name){
    //hard coded special cases
    var special_cases = {        
        "Coins of the Realm":"Coin of the Realm",
        "Horns of Plenty":"Horn of Plenty",
        "Rats":"Rats",
        "Gardens":"Gardens",
        "Nobles":"Nobles",
        "Smugglers":"Smugglers",
        "Goons":"Goons",
        "Horse Traders":"Horse Traders",
        "Followers":"Followers",
        "Jacks of all Trades":"Jack of all Trades",
        "Ill-Gotten Gains":"Ill-Gotten Gains",
        "Stables":"Stables",
        "Spoils":"Spoils",
        "Hunting Grounds":"Hunting Grounds",
        "Survivors":"Survivors",
        "Distant Lands":"Distant Lands",
        "Haunted Woods":"Haunted Woods",
        "Settlers":"Settlers",
        "Necropolis":"Necropolis",
        "Rocks":"Rocks",
        "Catacombs":"Catacombs",
        "Fairgrounds":"Fairgrounds",
        "Oasis":"Oasis",
        "Platina":"Platinum",
        "Crossroads":"Crossroads"
    }
    if (card_name in special_cases){
        return special_cases[card_name];
    }
    return pluralize.singular(card_name);
}

//helper function to create deck html
function make_deck_html(decks){
    var deck_html = "";
    for (var deck in decks){
        deck_html += "<div style='height:50%;'><h3 style='background-color:white;'>&nbsp"+deck+"'s Deck</h3><table style='background-color:black;width:100%;'>";
        for (var card in decks[deck]){
            if (decks[deck][card] > 0){
                deck_html += "<tr  style='color:white;text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black,1px 1px 3px black;overflow: hidden;text-overflow: ellipsis; vertical-align: middle;border-style: solid;border-width: 1px 0px 1px 0px;border-color: black;line-height: 30px;height:30px;'><td>&nbsp"+decks[deck][card]+"</td><td style='background-repeat: no-repeat;background-size: 100% auto;background-position: right center; background-image: url(\"https://dominion.games/images/cards/art/"+get_card_set(card).toLowerCase().replace(" ","-")+"/"+card.toLowerCase().replace(" ","-").replace("'","")+".jpg\");'>&nbsp"+card+"</td></tr>";
            }
        }
        deck_html += "</table></div>";
    }
    return deck_html;
}

//function to print out the game log
function print_log(){
    //print log to tracker bar
    //var log_text = document.getElementsByClassName("game-log")[0].innerHTML.replace(/<[^>]+>/g, '').trim();
    var log_lines = document.getElementsByClassName("actual-log")
    var decks = {};

    for (var key in log_lines){
        line_text = log_lines[key].innerText;
        if (line_text != null){
            //parse starting cards
            //parse gains
            gains_test = line_text.search(" gains ");
            starts_test = line_text.search(" starts with ");
            trash_test = line_text.search(" trashes ");
            return_test = line_text.search(" returns ");
            receive_test = line_text.search(" receives ");
            pass_test = line_text.search(" passes ");
            put_test = line_text.search(" puts ");
            //ignore puts in not fortress case for now
            if (line_text.search(!" Fortress " > 0)){
                put_test = 0;
            }
            if(gains_test > 0 || starts_test > 0 || trash_test > 0 || return_test > 0 || receive_test > 0 || pass_test > 0 || put_test > 0){
                //regex to match gaining text
                var text_match = [];
                if (gains_test > 0){
                    text_match = line_text.match("([-A-Za-z\.]*?)(?: buys and)* gains ((?:[,and]*[an0-9]* [-A-Za-z\' ]*)*)\.");
                }            
                else if (starts_test > 0){
                    text_match = line_text.match("([-A-Za-z\.]*?) starts with ((?:[,and]*[an0-9]* [-A-Za-z\' ]*)*)\.");
                }      
                else if (trash_test > 0){
                    text_match = line_text.match("([-A-Za-z\.]*?) trashes ((?:[,and]*[an0-9]* [-A-Za-z\' ]*)*)\.");
                    //salt special case
                    if (key >= 2 && log_lines[key-2].innerText.search(" buys a Salt the Earth")>0){
                        continue;
                    }
                    //lurker special case
                    if (key >= 2 && log_lines[key-1].innerText.search(" plays a Lurker")>0){
                        continue;
                    }
                    //gladiator special case
                    if (key >= 3 && log_lines[key-2].innerText.search(" plays a Gladiator")>0){
                        continue;
                    }
                }
                else if (return_test > 0){
                    //split up by two types of formatting
                    if (line_text.search(" to the ")>0){
                        text_match = line_text.match("([-A-Za-z\.]*?) returns ((?:[,and]*[an0-9]* [-A-Za-z\' ]*?)*)(?: to the [-A-Za-z ]*?pile)\.");
                    }
                    else {
                        text_match = line_text.match("([-A-Za-z\.]*?) returns ((?:[,and]*[an0-9]* [-A-Za-z\' ]*)*)\.");
                    }
                    
                }
                else if (receive_test > 0){
                    text_match = line_text.match("([-A-Za-z\.]*?) receives ((?:[,and]*[an0-9]* [-A-Za-z\' ]*)*)\.");
                }
                else if (pass_test > 0){
                    text_match = line_text.match("([-A-Za-z\.]*?) passes ([an0-9]* [-A-Za-z\' ]*?) to ([-A-Za-z\.]+?)\.")
                }
                else if (put_test > 0){
                    text_match = line_text.match("([-A-Za-z\.]*?) puts ((?:[,and]*[an0-9]* [-A-Za-z\' ]*?)*) into their hand\.")
                }

                if (text_match != null && text_match[1] != 'undefined')
                {
                    //create player deck if it doesnt exist
                    if (!(text_match[1] in decks)){
                        decks[text_match[1]] = {};
                    }
                        
                    //split matches
                    text_matches = text_match[2].split(/, | and /);
                    for (var match in text_matches){
                        //find card quantifier
                        quantifier = text_matches[match].split(" ")[0];
                        if (quantifier == "an" || quantifier == "a"){
                            quantifier = "1";
                        }
                        quantifier = parseInt(quantifier);
                        //get card name from match by removing quantifier
                        card_name = text_matches[match].split(" ").slice(1).join(" ");
                        //plural words to singular
                        card_name = pluralize_dominion(card_name);
                        //create card in deck if it doesnt exist
                        if (!(card_name in decks[text_match[1]])){
                            decks[text_match[1]][card_name] = 0;
                        }
                        //pass card to player
                        if (pass_test>0){
                            target_player = text_match[3];
                            if (!(card_name in decks[text_match[3]])){
                                decks[text_match[3]][card_name] = 0;
                            }
                            //increment card in deck
                            decks[text_match[3]][card_name]+=quantifier;
                        }      
                        //change to negative for trashes or returns
                        if (trash_test>0 || return_test>0 || pass_test>0){
                            quantifier=quantifier*-1;
                        }
                        //increment card in deck
                        decks[text_match[1]][card_name]+=quantifier;
                    }

                }
            }
        }
    }
    // print out decks in a pretty way
    $("#tracker-div").html(make_deck_html(decks));
};

function waitForElementToDisplay(selector, time) {
    //if game log, update tracker
    if($(selector)!=null) {
        print_log();
    }
    //if no game log, hide tracker
    else{
        $("#tracker-div").hide();
    }
    setTimeout(function() {
        waitForElementToDisplay(selector, time);
    }, time);
}


$("body").on("mouseenter", ".tracker-div", function(event) {
    $(".tracker-div").fadeTo(0,.5);
});

$("body").on("mouseleave", ".tracker-div", function(event) {
    $(".tracker-div").fadeTo(0,1);
});

//set up empty tracker div
var trackerDiv = document.createElement('div');
trackerDiv.style.cssText = 'opacity:.8;pointer-events: none;left:65%;height:100%;width:10%;position:fixed!important;z-index:100;overflow:auto;font-size: 20px;color: rgba(0, 0, 0, 1)';
trackerDiv.id = 'tracker-div';
trackerDiv.class = "tracker-div";
$('body').append(trackerDiv);
//$("#body").hover($("#tracker-div").fadeTo(0,.5),$("#tracker-div").fadeTo(0,1));
//start timeout

waitForElementToDisplay(".game-log",200);