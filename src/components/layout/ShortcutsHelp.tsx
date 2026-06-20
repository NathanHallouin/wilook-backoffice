import { Modal } from '@/components/ui'

interface ShortcutsHelpProps {
  isOpen: boolean
  onClose: () => void
}

const GROUPS: Array<{ title: string; items: Array<{ keys: string[]; label: string }> }> = [
  {
    title: 'Navigation',
    items: [
      { keys: ['g', 'd'], label: 'Tableau de bord' },
      { keys: ['g', 'p'], label: 'Produits' },
      { keys: ['g', 'l'], label: 'Looks' },
      { keys: ['g', 'u'], label: 'Utilisateurs' },
    ],
  },
  {
    title: 'Listes (produits / looks)',
    items: [
      { keys: ['Ctrl/⌘', 'A'], label: 'Tout sélectionner' },
      { keys: ['Suppr'], label: 'Supprimer la sélection' },
      { keys: ['Échap'], label: 'Annuler la sélection' },
    ],
  },
  {
    title: 'Éditeur de look',
    items: [{ keys: ['Ctrl/⌘', 'Z'], label: 'Annuler la dernière composition' }],
  },
  {
    title: 'Général',
    items: [{ keys: ['?'], label: 'Afficher cette aide' }],
  },
]

export function ShortcutsHelp({ isOpen, onClose }: ShortcutsHelpProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Raccourcis clavier" size="sm">
      <div className="space-y-5">
        {GROUPS.map((group) => (
          <div key={group.title}>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              {group.title}
            </h4>
            <ul className="space-y-2">
              {group.items.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <span className="text-gray-600">{item.label}</span>
                  <span className="flex gap-1">
                    {item.keys.map((k) => (
                      <kbd
                        key={k}
                        className="rounded border border-gray-300 bg-gray-50 px-1.5 py-0.5 text-xs font-medium text-gray-700"
                      >
                        {k}
                      </kbd>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Modal>
  )
}
