# Roadmap — WILOOK Backoffice

Feuille de route des améliorations, classée par priorité. Chaque item est ancré
sur l'état actuel du code. Tailles indicatives : **S** (≤ ½ j), **M** (1–3 j),
**L** (≥ 1 sem).

Légende statut : 🔴 critique · 🟠 important · 🟡 confort · 🟢 bonus

> **Cible : poste de travail (desktop) uniquement.** Le responsive mobile n'est
> pas un objectif — les items spécifiques au mobile sont volontairement écartés.

### ✅ Déjà livré (20/06/2026)

- **0.1 — Authentification** : Supabase Auth **email + mot de passe**.
  `AuthProvider` + `useAuth`, garde de routes `RequireAuth` (redirige vers
  `/login`), page `/login`, bouton **Déconnexion** câblé. Pas d'inscription
  publique (comptes créés à la main). Mode démo (sans Supabase) : auth bypassée.
  Un compte de test a été créé (identifiants communiqués hors-repo, **à changer**).
- **0.2 — Verrouillage RLS** : policies passées de `anon` à **`authenticated`**
  seul (tables + storage). Vérifié : anon = 0 ligne, authentifié = 5.
  `schema.sql` aligné. Images publiques toujours servies (buckets publics).

- **0.4 — ESLint** : 0 erreur (`bun run lint` vert). Effets de hydratation de
  formulaire (ProductEdit/LookEdit) refactorés en pattern « render-time guardé » ;
  `Products` migré vers `useInfiniteQuery` (plus d'accumulation manuelle ni
  d'effets) ; `any` typé dans `customers.ts`.
- **1.2 — Code-splitting** : routes en `React.lazy` + `Suspense` (sidebar
  persistante). Bundle principal 576 → 515 kB, chaque page dans son chunk.
- **1.3 — Error boundary** : `ErrorBoundary` global avec écran de secours.
- **2.2 — Confirmation de suppression** : `ConfirmProvider` + `useConfirm()`
  (promesse), câblé sur produits/looks.
- **3.3 — Toasts** : auto-dismiss (déjà présent) + plafond à 4 messages.
- **4.1 — CI** : GitHub Actions (`bun install` + lint + build) sur push/PR.
- **0.5 — Validation des formulaires** : ProductEdit valide titre/type/prix et
  prix promo < prix (messages via le prop `error` de `Input`).
- **2.1 — Pagination & recherche serveur** : `Looks` passé en infinite scroll
  (`useInfiniteLooks`) ; `Users` recherche (débouncée) + tri **résolus côté
  Supabase** — RPC `get_customers_with_stats` enrichie (`search`, `sort_column`,
  `sort_dir`), `schema.sql` mis à jour et appliqué en base.
- **1.4 — Optimisation d'images** : util `processImage` (redimensionnement à
  `IMAGE_CONFIG.MAX_HEIGHT` + ré-encodage **WebP**, fallback sûr) branché sur les
  uploads produit et vignette de look.
- **1.1 — Tests** : Vitest + Testing Library + jsdom — **58 tests** :
  utilitaires (`cn`, `processImage`, `getErrorMessage`), store snackbar,
  composants (`Button`, `EmptyState`, `SelectionBar`, `Modal`, `Combobox`),
  **hook** `useSelection`, **services en mode mock** (`products`/`looks`/
  `customers` : filtres, recherche/tri, CRUD, suppression groupée). **e2e
  Playwright** : config « démo » (`playwright.demo.config.ts`) qui lance l'app
  Supabase désactivé → **4 specs** sans secret (dashboard sans login, parcours de
  toutes les pages, drawer de filtres + Échap, sélection → barre d'actions),
  vertes en Chromium. CI : étapes **Test** + nouveau job **e2e-demo** (installe
  Chromium, lance les specs démo). Le smoke test authentifié (`smoke.spec.ts`)
  reste dispo via `E2E_EMAIL`/`E2E_PASSWORD`.
  *Reste (optionnel)* : tests des hooks data TanStack Query.
- **1.6 — Code mort résolu** : les vues `providers`/`designers`/`univers` et les RPC
  `get_all_looks`/`get_nb_looks_users` (déclarées dans `constants.ts`) sont
  désormais **implémentées** dans `schema.sql` et **appliquées en base live**
  (grants `authenticated` vérifiés). Service `fetchProviders` + hook `useProviders`
  branchés sur le formulaire produit (champ Fournisseur).
- **2.6 — Filtres produits : tailles & promo** : drawer complété (**Tailles**
  `CLOTHING_SIZES`, **Pointures** `SHOE_SIZES`, **« En promo uniquement »**),
  filtres sérialisés dans l'URL et appliqués côté Supabase (`sizes`/`shoe_sizes`
  overlap, `final_price is not null`) **et** en mode mock. Couleurs/matières du
  drawer branchées sur la source de vérité `formValues`.
- **1.5 — Gestion d'erreurs réseau** : helper `getErrorMessage` (+ tests) qui
  surface le vrai message des services au lieu de « Une erreur est survenue » ;
  câblé sur toutes les mutations (create/update/delete produits, looks,
  affectations). Les listes **Produits** et **Looks** distinguent désormais
  l'état **erreur** (message réel + bouton **Réessayer** via `refetch`) de l'état
  **vide**.
- **2.5 — Hauteur des cartes Looks** : `LookCard` passé en **hauteur
  intrinsèque** (suppression du `.h-look` fixe + `flex-1`/`mt-auto`), grille en
  `items-start` → plus de vide sous le texte quand le contenu est court.
- **2.3 — Actions groupées** : sélection multiple sur **Produits** et **Looks**
  (case sur chaque carte au survol, clic sur la carte pour (dé)sélectionner) via
  un hook réutilisable `useSelection` + composant `SelectionBar` flottant.
  **Suppression en masse** (`deleteProducts`/`deleteLooks` en une requête `.in()`
  + hooks). **Raccourcis clavier** : `Échap` annule, `Ctrl/Cmd+A` tout
  sélectionner, `Suppr`/`Retour arrière` supprime (hors champs de saisie). La
  sélection se réinitialise au changement d'onglet (Looks).
- **2.4 — Look builder** : on peut désormais **vider un slot** (bouton × au
  survol **ou** clic droit) et **annuler** la composition (bouton « Annuler la
  composition » + `Ctrl/Cmd+Z`) via un historique des états de slots, réinitialisé
  au chargement d'un look. Filtres produits du builder branchés sur `formValues`.
- **3.1 — a11y** : `Modal` accessible — `role="dialog"`, `aria-modal`,
  `aria-labelledby` (titre), **focus-trap** (Tab/Shift+Tab cyclent), focus déplacé
  dans la modale à l'ouverture et **restauré** à la fermeture, bouton de fermeture
  labellisé, Échap. Profite aussi aux confirmations (`ConfirmDialog`). Drawer de
  filtres : **Échap** pour fermer, `role="dialog"` + `aria-label`, backdrop
  `aria-hidden`. **`Combobox`** : navigation clavier (`↑`/`↓`, `Entrée` pour
  sélectionner/créer, `Échap` pour fermer, `Backspace` retire le dernier tag),
  `role="combobox"`/`listbox`/`option` + `aria-expanded`/`aria-selected`. **Menus
  de carte** (produits/looks) : `Échap` pour fermer, `aria-haspopup`/
  `aria-expanded`, `role="menu"`/`menuitem`. Couvert par 11 tests (Modal +
  Combobox).
- **3.1bis — Audit des contrastes (WCAG AA)** : ratios calculés (conversion
  oklch→sRGB) sur toutes les paires texte/fond clés, en clair **et** sombre.
  Corrigés : libellés secondaires et icônes `text-gray-400` → `gray-500`
  (≥ 4.5 / ≥ 3:1 pour les boutons-icône, WCAG 1.4.11), badge « Public »
  `emerald-500` → `emerald-700` (2.46 → 5.48). Tous les usages réels passent AA.
- **4.2 — Migrations versionnées** : `supabase/schema.sql` déplacé en
  `supabase/migrations/20260620120000_initial_schema.sql` (format Supabase CLI,
  toujours collable dans le SQL Editor). Ajout de `supabase/config.toml`
  (`db push` / `db reset` + seed auto) et `supabase/README.md` (workflow). La
  migration complète (tables + vues + RPC + RLS + storage) a été **validée de
  bout en bout et en idempotence** sur un Postgres jetable.
- **4.3 — Déploiement** : `vercel.json` (framework Vite, build `dist/`, **fallback
  SPA** pour le routage client) → import du repo + 2 variables d'env. Section
  **Deployment** ajoutée au README (Vercel + alternative Netlify/Cloudflare).
- **2.7 — Raccourcis clavier** : hook `useGlobalShortcuts` (intégré au `Layout`)
  — navigation type Gmail **`g` puis `d`/`p`/`l`/`u`** (Dashboard/Produits/Looks/
  Users) et **`?`** ouvre une modale d'aide (`ShortcutsHelp`) qui recense aussi
  les raccourcis contextuels (`Ctrl/⌘+A`, `Suppr`, `Échap`, `Ctrl/⌘+Z`). Ignorés
  pendant la saisie / avec un modificateur. Couvert par 6 tests unitaires + 1 e2e.
- **3.4 — Favicon & branding** : `favicon.svg` vérifié — c'est un vrai logo
  WILOOK multicolore (conservé tel quel). `index.html` complété : `description`,
  Open Graph (`og:title`/`description`/`type`/`locale`), `application-name`,
  `apple-touch-icon`. (`lang="fr"`, `theme-color` et `<title>` déjà en place.)
- **3.2 — Mode sombre** : thème sombre via inversion de la rampe de gris + token
  `--color-surface` sous la classe `.dark` (les utilitaires `bg-gray/text-gray/
  border-gray` flippent automatiquement ; `bg-white` → `bg-surface` partout,
  `text-white` intact). Store `useThemeStore` (clair / sombre / **système**),
  persistance `localStorage`, application avant le 1ᵉʳ paint + suivi des
  changements OS ; **bouton bascule** (lune/soleil) dans la navbar. Overlays
  passés en `bg-black/*`, shimmer du skeleton atténué. **Vérifié visuellement**
  (captures Playwright : dashboard, produits, drawer — clair & sombre) + 3 tests
  sur le store. Contrastes audités (voir 3.1bis).

> **Hors-roadmap, en support des tests** : source de vérité typée des
> vocabulaires produit (`src/config/formValues.ts` : catégories→types, couleurs,
> matières, détails, tailles/pointures), formulaire produit entièrement câblé
> dessus (Détails, Pointures, Fournisseur, Description ajoutés), et générateur de
> données de masse `supabase/seed_bulk.sql` (500 produits / 200 clients / 120
> looks, images picsum) — **chargé et vérifié en base live**.

> **Statut global** : tous les items des phases 0 → 4 sont livrés. Seul reste
> **0.3 — rotation du mot de passe DB**, qui est une action manuelle côté
> Supabase (Settings → Database → Reset password) et ne peut pas être faite
> depuis le repo. Les tableaux ci-dessous décrivent l'état *initial* du projet et
> sont conservés pour mémoire.

---

## Phase 0 — Sécurité & correctness (avant toute mise en prod)

| # | Item | Pourquoi | Taille | Prio |
|---|------|----------|--------|------|
| 0.1 | **Authentification** | Le bouton « Déconnexion » (`Navbar.tsx`) est inerte ; il n'existe aucune page de login. N'importe qui ayant l'URL accède au backoffice. Ajouter Supabase Auth (email magic-link ou password), une route `/login`, un guard de routes, et brancher le logout. | M | 🔴 |
| 0.2 | **Verrouiller les RLS** | `supabase/schema.sql` ouvre l'accès `anon` complet (lecture/écriture) sur toutes les tables et buckets. À restreindre aux utilisateurs authentifiés (rôle `authenticated`) une fois 0.1 en place, idéalement avec un rôle « admin/staff ». | S | 🔴 |
| 0.3 | **Roter le mot de passe DB** | Le mot de passe Postgres a transité en clair pendant le setup. À régénérer (Settings → Database → Reset password). | S | 🔴 |
| 0.4 | **Corriger les 8 erreurs ESLint** | `bun run lint` échoue (8 erreurs préexistantes). Bloque tout futur gating CI. | S | 🟠 |
| 0.5 | **Validation des formulaires** | `ProductEdit`/`LookEdit` n'ont pas de validation (prix négatif, titre vide hors `required` natif, `final_price > price`…). Ajouter une validation (zod) + messages d'erreur via le prop `error` déjà présent sur `Input`. | M | 🟠 |

---

## Phase 1 — Fondations & qualité

| # | Item | Pourquoi | Taille | Prio |
|---|------|----------|--------|------|
| 1.1 | **Tests** | Aucun test dans le repo. Mettre en place Vitest + Testing Library (composants UI, hooks de données) et quelques tests e2e Playwright (déjà dispo en local) sur les parcours clés. | L | 🟠 |
| 1.2 | **Code-splitting / lazy routes** | Bundle JS unique de ~576 kB (warning Vite). Le README annonce du « lazy loading » non implémenté. Passer les routes en `React.lazy` + `Suspense`. | S | 🟠 |
| 1.3 | **Error boundaries** | Une erreur de rendu casse toute l'app (écran blanc). Ajouter un `ErrorBoundary` global + un fallback par route. | S | 🟠 |
| 1.4 | **Optimisation d'images à l'upload** | `IMAGE_CONFIG` (resize, WebP, thumbnail) est défini dans `constants.ts` mais **non utilisé** : `UploadImages` envoie les fichiers bruts. Générer une miniature + conversion WebP côté client avant upload. | M | 🟠 |
| 1.5 | **Gestion d'erreurs réseau** | Les services lèvent des `Error` génériques, l'UI affiche « Une erreur est survenue ». Surfacer le vrai message et distinguer les états erreur / retry / vide (les hooks TanStack Query exposent déjà `error`). | S | 🟡 |
| 1.6 | **Nettoyer le code mort** | `RPC_FUNCTIONS.GET_ALL_LOOKS`, `GET_NB_LOOKS_USERS` et les vues `providers`/`designers`/`univers` sont déclarés mais jamais utilisés (ni créés en base). Décider : implémenter ou supprimer. | S | 🟡 |

---

## Phase 2 — Ergonomie & fonctionnalités

| # | Item | Pourquoi | Taille | Prio |
|---|------|----------|--------|------|
| 2.1 | **Pagination Looks & recherche serveur Users** | `Looks` ne charge que la page 1 (pas de « charger plus »). `Users` trie/filtre **uniquement la page déjà chargée** (tri & recherche client-side) → résultats incomplets au-delà de la 1ʳᵉ page. Passer tri/recherche/pagination côté Supabase (RPC ou query). | M | 🟠 |
| 2.2 | **Confirmation de suppression** | Les suppressions (produit/look) sont immédiates, sans confirmation. Ajouter une `Modal` de confirmation (le composant existe déjà). | S | 🟠 |
| 2.3 | **Actions groupées** | Pas de sélection multiple. Permettre suppression/édition en masse de produits/looks (souris + raccourcis clavier). | M | 🟡 |
| 2.4 | **Look builder** | Le drag-and-drop n'a pas de « vider un slot » ni d'annulation. Améliorer l'ergonomie de composition (clic-droit, raccourcis). | M | 🟡 |
| 2.5 | **Hauteur des cartes Looks** | `h-look` fixe laisse un vide sous le texte quand le contenu est court. Passer à une hauteur intrinsèque ou remplir l'espace (ex : aperçu produits). | S | 🟡 |
| 2.6 | **Filtres produits : tailles & promo** | Le drawer filtre catégorie/type/marque/couleur/matière/prix mais pas les tailles ni « en promo ». Compléter. | S | 🟡 |
| 2.7 | **Raccourcis clavier** | Backoffice desktop : gagner en productivité avec des raccourcis (recherche `/`, nouveau produit, navigation). | M | 🟢 |

---

## Phase 3 — Polish & accessibilité

| # | Item | Pourquoi | Taille | Prio |
|---|------|----------|--------|------|
| 3.1 | **Audit a11y** | Vérifier focus-trap des `Modal`/drawer, rôles ARIA, navigation clavier des menus de carte et du combobox, contrastes. | M | 🟡 |
| 3.2 | **Mode sombre** | Les tokens de design (`@theme` dans `index.css`) facilitent un thème sombre via variables CSS. | M | 🟢 |
| 3.3 | **Toasts : auto-dismiss & file** | Les snackbars ne se ferment pas seuls et s'empilent sans limite. Ajouter un timeout + cap. | S | 🟡 |
| 3.4 | **Favicon & branding** | Vérifier `favicon.svg`, ajouter une vraie identité WILOOK (couleurs déjà posées). | S | 🟢 |

---

## Phase 4 — Infra & DevOps

| # | Item | Pourquoi | Taille | Prio |
|---|------|----------|--------|------|
| 4.1 | **CI** | Pipeline (GitHub Actions) : `bun install`, `bun run lint`, `bun run build`, tests. Bloquer les merges en échec. | S | 🟠 |
| 4.2 | **Migrations versionnées** | Le schéma vit dans `supabase/schema.sql` (appliqué à la main). Passer à des migrations versionnées (Supabase CLI) pour la reproductibilité. | M | 🟡 |
| 4.3 | **Déploiement** | Pas de cible de déploiement. Configurer un hébergeur (Vercel/Netlify/Cloudflare) avec les variables d'env. | S | 🟡 |

---

## Ordre conseillé

1. **0.1 → 0.4** (sécurité : sans ça, pas de prod possible)
2. **1.2, 1.3, 4.1** (quick wins qualité : split, error boundary, CI)
3. **2.1, 2.2** (les manques fonctionnels les plus visibles : pagination/recherche serveur, confirmation de suppression)
4. **1.1, 1.4** (tests + images)
5. Le reste au fil de l'eau.
