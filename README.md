# minou-amine.github.io

Page personnelle statique, servie par **GitHub Pages** à l'adresse
<https://minou-amine.github.io/>.

- Aucun build, aucune dépendance : `index.html` + `assets/`.
- La liste des projets est lue en direct depuis l'API publique de GitHub
  (`api.github.com/users/minoU-amine/repos`), donc un simple `git push` suffit
  à mettre la page à jour.
- Bilingue FR / AR avec bascule et sens de lecture RTL.

## Modifier

```bash
git clone https://github.com/minoU-amine/minou-amine.github.io.git
cd minou-amine.github.io
# éditer index.html / assets/styles.css / assets/app.js
git commit -am "update"
git push      # la page est republiée automatiquement (~1 min)
```

## Publier un nouveau projet

Créer un dépôt public sur le compte : il apparaît automatiquement dans la
section « Projets ». Les forks et les dépôts archivés sont masqués.
