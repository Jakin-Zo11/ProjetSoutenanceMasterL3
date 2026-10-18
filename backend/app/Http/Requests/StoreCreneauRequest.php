<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCreneauRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'reference' => [
                'required',
                'string',
                'max:255',
                'unique:creneaux,reference',
            ],
            'heure_debut' => [
                'required',
                'string',
                'date_format:H:i',
            ],
            'heure_fin' => [
                'required',
                'string',
                'date_format:H:i',
            ],
            'jours' => [
                'required',
                'array',
                'min:1',
            ],
            'type' => [
                'required',
                'in:Matin,Après-midi',
            ],
            'capacite' => [
                'required',
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
            'reference.required' => 'La référence est obligatoire.',
            'reference.unique' => 'Cette référence existe déjà.',
            'heure_debut.required' => 'L\'heure de début est obligatoire.',
            'heure_debut.date_format' => 'L\'heure de début doit être au format HH:MM (exemple : 08:00).',
            'heure_fin.required' => 'L\'heure de fin est obligatoire.',
            'heure_fin.date_format' => 'L\'heure de fin doit être au format HH:MM (exemple : 12:00).',
            'jours.required' => 'Au moins un jour est obligatoire.',
            'jours.array' => 'Les jours doivent être fournis sous forme de liste.',
            'jours.min' => 'Vous devez sélectionner au moins un jour.',
            'type.required' => 'Le type est obligatoire.',
            'type.in' => 'Le type doit être "Matin" ou "Après-midi".',
            'capacite.required' => 'La capacité est obligatoire.',
            'capacite.integer' => 'La capacité doit être un nombre entier.',
            'capacite.min' => 'La capacité doit être supérieure à 0.',
            'actif.boolean' => 'Le statut doit être un booléen.',
        ];
    }
}