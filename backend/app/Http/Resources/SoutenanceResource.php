<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SoutenanceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'theme' => $this->theme,
            'statut' => $this->statut,
            'date_debut' => $this->date_debut?->toIso8601String(),
            'date_fin' => $this->date_fin?->toIso8601String(),
            'etudiant' => [
                'id' => $this->etudiant?->id,
                'name' => $this->etudiant?->name,
                'email' => $this->etudiant?->email,
            ],
            'salle' => [
                'id' => $this->salle?->id,
                'name' => $this->salle?->name,
                'capacity' => $this->salle?->capacity,
            ],
            'jury' => [
                'president' => $this->president ? [
                    'id' => $this->president->id,
                    'name' => $this->president->name,
                    'email' => $this->president->email,
                ] : null,
                'rapporteur' => $this->rapporteur ? [
                    'id' => $this->rapporteur->id,
                    'name' => $this->rapporteur->name,
                    'email' => $this->rapporteur->email,
                ] : null,
                'examinateur' => $this->examinateur ? [
                    'id' => $this->examinateur->id,
                    'name' => $this->examinateur->name,
                    'email' => $this->examinateur->email,
                ] : null,
            ],
        ];
    }
}