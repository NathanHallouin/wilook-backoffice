# Suggestions de vêtements par IA — Reste à faire

Suivi de la fonctionnalité « Suggestions IA » (recommandations de vêtements
selon le questionnaire client). Légende priorité : 🔴 bloquant · 🟠 important · 🟡 nice-to-have.

## ✅ Déjà fait

- [x] Moteur de scoring local (`src/services/suggestions.ts`) — couleurs, styles,
      tailles, budget, exclusion « à éviter » + composition de look. Pur et testé.
- [x] Edge Function Supabase `ai-suggestions` (Claude `claude-opus-4-8`, sortie
      structurée) avec repli automatique sur le moteur local.
- [x] UI fiche client : produits recommandés (score + justifications) + look
      complet générable, enregistrable et assigné au client.
- [x] Tests unitaires du moteur de scoring (12).
- [x] Docs (README, supabase/README, .env.example, config.toml).

## 🚀 Mise en production (ops)

- [ ] 🔴 Définir le secret : `supabase secrets set ANTHROPIC_API_KEY=sk-ant-...`
- [ ] 🔴 Déployer : `supabase functions deploy ai-suggestions`
- [ ] 🟠 Vérifier le coût/quotas Anthropic et poser une alerte de budget.
- [ ] 🟡 Tester de bout en bout sur l'environnement de staging (clé réelle).

## 🧠 Qualité des suggestions

- [ ] 🟠 **Mapping des styles** : les produits n'ont pas de champ « style »
      (`Casual`, `Chic`…). Aujourd'hui le style n'est matché que par mots-clés
      dans le texte produit. → ajouter un champ/tag `style` sur `Product`, ou une
      table de correspondance type↔style, pour un vrai matching.
- [ ] 🟠 Exploiter davantage `questionnaire_data` (morphologie, occasions,
      matières aimées/détestées, marques) côté moteur local **et** prompt Claude.
- [ ] 🟡 Pondérations configurables (poids couleur/taille/budget) au lieu de
      constantes en dur.
- [ ] 🟡 Diversité du look : éviter deux pièces de couleurs qui jurent ; règles
      d'accord colorimétrique.
- [ ] 🟡 Prendre en compte les looks déjà assignés au client (ne pas reproposer
      des pièces déjà vues).

## 🖥️ UX / Front

- [ ] 🟠 Skeleton de chargement pendant la génération (au lieu du seul spinner).
- [ ] 🟡 Persister la dernière suggestion générée (cache React Query / stockage)
      pour éviter de régénérer à chaque visite.
- [ ] 🟡 Boucle de feedback : 👍/👎 par produit pour affiner les futures suggestions.
- [ ] 🟡 Lien « Voir le produit » depuis chaque carte de suggestion.
- [ ] 🟡 Vérifier l'accessibilité (focus, aria, contraste des badges de score).
- [ ] 🟡 Permettre de filtrer/limiter la suggestion à une catégorie (ex : « juste des chaussures »).

## 🔌 Backend / Edge Function

- [ ] 🟠 Mettre en cache les réponses Claude (par hash questionnaire+catalogue)
      pour réduire coût et latence.
- [ ] 🟠 Pré-warming / `prompt caching` du prompt système (préfixe stable).
- [ ] 🟡 Limiter le débit (rate limiting) par utilisateur/IP sur la fonction.
- [ ] 🟡 Journaliser les suggestions (table `suggestions`) pour analytics et audit.
- [ ] 🟡 Suggestions basées sur l'image (vision) à partir des photos produits.

## 🧪 Tests

- [ ] 🟠 Tests de l'orchestrateur `getSuggestions` (mock `supabase.functions.invoke` :
      chemin IA, repli sur erreur, mapping des ids → produits).
- [ ] 🟠 Tests du composant `AiSuggestions` (génération, états vide/erreur,
      création de look).
- [ ] 🟡 Test e2e Playwright (mode démo) : générer des suggestions sur une fiche
      client et créer le look.
- [ ] 🟡 Test du contrat de la réponse de l'Edge Function (schéma structuré).

## 📈 Suivi / Analytics (plus tard)

- [ ] 🟡 Mesurer le taux d'adoption (looks créés depuis une suggestion).
- [ ] 🟡 A/B tester moteur local vs Claude sur la pertinence perçue.
