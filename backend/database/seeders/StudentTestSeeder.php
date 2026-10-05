<?php

namespace Database\Seeders;

use App\Models\Formation;
use App\Models\Promotion;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Crée l'étudiant de test avec le matricule 001I24.
 *
 * Idempotent : peut être relancé sans créer de doublon.
 *
 * Lancer seul :
 *   php artisan db:seed --class=StudentTestSeeder
 */
class StudentTestSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Formation IG (doit déjà exister via DemoDataSeeder, mais on la garantit)
        $formation = Formation::firstOrCreate(
            ['code' => 'IG'],
            [
                'name'        => 'Informatique de Gestion',
                'description' => 'Filière Informatique de Gestion',
            ]
        );

        // 2. Promotion 2024-2025 pour IG
        $promotion = Promotion::firstOrCreate(
            ['formation_id' => $formation->id, 'year' => '2024-2025'],
            ['name' => 'Promotion 14']
        );

        // 3. Étudiant de test — updateOrCreate sur matricule (idempotent)
        $student = User::updateOrCreate(
            ['matricule' => '001I24'],
            [
                'name'         => 'RAKOTO Jean',
                'email'        => 'jean.rakoto@example.com',
                'password'     => Hash::make('password123'),
                'telephone'    => '+261 34 00 000 01',
                'promotion_id' => $promotion->id,
                'status'       => 'actif',
            ]
        );

        // 4. Rôle étudiant
        if (! $student->hasRole('etudiant')) {
            $student->assignRole('etudiant');
        }

        $this->command->info(
            "✓ Étudiant de test : matricule=001I24 | id={$student->id} | email={$student->email}"
        );
    }
}
