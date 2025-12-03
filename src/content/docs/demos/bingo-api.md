---
title: Bingo Cards API
description: This API represents a BINGO game where the numbers are drawn from the game and Bingo Cards can be associated with a game. Modelled after the Deck of Cards API (https://deckofcardsapi.com).
draft: true
---

Each BINGO game represents a single stack of numbers to be drawn for the game. You can add/associate Bingo Cards with a game. BINGO games are preserved for up to 2 hours before they are discarded.

## An API

> This API is intended for use in Human-Facing applications. API calls are rate-limited to prevent abuse or use in fully-automated applications.

The API allows for the following actions:

- [Accessing a game](#)
- [Drawing numbers](#)
- [Accessing Bingo cards](#)

## Access a Game

```http
https://bingocardsapi.com/api/game/<<game_id>>/
```

```json title="Response:"
{
    "success": true,
    "game_id": "3p40paa87x90",
    "remaining": 75
}
```

### Create a New Game

```http
https://bingocardsapi.com/api/game/new/?numbers=1,2,3,4
```

Add *`numbers`* as a GET parameter if you want to pre-set the stack of 

## Draw Numbers

----

## 🤔 Concepts:

- [ ] Bingo Card API - Generate *x* number of Bingo Cards `https://bingocardsapi.com/api/`
  - Fashion it in a way that is similar to the *DeckOfCardsAPI*
    - All games are more "disposable" than the *DeckOfCardsAPI* - they exist for 3 hours at most, because A) BINGO games are short and B) I have no idea how much the service might be used/over-used
    - "new" game `/game/new/` - always randomizes the order of the numbers
      - `/game/new/?numbers=1,2,3,4,5` - creates a new game with these starting numbers; invalid/duplicate/extra numbers are discarded; missing numbers are added in a randomized order
    - "existing" game `/game/{game_id}/`
    - "draw" a number `/game/{game_id}/draw/?count=1` where `count` defaults to 1 - pops the number(s) from the stack - cannot be "replenished"
    - "add" a bingo card `/game/{game_id}/card/{card_name}/add/?numbers=24,73,8` 
      - numbers can be 0 to 25, with a free space in the middle
      - missing numbers are filled with random, not duplicate numbers
      - extra numbers under any `B-I-N-G-O ` are discarded/ignored
      - BINGO slots are filled in-order
      - less than 5 numbers for the `N` slot results in a "free-space" value: `'FREE'`
    - "view" a bing card `/game/{game_id}/card/{card_name}/view`
    - BingoGameAPI.com/game/{game_id}/
