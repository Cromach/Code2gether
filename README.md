# Code2gether

Online Code Editor est un projet réalisé en Node.js et en javascript.
Ce projet se base sur l'éditeur de code Monaco-editor de Microsoft pour créer un éditeur de code en ligne pouvant être modifié ou visonné en direct par plusieurs utilisateurs en même temps.

![Interface de la page](https://i.imgur.com/Xz31hPB.png)
> Interface de la page

Lorsque l'utilisateur se connecte au site, s'il n'a pas précisé de salle, l'application génère une salle dont il sera l'hôte. Une fois la salle générée, n'importe quel utilisateur peut la rejoindre grâce à son URL.
Dans la sidebar, les utilisateurs ont accès à des options pour configurer l'éditeur de code, un chat textuel, la liste des utilisateurs et la possibilité de télécharger le code.

![Liste des utilisateurs](https://i.imgur.com/4cbgsec.png)
> Liste des utilisateurs

Dans la liste des utilisateurs, on peut voir quels sont les utilisateurs qui se sont connectés dans la salle, leur pseudo, s'ils ont les droits d'éditions et s'ils sont encore connectés dans la salle.
C'est ici que l'hôte peut choisir qui a le droit d'éditer le code et si les nouveaux arrivants ont automatiquement le droit d'édition.

Les utilisateurs sont gérés grâce aux cookies, ainsi si utilisateur se reconnecte après être parti de la salle, il retrouve son pseudo et les mêmes droits d'édition qu'il avait quand il était parti.
