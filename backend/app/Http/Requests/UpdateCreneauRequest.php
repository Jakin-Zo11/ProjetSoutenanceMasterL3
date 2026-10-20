```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCreneauRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'reference' => [
                'sometimes',
                'string',
                'max:255',
            ],

            'heure_debut' => [
                'sometimes',
                'string',
                'regex:/^([01]\d|2[0-3]):([0-5]\d)$/',
            ],

            'heure_fin' => [
                'sometimes',
                'string',
                'regex:/^([01]\d|2[0-3]):([0-5]\d)$/',
            ],

            'jours' => [
                'sometimes',
                'array',
                'min:1',
            ],

            'type' => [
                'sometimes',
                'in:Matin,Après-midi',
            ],

            'capacite' => [
                'sometimes',
                'integer',
                'min:1',
            ],

            'actif' => [
                'sometimes',
                'boolean',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'heure_debut.regex' => 'L\'heure de début doit être au format HH:MM (exemple : 08:00).',

            'heure_fin.regex' => 'L\'heure de fin doit être au format HH:MM (exemple : 12:00).',

            'type.in' => 'Le type doit être "Matin" ou "Après-midi".',

            'capacite.integer' => 'La capacité doit être un nombre entier.',

            'capacite.min' => 'La capacité doit être supérieure à 0.',
        ];
    }
}
```