# Demande 01
Créer un cadran de montre pebble en js pour la pebble time 2.
le cadran affiche quatre zones carrés séparés par une ligne.
chaque zone correspond à une tranche de 6h : 
- zone haute gauche : de 0H à 5H59
- zone basse gauche : de 6H à 11H59
- zone haute droite : de 12h à 17H59
- zone basse droite : de 18 à 23h59H
le cadran affiche progressivement un carré par tranche de 10 minutes, chaque heure s'affiche sur une ligne.
-dans la tranche de 10 minutes en cours, la largeur du carré courant est proportionnelle aux minutes écoulées (minute 00 = 0/10, minute 01 = 1/10, ... minute 09 = 9/10)
- les carrés sont de couleurs différentes (le code hexa doit être stocké dans un array afin de pouvoir modifier les couleurs facilement) aléatoires
-les blocs doivent être représentés sous forme de carrés
- implémenter une bordure de couleur (paramétrable dans une variable) qui borde les 4 carrés
