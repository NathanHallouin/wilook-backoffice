import type { Customer } from '@/types'

interface QuestionnaireProps {
  customer: Customer
}

/** Coerce a value into a string array — tolerates a single string or junk. */
const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string')
  if (typeof value === 'string' && value.trim()) return [value]
  return []
}

export function Questionnaire({ customer }: QuestionnaireProps) {
  const { questionnaire_data, sizes, budget, style_preferences } = customer

  // Defensive: real questionnaire data may not be a clean string[] (e.g. a
  // single value), so normalize before rendering.
  const styles = toStringArray(style_preferences?.styles)
  const colors = toStringArray(style_preferences?.colors)
  const avoid = toStringArray(style_preferences?.avoid)
  const hasStylePrefs = styles.length > 0 || colors.length > 0 || avoid.length > 0

  return (
    <div className="rounded-2xl border border-gray-200 bg-surface shadow-card p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Questionnaire
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Budget */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Budget</h3>
          <p className="text-gray-900">
            {budget ? `${budget}€` : 'Non renseigné'}
          </p>
        </div>

        {/* Sizes */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Tailles</h3>
          {sizes ? (
            <div className="flex flex-wrap gap-2">
              {sizes.top && (
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                  Haut: {sizes.top}
                </span>
              )}
              {sizes.bottom && (
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                  Bas: {sizes.bottom}
                </span>
              )}
              {sizes.shoes && (
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                  Chaussures: {sizes.shoes}
                </span>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Non renseigné</p>
          )}
        </div>

        {/* Style preferences */}
        <div className="md:col-span-2">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Préférences de style
          </h3>
          {hasStylePrefs ? (
            <div className="space-y-2">
              {styles.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Styles</p>
                  <div className="flex flex-wrap gap-2">
                    {styles.map((style) => (
                      <span
                        key={style}
                        className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-sm"
                      >
                        {style}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {colors.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Couleurs préférées</p>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <span
                        key={color}
                        className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {avoid.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">À éviter</p>
                  <div className="flex flex-wrap gap-2">
                    {avoid.map((item) => (
                      <span
                        key={item}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Non renseigné</p>
          )}
        </div>

        {/* Additional questionnaire data */}
        {questionnaire_data && Object.keys(questionnaire_data).length > 0 && (
          <div className="md:col-span-2">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Données supplémentaires
            </h3>
            <pre className="text-xs bg-gray-50 p-3 rounded-lg overflow-auto">
              {JSON.stringify(questionnaire_data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
