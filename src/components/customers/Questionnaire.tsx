import type { Customer } from '@/types'

interface QuestionnaireProps {
  customer: Customer
}

export function Questionnaire({ customer }: QuestionnaireProps) {
  const { questionnaire_data, sizes, budget, style_preferences } = customer

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
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
            <p className="text-gray-400">Non renseigné</p>
          )}
        </div>

        {/* Style preferences */}
        <div className="md:col-span-2">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Préférences de style
          </h3>
          {style_preferences ? (
            <div className="space-y-2">
              {style_preferences.styles && style_preferences.styles.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Styles</p>
                  <div className="flex flex-wrap gap-2">
                    {style_preferences.styles.map((style) => (
                      <span
                        key={style}
                        className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                      >
                        {style}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {style_preferences.colors && style_preferences.colors.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Couleurs préférées</p>
                  <div className="flex flex-wrap gap-2">
                    {style_preferences.colors.map((color) => (
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
              {style_preferences.avoid && style_preferences.avoid.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">À éviter</p>
                  <div className="flex flex-wrap gap-2">
                    {style_preferences.avoid.map((item) => (
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
            <p className="text-gray-400">Non renseigné</p>
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
