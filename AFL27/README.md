# AFL Footy Tipping 2027

Mobile-first browser prototype.

## First-game margin
For the first match of each home-and-away round, users must pick the winning team and a predicted winning margin in points. In this prototype the margin is used as a tie-breaker and does not add bonus points.

## Local preview
Run `python3 -m http.server 8080` from this folder and open http://localhost:8080.

## Public profiles
Members can open read-only profiles for other users. Email and mobile remain private.

## Draw rule
If a match is drawn, a tip for either team is correct. The same rule keeps a Streak alive. The official first-game margin is 0.
